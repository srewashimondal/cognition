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

        The user wants to modify a retail training simulation module.

        A simulation module is a structured set of exactly three simulation lessons where a retail employee practices realistic, scenario-based interactions within a store environment.

        Each lesson represents a progressive training experience that builds specific retail competencies such as customer engagement, operational execution, policy compliance, and situational decision-making.

        The purpose of a simulation module is to:
        - Reinforce real-world store behaviors
        - Develop practical retail skills through applied scenarios
        - Improve confidence under realistic constraints
        - Prepare employees to handle customer interactions, operational challenges, and unexpected situations effectively

        Each lesson should:
        - Focus on a distinct but related competency
        - Increase in complexity or situational nuance
        - Simulate realistic store contexts (time pressure, customer moods, inventory issues, policy conflicts, etc.) 
        
        Here, a module is already defined and provided. The user wants you to make relevant changes based on their request and the reference summaries attached. 

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

        LIST OF ALL DIFFICULTY LEVELS:
        [
            "Beginner",
            "Intermediate",
            "Advanced"
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
        - If the scope mode is ENTIRE MODULE and the user asks to update the difficulty level, ONLY update it with the specified list of difficulty levels.

        If the specified scope is SPECIFIC LESSONS ONLY:
        - Do not modify module-level fields.
        - Do not modify lessons not included in the provided scope.

        LESSON ABSTRACT INFO STRUCTURE:

        If modifying lessonAbstractInfo, treat it as a simulation design blueprint.

        The fields are defined as:

        simulationModel:
        Describes how the scenario operates — setting, customer profile, operational conditions, and decision structure. This should define how the simulation unfolds.

        targetBehaviors:
        Specific observable behaviors the employee must demonstrate. These should reflect applied retail competencies, not vague traits.

        contextualConstraints:
        Realistic limitations that create decision-making pressure (inventory limits, policy restrictions, emotional customers, time pressure, etc.).

        evaluationSignals:
        Concrete performance indicators that would be measured in the simulation (policy correctness, tone appropriateness, transaction accuracy, escalation timing, etc.).

        adaptionLogic:
        How the simulation dynamically responds to employee decisions (customer mood changes, manager intervention, alternative solution unlocking, escalation branching, etc.).

        IMPORTANT EDIT RULES FOR LESSON ABSTRACT INFO:
        - Only modify lessonAbstractInfo if explicitly requested or clearly implied.
        - If updating lessonAbstractInfo, only change the necessary fields.
        - Do NOT erase existing fields unless the user explicitly requests a rewrite.
        - Preserve the structural integrity of the simulation.
        - Edits must maintain realistic progression and behavioral consistency.

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

    def generate_module(self, user_message: str, reference_summaries: Optional[List[dict]] = None):
         
        ai_context = {
            "reference_documents": reference_summaries or []
        }

        prompt = f"""
        You are Cognition's AI module creator.

        The user wants to create a brand new retail training simulation module.
        
        A simulation module is a structured set of exactly three simulation lessons where a retail employee practices realistic, scenario-based interactions within a store environment.

        Each lesson represents a progressive training experience that builds specific retail competencies such as customer engagement, operational execution, policy compliance, and situational decision-making.

        The purpose of a simulation module is to:
        - Reinforce real-world store behaviors
        - Develop practical retail skills through applied scenarios
        - Improve confidence under realistic constraints
        - Prepare employees to handle customer interactions, operational challenges, and unexpected situations effectively

        Each lesson should:
        - Focus on a distinct but related competency
        - Increase in complexity or situational nuance
        - Simulate realistic store contexts (time pressure, customer moods, inventory issues, policy conflicts, etc.) 

        Each lesson must include a fully completed "lessonAbstractInfo" object.

        The lessonAbstractInfo represents the structural blueprint of the simulation. It defines how the scenario operates, what behaviors are being trained, and how performance is evaluated.

        The fields are defined as follows:

        simulationModel:
        A detailed description of the scenario structure. This should explain:
        - The setting (store environment, department, time of day)
        - The customer profile and emotional state
        - The operational conditions (inventory status, staffing, time pressure)
        - The decision-making environment the employee is placed in
        This should describe how the simulation unfolds, not just the topic.

        targetBehaviors:
        A clear explanation of the specific observable behaviors the employee is expected to demonstrate during the simulation.
        These should reflect applied skills (e.g., active listening, policy explanation, escalation protocol usage).
        Avoid vague traits like “be professional.” Describe measurable behaviors.

        contextualConstraints:
        Realistic limitations or pressures that make the scenario challenging.
        Examples:
        - Limited inventory
        - Strict store policy
        - High customer volume
        - Time pressure
        - Emotional customer
        Constraints should force decision-making tradeoffs.

        evaluationSignals:
        Explain how performance would be assessed within the simulation.
        Examples:
        - Correct policy application
        - Tone appropriateness
        - De-escalation success
        - Transaction accuracy
        - Time efficiency
        These should describe measurable signals, not vague judgments.

        adaptionLogic:
        Describe how the simulation responds to the employee’s choices.
        Examples:
        - Customer mood escalates or calms
        - Manager intervention is triggered
        - Inventory system updates
        - Alternative solutions unlock
        This defines how the simulation dynamically adjusts based on decisions.

        USER REQUEST:
        {user_message}

        REFERENCE DOCUMENT:
        {json.dumps(ai_context["reference_documents"], indent=2)}

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

        LIST OF ALL DIFFICULTY LEVELS:
        [
            "Beginner",
            "Intermediate",
            "Advanced"
        ]

        CRITICAL REQUIREMENTS:
        - Create EXACTLY 3 lessons.
        - The lessons array MUST contain exactly 3 objects.
        - Do NOT create more or fewer than 3 lessons.
        - Fill out ALL fields completely.
        - All lessons must have:
            - orderNumber
            - title
            - relevant skills (from allowed list only)
            - lessonAbstractInfo (all fields filled)
        - The module must include: 
            - title
            - difficulty (from allowed list only)
        - Use reference documents as compliance guardrails.
        - Do not invent policies.
        - Skills must only come from the provided skill list.
        - Difficulty must only come from the provided difficulty list.
        - orderNumber must be a numeric value representing each lesson's position in the module sequence.
        - Make sure the sequential order of lessons is logical.

        Return output in EXACT JSON format:

        {{
            "message": {{
                "role": "assistant",
                "content": "Explain the structure of the created module and briefly justify lesson progression."
        }},
            "module": {{
                "title": "...",
                "difficulty": "...",
                "lessons": [
                    {{  
                        "orderNumber": 1,
                        "title": "...",
                        "skills": ["..."],
                        "lessonAbstractInfo": {{
                            "simulationModel": "...",
                            "targetBehaviors": "...",
                            "contextualConstraints": "...",
                            "evaluationSignals": "...",
                            "adaptionLogic": "..."
                        }}
                    }},
                    {{  
                        "orderNumber": 2,
                        "title": "...",
                        "skills": ["..."],
                        "lessonAbstractInfo": {{
                            "simulationModel": "...",
                            "targetBehaviors": "...",
                            "contextualConstraints": "...",
                            "evaluationSignals": "...",
                            "adaptionLogic": "..."
                        }}
                    }},
                    {{  
                        "orderNumber": 3,
                        "title": "...",
                        "skills": ["..."],
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
        - Output must be valid JSON.
        - Lessons array length MUST equal 3.
        - Do not include extra fields
        """

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        parsed = json.loads(response.choices[0].message.content)

        lessons = parsed.get("module", {}).get("lessons", [])
        if len(lessons) != 3:
            raise ValueError("Module generation failed: Must contain exactly 3 lessons.")
        
        if "message" in parsed:
            parsed["message"]["id"] = str(uuid.uuid4())

        return parsed
    
    def generate_simulation(
        self, 
        store_info: dict,
        lesson_title: str, 
        lesson_skills: List[str], 
        lesson_difficulty: str, 
        lesson_abstract: dict, 
        reference_summaries: Optional[List[dict]] = None,
        store_product_context: Optional[dict] = None
    ):

        prompt = f"""
        You are an AI system generating a structured retail employee training simulation.

        The goal is to create a realistic, skill-focused scenario that helps the employee practice applying the lesson concepts in a live customer interaction.

        STORE INFORMATION:
        {store_info}

        STORE PRODUCT CONTEXT:
        {store_product_context}

        LESSON INTFORMATION:
        
        Title: {lesson_title}

        Skills Being Practiced:
        {", ".join(lesson_skills)}

        Lesson Difficulty:
        {lesson_difficulty}

        Lesson Abstract (Summary of Key Concepts):
        {lesson_abstract}

        Reference Materials (If available):
        {reference_summaries or "None provided"}

        DIFFICULTY FRAMEWORK:

        Beginner:
            - Customer is calm and cooperative
            - Single clear problem
            - Low emotional tension
            - Straightforward solution
            - Minimal policy conflict

        Intermediate:
            - Customer shows mild frustration or confusion
            - Multiple factors involved
            - Requires prioritization or clarification
            - Minor policy or constraint complication

        Advanced:
            - Customer is emotionally charged, impatient, or skeptical
            - Multi-layered problem
            - Requires balancing customer satisfaction with company policy
            - Ambiguity or conflicting goals present
            - High decision-making pressure

        INSTRUCTIONS:
        
        1. Generate a realistic customer character:
            - Provide a first name. Avoid making it too generic since the employee can meet customers of any background.
        
        2. Create a scenario premise:
            - 4-6 sentences
            - The first 1-2 sentences are a short description of who the character is
            - The remaining sentences should be the premise itself.
            - Realistic retail environment
            - The scenario must stay grounded in the store product context provided.
            - Use the provided store categories, brands, and example products to infer what the store sells.
            - Do not invent unrelated product categories or merchandise outside the provided store product context.
            - If exact products are not mentioned, keep the scenario within the provided categories.
            - All scenarios MUST take place in the store environment specified.
            - The customer behavior, products, and challenges must be within the store product context.
            - Must require use of the lesson skills
            - Adjust the scenario complexity to match the specified difficulty level
            - The employee must make decisions (not just answer a question)
            - The scenario must reference realistic products or services that align with the provided store product context.
            - Do not invent unrelated product categories.
            - Make sure the scenario is randomized. 

        3. Generate EXACTLY 3 goals clear and actionable goals for the employee to accomplish during the simulation.
        The goals should:
            - Be specific to the scenario
            - Reflect real-world retail behavior
            - Encourage good communication, problem-solving, or sales skills
            - Be achievable within a short conversation

        4. Generate the first in-character opening message from the customer:
            - 2-4 sentences
            - Written as dialogue (what the customer would say)
            - Must reflect emotional tone and difficulty level
            - Must introduce the problem naturally
            - Must NOT include evaluation
            - Must NOT mention this is a simulation
        
        5. Generate structured evaluation criteria that define how employee responses should be assessed during this simulation. These criteria must:
            - Be directly tied to the lesson skills
            - Reflect the specified difficulty
            - Include measurable indicators
            - Not require re-reading lesson abstracts during scoring

        6.  Generate a voice description for TTS:
            - 1 sentence maximum
            - Describe only how the customer should sound
            - Focus on tone, pacing, and emotion
            - Do NOT include story details, products, or premise content
            - Include the gender of the character and approximate age
            - Example style: "Friendly, slightly overwhelmed, conversational retail customer. Female, Age 31."

        7. Ensure:
            - The situation feels authentic
            - The customer has a clear goal
            - There is room for the employee to make mistakes
            - The skills from the lesson are REQUIRED to handle it well

        8. Do NOT include:
            - Dialogue
            - Bullet points
            - Extra commentary
            - Markdown formatting
            - Any text outside of valid JSON

        RESPONSE FORMAT (STRICT JSON ONLY):

        {{
            "characterName": "First name of the customer only",
            "premise": "4-6 sentence scenario premise written as a paragraph.",
            "goals": [
                "Goal 1",
                "Goal 2",
                "Goal 3"
            ],
            "openingMessage": "Customer's first spoken line.",
            "voiceDescription": "A short voice style description for TTS, 1 sentence max. Focus only on delivery style and emotional tone, not story details. Make sure to include the character's gender and approximate age."
            "evaluationCriteria": {{
                "skillApplication": {{
                    "description": "How well the employee applies lesson-specific skills.",
                    "indicators": []
                }},
                "communicationQuality": {{
                    "indicators": []
                }},
                "policyAdherence": {{
                    "requiredChecks": []
                }},
                "emotionalIntelligence": {{
                    "expectedBehaviors": []
                }},
                "storeAlignment": {{
                    "brandToneRequirements": [],
                    "productKnowledgeExpectations": [],
                    "storeSpecificConstraints": [],
                    "targetCustomerConsiderations": []
                }},
                "difficultyModifiers": {{
                    "pressurePoints": [],
                    "expectedDecisionComplexity": "Brief description of decision complexity."
                }}
            }}
        }}

        Return ONLY valid JSON.

        """

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            response_format={"type": "json_object"}
        )

        parsed = json.loads(response.choices[0].message.content)
        return parsed
    
    def generate_simulation_reply(
        self,
        character_name: str,
        premise: str,
        evaluation_criteria: dict,
        conversation_history: List[dict],
        previous_hints: List[dict] = None,
        previous_product_hints: List[dict] = None,
    ):
        
        last_user_message = None

        for msg in reversed(conversation_history):
            if msg["role"] == "user":
                last_user_message = msg["content"]
                break
        
        message_history = []

        for msg in conversation_history:
            if msg["role"] == "assistant":
                continue

            if msg["role"] == "character":
                message_history.append({
                    "role": "assistant",   
                    "content": f"{character_name}: {msg["content"]}"
                })
            else:
                message_history.append({
                    "role": "user",
                    "content": msg["content"]
                })

        system_message = """
            You are operating inside a structured AI-powered retail training simulation.

            You have TWO distinct responsibilities:

            1) Character Mode:
            - Play the customer character realistically.
            - Maintain emotional continuity.
            - Reflect the scenario difficulty and pressure points.
            - Progress the situation naturally.
            - Do NOT evaluate the employee while in character.

            2) Evaluator Mode:
            - Evaluate ONLY the employee's MOST RECENT message.
            - Use the provided evaluation criteria strictly.
            - Do NOT invent new criteria.
            - Do NOT evaluate earlier messages.
            - Do NOT reward generic or vague responses.

            SCORING RULES:
            - Score each category from 1 to 10.
            - A score of 10 represents near-perfect execution with no missing indicators.
            - Average performance should fall between 5 and 7.
            - Missing required indicators must reduce the score.
            - Violating policy checks must significantly reduce the score.
            - If emotional intelligence is required but not demonstrated, deduct points.
            - Be fair but critical.

            IMPORTANT:
            - Do not break character inside the character reply.
            - Do not include commentary outside JSON.
            - Return STRICT valid JSON only.
            - No markdown.
            - No extra explanation.
        """

        context_message = f"""
            SIMULATION CONTEXT

            Character Name:
            {character_name}

            Scenario Premise:
            {premise}

            Evaluation Criteria:
            {json.dumps(evaluation_criteria, ensure_ascii=False, indent=2)}

            PREVIOUS GUIDANCE (for evaluation context only):

            General Hints Previously Given:
            {json.dumps(previous_hints or [], ensure_ascii=False, indent=2)}

            Product Hints Previously Given:
            {json.dumps(previous_product_hints or [], ensure_ascii=False, indent=2)}

            INSTRUCTION:
            - Consider whether the employee followed or ignored the provided hints.
            - If hints were ignored, reflect that in scoring and feedback.
            - If hints were followed well, reward appropriately in evaluation.

            You will now receive the full chronological conversation history.
            The LAST message in the conversation is the employee's newest response.
            Evaluate ONLY that final employee message.

            INSTRUCTIONS:

            STEP 1 — CHARACTER RESPONSE
            Generate the next reply from the customer.
            - 2–5 sentences.
            - Maintain realism.
            - You MUST respond directly to what the employee just said; do not ignore their message or repeat your previous line.
            - Do NOT repeat or rephrase your earlier messages. Move the conversation forward based on the employee's latest response.
            - Reflect the emotional state described in the premise.
            - If difficulty requires pressure or constraints, introduce them naturally.
            - Do NOT evaluate inside this reply.
            - Remember that this is a simulation inside a web application. The user does not have any physical objects which they can
            physically show you. Keep your responses realistic within the practical limits of the simulation. 

            STEP 2 - NEXT RESPONSE HINTS

            Generate actionable hints to help the employee respond to the customer’s latest reply.

            - These hints are for the NEXT message the employee will send.
            - Base them on:
            - The character’s latest reply
            - The mistakes identified in the evaluation
            - The evaluation criteria

            HINT RULES:
            - You MUST return 2 to 3 hints.
            - Do NOT return 0.
            - Do NOT return more than 3.
            - Each hint must be actionable (tell the employee what to do, not just what was wrong).
            - Each hint must directly help improve the NEXT response.
            - Each hint MUST explicitly reference something the customer said, asked, or implied.
            - Identify a specific need, concern, or goal from the customer’s latest message.
            - Then provide guidance that directly addresses that need.
            - Do NOT generate generic advice that could apply to any situation.
            - Avoid vague advice (e.g., "be better", "improve communication").
            - Prefer hints that align with evaluation criteria (policy, empathy, clarity, etc.).
            - Hints should NOT repeat the strengths.
            - Hints should NOT restate weaknesses — they must guide improvement.

            If the hints are not useful for crafting the next response, the response is invalid.

            STEP 3 — EVALUATION
            Switch to evaluator mode.

            Evaluate ONLY the employee's most recent message.

            Return the following JSON structure EXACTLY:

            {{
                "characterReply": "Customer reply here.",
                "hints": [
                    {{
                        "title": "Short actionable hint (3-6 words)",
                        "description": "Reference what the customer said or wants, then explain what the employee should do next."
                    }}
                ]
                "evaluation": {{
                    "overallScore": integer,
                    "criteriaBreakdown": {{
                        "skillApplication": integer,
                        "communicationQuality": integer,
                        "policyAdherence": integer,
                        "emotionalIntelligence": integer,
                        "storeAlignment": integer
                    }},
                    "strengths": [
                        {{
                            "title": "Brief strength label (3-5 words)",
                            "description": "One sentence explaining what the employee did well and why it matters."
                        }}
                    ],
                    "areasForImprovement": ["List of specific weaknesses."],
                    "summary": "Provide a 3-4 sentence overall evaluation of the employee's response, highlighting the strengths and weaknesses."
                    "improvedResponse": "A rewritten version of the employee's last message that would score 10/10."
                }}
            }}

            STRENGTHS RULES:
            - You MUST return 2 to 3 strengths only.
            - Do NOT return more than 3.
            - Do NOT return 0 or 1.
            - Each strength must be specific to the employee’s latest message.
            - Avoid generic praise (e.g., "Good job", "Nice response").
            - Each strength must clearly tie to one or more evaluation criteria.

            Return STRICT JSON ONLY.
        """

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": context_message},
                *message_history,
                {
                    "role": "user",
                    "content": f"""
                    IMPORTANT: The employee's MOST RECENT message is:

                    "{last_user_message}"

                    You MUST respond directly to THIS message.
                    Do NOT respond to earlier parts of the conversation.
                    """
                }
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )

        parsed = json.loads(response.choices[0].message.content)
        return parsed