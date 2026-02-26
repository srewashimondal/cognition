import os
import json
import tempfile
from openai import OpenAI
from firebase_admin import storage
import subprocess
from app.models.schemas import *
import base64
import uuid

class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def download_video_from_storage(self, video_path: str) -> str:
        """
        Download video from Firebase Storage to a temporary file
        video_path should be like: "trainingVideos/video1.mp4"
        """
        bucket = storage.bucket()
        blob = bucket.blob(video_path)
        
        suffix = os.path.splitext(video_path)[1] 
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        temp_path = temp_file.name
        temp_file.close()
        
        blob.download_to_filename(temp_path)
        
        return temp_path

    def extract_audio_from_video(self, video_path: str) -> str:
        """
        Extract audio from video file using ffmpeg
        Returns path to temporary audio file
        """
        audio_fd, audio_path = tempfile.mkstemp(suffix='.mp3')
        os.close(audio_fd)

        
        command = [
            'ffmpeg',
            '-i', video_path,
            '-vn',  
            '-acodec', 'mp3',
            '-ab', '192k',
            '-ar', '44100',
            '-y',  
            audio_path
        ]
        
        subprocess.run(command, check=True)
        
        return audio_path

    def get_video_duration(self, video_path: str) -> float:
        """
        Get video duration in seconds using ffprobe
        """
        command = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            video_path
        ]
        
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    
    def generate_section_chat_response(
            self,
            transcript_segments: list,
            section_summary: dict,
            conversation_history: list,
            user_message: str
        ):

        section_start = section_summary["start"]
        section_end = section_summary["end"]

        section_transcript = [
            seg for seg in transcript_segments
            if section_start <= seg["start"] <= section_end
        ]

        transcript_text = " ".join([seg["text"] for seg in section_transcript])

        system_prompt = f"""
    You are Cognition, an AI retail training assistant.

    You are helping an employee understand this training section.

    SECTION TITLE:
    {section_summary['title']}

    SECTION SUMMARY:
    {section_summary['canonicalSummary']['content']}

    SECTION TRANSCRIPT:
    {transcript_text}

    Rules:
    - Stay focused on this section only.
    - Be clear, supportive, and professional.
    - If the question is unrelated, gently redirect.
    """

        messages = [{"role": "system", "content": system_prompt}]

        for msg in conversation_history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        messages.append({
            "role": "user",
            "content": user_message
        })

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.5
        )

        return response.choices[0].message.content



    def transcribe_audio_with_timestamps(self, audio_path: str) -> list:
        """
        Transcribe audio using Whisper API with word-level timestamps
        Returns list of transcript segments matching TranscriptType format
        """
        with open(audio_path, "rb") as audio_file:
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["segment"]
            )
        
        transcript_segments = []
        
        if hasattr(transcript, 'segments') and transcript.segments:
            for segment in transcript.segments:
                transcript_segments.append({
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text.strip()
                })

        else:
            transcript_segments.append({
                "start": 0.0,
                "end": 0.0,
                "text": transcript.text
            })
        
        return transcript_segments

    def process_video_for_transcript(self, video_storage_path: str) -> dict:
        """
        Complete pipeline: download video, extract audio, transcribe
        
        Args:
            video_storage_path: Path in Firebase Storage (e.g., "trainingVideos/video1.mp4")
        
        Returns:
            dict with transcript segments and duration
        """
        temp_files = []
        
        try:
            print(f"Downloading video from Storage: {video_storage_path}")
            video_path = self.download_video_from_storage(video_storage_path)
            temp_files.append(video_path)
            
            print("Getting video duration...")
            duration = self.get_video_duration(video_path)
            print(f"Video duration: {duration} seconds")
            
            print("Extracting audio...")
            audio_path = self.extract_audio_from_video(video_path)
            temp_files.append(audio_path)
            
            print("Transcribing audio with Whisper...")
            transcript_segments = self.transcribe_audio_with_timestamps(audio_path)
            
            print(f"Generated {len(transcript_segments)} transcript segments")
            
            return {
                "transcript": transcript_segments,
                "duration": duration
            }
            
        finally:
            for temp_file in temp_files:
                try:
                    if os.path.exists(temp_file):
                        os.unlink(temp_file)
                        print(f"Cleaned up: {temp_file}")
                except Exception as e:
                    print(f"Error cleaning up {temp_file}: {e}")

    def generate_section_summaries(self, transcript: str, video_duration: float):
        """
        Generate section summaries with timestamps
        """
        prompt = f"""
            You are an AI training assistant analyzing a video transcript.

            Video Duration: {video_duration} seconds

            Split the following transcript into 3-6 logical training sections.
            Each section should cover a distinct topic or concept.

            For each section:
            1. Estimate when it starts and ends (in seconds)
            2. Create a clear, descriptive title
            3. Write a 2-3 sentence summary of the key points

            Return output in this EXACT JSON format:
            {{
            "sections": [
                {{
                "title": "Introduction to Customer Service",
                "start": 0,
                "end": 120,
                "summary": "Overview of customer service principles. Discussion of the importance of first impressions and active listening."
                }},
                {{
                "title": "Handling Difficult Customers",
                "start": 120,
                "end": 300,
                "summary": "Strategies for de-escalating tense situations. Techniques for maintaining professionalism under pressure."
                }}
            ]
            }}

            Rules:
            - First section MUST start at 0
            - Last section MUST end at {video_duration}
            - Sections should not overlap
            - Each section should be 1-3 minutes long
            - Provide realistic timestamps based on content flow

            Transcript:
            {transcript}
        """

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        return response.choices[0].message.content

    def process_video_for_summaries(self, video_storage_path: str) -> dict:
        """
        Complete pipeline: download video, extract audio, transcribe, generate summaries
        
        Args:
            video_storage_path: Path in Firebase Storage (e.g., "trainingVideos/video1.mp4")
        
        Returns:
            dict with sections and transcript
        """
        temp_files = []
        
        try:
            print(f"Downloading video from Storage: {video_storage_path}")
            video_path = self.download_video_from_storage(video_storage_path)
            temp_files.append(video_path)
            
            print("Getting video duration...")
            duration = self.get_video_duration(video_path)
            print(f"Video duration: {duration} seconds")
            
            print("Extracting audio...")
            audio_path = self.extract_audio_from_video(video_path)
            temp_files.append(audio_path)
            
            print("Transcribing audio...")
            transcript_segments = self.transcribe_audio_with_timestamps(audio_path)
            
            full_transcript_text = " ".join([seg["text"] for seg in transcript_segments])
            
            print("Generating section summaries...")
            raw_json = self.generate_section_summaries(full_transcript_text, duration)
            parsed_json = json.loads(raw_json)
            
            return {
                "sections": parsed_json["sections"],
                "transcript": transcript_segments,
                "duration": duration
            }
            
        finally:
            for temp_file in temp_files:
                try:
                    if os.path.exists(temp_file):
                        os.unlink(temp_file)
                except Exception as e:
                    print(f"Error cleaning up {temp_file}: {e}")

    def generate_document_summary(self, extracted_text: str):
        """
        Summarize a reference document while preserving important constraints.
        Returns structured JSON usable for AI module editing context.
        """

        prompt = f"""
        You are an AI retail training analyst.

        Analyze the following document and extract structured training-relevant information.

        Your goal is NOT to compress aggressively.
        Your goal is to preserve:
        - Operational constraints
        - Policy rules
        - Customer interaction requirements
        - Compliance requirements
        - Behavioral expectations

        Return output in EXACT JSON format:

        {{
            "summary": "2-4 paragraph structured summary of the document",
            "key_policies": ["policy 1", "policy 2"],
            "operational_constraints": ["constraint 1", "constraint 2"],
            "customer_interaction_rules": ["rule 1", "rule 2"],
            "compliance_requirements": ["requirement 1", "requirement 2"]
        }}

        Rules:
        - Do not hallucinate.
        - Only use information from the document.
        - If a category does not exist, return an empty list.
        - Keep wording professional and precise.
        - Preserve critical numeric thresholds, time limits, refund rules, etc.

        Document:
        {extracted_text}
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"}
            )

            parsed = json.loads(response.choices[0].message.content)
            return parsed

        except Exception as e:
            return {"status": "error", "detail": str(e)}

    def generate_module_edits(
        self,
        module: dict,
        user_message: str,
        scope: Optional[List[str]] = None,
        reference_summaries: Optional[List[dict]] = None
    ):

        module_id = module.get("id")
        lessons = module.get("lessons", [])

        editing_entire_module = False
        if not scope or module_id in scope:
            editing_entire_module = True
        else:
            lessons = [l for l in lessons if l["id"] in scope]

        scope_mode = "ENTIRE MODULE" if editing_entire_module else "SPECIFIC LESSONS ONLY"

        ai_context = {
            "module": {
                "id": module.get("id"),
                "title": module.get("title"),
                "difficulty": module.get("difficulty"),
                "description": module.get("description"),
            },
            "lessons": lessons,
            "reference_documents": reference_summaries or []
        }

        prompt = f"""
        You are Cognition's AI module editor.

        The user wants to modify a retail training module.

        USER REQUEST:
        {user_message}

        EDIT SCOPE:
        {scope_mode}

        CURRENT MODULE STATE:
        {json.dumps(ai_context, indent=2)}

        LIST OF ALL RETAIL SKILLS:
        [
            "Spatial Reasoning",
            "Department Zones",
            "Store Layout Awareness",
            "Aisle Navigation",
            "Shortest Path Routing",
            "SKU Recognition",
            "Brand Familiarity",
            "Category Grouping",
            "Product Substitution",
            "Cross-Selling",
            "Upselling",
            "Greeting & Engagement",
            "Active Listening",
            "Clarifying Questions",
            "Tone",
            "Professional Communication",
            "Confidence Under Pressure",
            "Stock Awareness",
            "Out-of-Stock Handling",
            "Inventory Lookup",
            "Backroom Coordination",
            "Discontinued Item Handling",
            "POS Navigation",
            "Transaction Accuracy",
            "Payment Processing",
            "Returns & Exchanges",
            "Discount Application",
            "Hazard Identification",
            "Emergency Response",
            "Policy Compliance",
            "Loss Prevention Awareness",
            "Escalation Protocols",
            "Task Prioritization",
            "Multitasking",
            "Time Management",
            "Interrupt Handling",
            "Workload Balancing",
            "Decision Making",
            "Situational Awareness",
            "Critical Thinking",
            "Adaptability",
            "De-escalation",
            "Empathy",
            "Stress Management",
            "Customer De-escalation",
            "Handling Difficult Customers",
            "Policy Explanation",
            "Conflict Resolution",
            "Accuracy vs Speed Tradeoff"
        ]

        Your task:
        - Analyze the request
        - Suggest precise updates
        - Only modify what is necessary
        - Do not hallucinate new lessons unless explicitly requested
        - Use the reference document summaries to ensure all updates remain compliant with company policies.
        - If a requested change conflicts with a reference document, prioritize the reference document.
        - Do not invent policies that are not present in the reference documents.
        - If no relevant reference information applies, proceed normally
        - Reference documents act as compliance guardrails.
        - Do not apply changes that violate reference policies.
        - If the user's request may involve updating skills, then only provide skill updates within the specified list of retail skills.
        - Unless the user specifies replacing skills, do NOT replace any skills already in the lesson state; instead, add skills to the state.

        If the specified scope is SPECIFIC LESSONS ONLY:
        - Do not modify module-level fields.
        - Do not modify lessons not included in the provided scope.

        Return output in EXACT JSON format:

        {{
        "message": {{
            "role": "assistant",
            "content": "Comprehensive explanation of exact changes, bulleting each change, and providing a justification at the end."
        }},
        "updates": {{
            "module": null OR {{
            "title": "optional new title",
            "difficulty": "optional new difficulty"
            }},
            "lessons": [
            {{
                "id": "lesson_id",
                "title": "optional new title",
                "skills": ["optional skill list"],
                "lessonAbstractInfo": {{
                "simulationModel": "...",
                "targetBehaviors": "...",
                "contextualConstraints": "...",
                "evaluationSignals": "...",
                "adaptionLogic": "..."
                }}
            }}
            ]
        }}
        }}

        Rules:
        - Only include fields that change.
        - If no module-level changes are needed, return null for module.
        - If no lesson changes are needed, return empty list.
        - Preserve lesson IDs exactly.
        - Do not invent IDs.
        - If the user request is unclear, ask for clarification instead of guessing.
    """

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        parsed = json.loads(response.choices[0].message.content)

        if "updates" not in parsed:
            parsed["updates"] = {
                "module": None,
                "lessons": []
            }

        if not editing_entire_module:
            parsed["updates"]["module"] = None

            allowed_ids = set(scope)
            parsed["updates"]["lessons"] = [
                l for l in parsed["updates"].get("lessons", [])
                if l.get("id") in allowed_ids
            ]
        
        if "message" in parsed:
            parsed["message"]["id"] = str(uuid.uuid4())

        validated = AIEditResponse(**parsed)
        return validated.model_dump()
    


    def analyze_map(self, file_contents):
        base64_img = base64.b64encode(file_contents).decode("utf-8")
        prompt = """
            You are analyzing a retail store layout map for AI-driven retail training simulation.

            Your task is to extract STRUCTURED SPATIAL INTELLIGENCE.

            Focus on:
            - Department zones exactly as labeled
            - Entrances and exits
            - Restrooms
            - Back-of-house areas
            - Narrow corridors or choke points
            - High-density retail clusters
            - Spatial adjacency relationships

            Return JSON in EXACT format:

            {
            "zones": [
                {
                "id": "lowercase_snake_case_identifier",
                "display_name": "Exact name from map if visible",
                "type": "department | entrance | restroom | back_of_house | seasonal | cafe | other",
                "relative_position": "top_left | top_center | top_right | center_left | center | center_right | bottom_left | bottom_center | bottom_right",
                "adjacent_to": ["zone_id_1", "zone_id_2"],
                "traffic_level": "low | medium | high",
                "visibility": "low | medium | high"
                }
            ],
            "bottlenecks": [
                {
                "location_description": "Describe narrow corridors, choke points, or congestion areas",
                "zones_involved": ["zone_id_1", "zone_id_2"]
                }
            ],
            "customer_flow": {
                "primary_entry_points": ["zone_id"],
                "typical_path_patterns": [
                "Describe likely movement patterns between major clusters"
                ],
                "high_density_areas": ["zone_id"]
            },
            "training_constraints": [
                "Examples: limited supervisor visibility in back areas",
                "long walking distance between warehouse and front",
                "customer congestion near seasonal display"
            ]
            }

            Rules:
            - Use exact names from the map where visible.
            - Do NOT hallucinate any areas that are not labeled (i.e. checkout areas).
            - Only include zones clearly visible.
            - Infer adjacency based strictly on visible walls and pathways.
            - If uncertain, omit.
            - Do not invent information.
            """

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_img}"
                            },
                        },
                    ],
                }
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )

        parsed = json.loads(response.choices[0].message.content)
        return parsed
