import os
import json
import tempfile
from openai import OpenAI
from firebase_admin import storage
import subprocess

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