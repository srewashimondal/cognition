from pydantic import BaseModel
from typing import List, Optional

class TranscriptRequest(BaseModel):
    lesson_id: str  # Firestore document ID
    video_path: str  # Path in Firebase Storage, e.g., "trainingVideos/video1.mp4"

class SummaryRequest(BaseModel):
    lesson_id: str  # Firestore document ID
    video_path: str  # Path in Firebase Storage, e.g., "trainingVideos/video1.mp4"

class MessageType(BaseModel):
    id: int
    role: str
    content: str

class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str

class SectionSummary(BaseModel):
    id: int
    title: str
    start: float
    end: float
    canonicalSummary: MessageType

class TranscriptResponse(BaseModel):
    status: str
    transcript: List[TranscriptSegment]
    duration: float

class SummaryResponse(BaseModel):
    status: str
    sections: List[SectionSummary]
    transcript: List[TranscriptSegment]
    duration: float

class SectionChatRequest(BaseModel):
    lesson_id: str
    user_id: str
    section_id: int
    user_message: str
