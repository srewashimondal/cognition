from pydantic import BaseModel
from typing import List, Optional, Literal, Any, Dict

class TranscriptRequest(BaseModel):
    lesson_id: str  # Firestore document ID
    video_path: str  # Path in Firebase Storage, e.g., "trainingVideos/video1.mp4"

class SummaryRequest(BaseModel):
    lesson_id: str  # Firestore document ID
    video_path: str  # Path in Firebase Storage, e.g., "trainingVideos/video1.mp4"

class MessageType(BaseModel):
    id: str
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
    lesson_attempt_id: str
    lesson_id: str
    user_id: str
    section_id: int
    user_message: str

class AIEditRequest(BaseModel):
    module_id: str
    user_message: str
    context_scope: Optional[List[str]] = None

class LessonAbstractInfo(BaseModel):
    simulationModel: str
    targetBehaviors: str
    contextualConstraints: str
    evaluationSignals: str
    adaptionLogic: str

class LessonUpdate(BaseModel):
    id: str
    title: Optional[str] = None
    skills: Optional[List[str]] = None
    lessonAbstractInfo: Optional[LessonAbstractInfo] = None

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[str] = None

class AIUpdates(BaseModel):
    module: Optional[ModuleUpdate] = None
    lessons: Optional[List[LessonUpdate]] = None

class AIEditResponse(BaseModel):
    message: MessageType
    updates: AIUpdates

class DocumentSummaryResponse(BaseModel):
    summary: str
    key_policies: list[str]
    operational_constraints: list[str]
    customer_interaction_rules: list[str]
    compliance_requirements: list[str]

class ModuleEditContext(BaseModel):
    module: Dict[str, Any]
    lessons: List[Dict[str, Any]]
    scope: Optional[List[str]] = None
    reference_summaries: Optional[List[Dict[str, Any]]] = None
    version1: Optional[Dict[str, Any]] = None
    version2: Optional[Dict[str, Any]] = None