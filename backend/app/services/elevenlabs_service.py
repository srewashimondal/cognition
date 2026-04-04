import os, random
from elevenlabs.client import ElevenLabs

class ElevenLabsService:
    def __init__(self):
        self.client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))
    
    def create_voice(self, character_name, description):
        response = self.client.text_to_voice.design(
            voice_description=description,
            auto_generate_text=True,
            model_id="eleven_ttv_v3"
        )

        preview = random.choice(response.previews)
        generation_id = preview.generated_voice_id

        voice = self.client.text_to_voice.create(
            voice_name=character_name,
            voice_description=description,
            generated_voice_id=generation_id
        )

        return voice.voice_id
    
    def tts(self, voice_id, text):
        response = self.client.text_to_speech.stream(
            voice_id=voice_id,
            output_format="mp3_44100_128",
            text=text
        )

        return response





