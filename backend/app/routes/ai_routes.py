from fastapi import APIRouter, HTTPException
from app.llms.llm_service import LLMService
import firebase_admin
from firebase_admin import credentials, firestore
from app.models.schemas import TranscriptRequest, SummaryRequest
import traceback
from app.models.schemas import SectionChatRequest
from firebase_admin.firestore import SERVER_TIMESTAMP


router = APIRouter()
llm = LLMService()

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'cognition-d6663.firebasestorage.app'  
    })

db = firestore.client()


@router.post("/generate-video-transcript")
async def generate_video_transcript(request: TranscriptRequest):
    """
    Generate transcript for a video lesson
    
    1. Downloads video from Firebase Storage
    2. Extracts audio and transcribes with Whisper
    3. Saves transcript to Firestore
    """
    try:
        print(f"Processing lesson {request.lesson_id}, video path: {request.video_path}")
        
        result = llm.process_video_for_transcript(request.video_path)
        
        lesson_ref = db.collection("standardLessons").document(request.lesson_id)
        lesson_ref.update({
            "transcript": result["transcript"],
            "durationSeconds": int(result["duration"])
        })
        
        print(f"Successfully updated lesson {request.lesson_id} with {len(result['transcript'])} transcript segments")
        
        return {
            "status": "success",
            "transcript": result["transcript"],
            "duration": result["duration"]
        }
        
    except Exception as e:
        print(f"Error generating transcript: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate transcript: {str(e)}"
        )


@router.post("/generate-video-summary")
async def generate_video_summary(request: SummaryRequest):
    """
    Generate AI summaries for a video lesson
    
    1. Downloads video from Firebase Storage
    2. Extracts audio and transcribes with Whisper
    3. Generates section summaries with GPT-4
    4. Saves to Firestore under the lesson document
    """
    try:
        print(f"Processing lesson {request.lesson_id}, video path: {request.video_path}")
        
        result = llm.process_video_for_summaries(request.video_path)
        
        summaries = []
        for idx, section in enumerate(result["sections"]):
            summary = {
                "id": idx,
                "title": section["title"],
                "start": section["start"],
                "end": section["end"],
                "canonicalSummary": {
                    "id": 0,
                    "role": "assistant",
                    "content": section["summary"]
                }
            }
            summaries.append(summary)
        
        lesson_ref = db.collection("standardLessons").document(request.lesson_id)
        lesson_ref.update({
            "summaries": summaries,
            "transcript": result["transcript"],
            "durationSeconds": int(result["duration"])
        })
        
        print(f"Successfully updated lesson {request.lesson_id} with {len(summaries)} summaries")
        
        return {
            "status": "success",
            "sections": summaries,
            "transcript": result["transcript"],
            "duration": result["duration"]
        }
        
    except Exception as e:
        print(f"Error generating summaries: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summaries: {str(e)}"
        )


@router.get("/lesson/{lesson_id}/transcript")
async def get_lesson_transcript(lesson_id: str):
    """
    Get existing transcript for a lesson
    """
    try:
        lesson_ref = db.collection("standardLessons").document(lesson_id)
        lesson_doc = lesson_ref.get()
        
        if not lesson_doc.exists:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        lesson_data = lesson_doc.to_dict()
        
        return {
            "transcript": lesson_data.get("transcript", []),
            "duration": lesson_data.get("durationSeconds", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching transcript: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch transcript: {str(e)}"
        )


@router.get("/lesson/{lesson_id}/summaries")
async def get_lesson_summaries(lesson_id: str):
    """
    Get existing summaries for a lesson
    """
    try:
        lesson_ref = db.collection("standardLessons").document(lesson_id)
        lesson_doc = lesson_ref.get()
        
        if not lesson_doc.exists:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        lesson_data = lesson_doc.to_dict()
        
        return {
            "summaries": lesson_data.get("summaries", []),
            "transcript": lesson_data.get("transcript", []),
            "duration": lesson_data.get("durationSeconds", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching summaries: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch summaries: {str(e)}"
        )
    

@router.post("/section-chat")
async def section_chat(request: SectionChatRequest):
    try:
        lesson_ref = db.collection("standardLessons").document(request.lesson_id)
        lesson_doc = lesson_ref.get()

        if not lesson_doc.exists:
            raise HTTPException(status_code=404, detail="Lesson not found")

        lesson_data = lesson_doc.to_dict()
        summaries = lesson_data.get("summaries", [])
        transcript = lesson_data.get("transcript", [])

        section = next(
            (s for s in summaries if s["id"] == request.section_id),
            None
        )

        if not section:
            raise HTTPException(status_code=404, detail="Section not found")

        attempt_ref = (
            db.collection("standardLessonAttempts")
              .document(request.lesson_id)
              .collection("users")
              .document(request.user_id)
        )

        chat_ref = (
            attempt_ref
            .collection("sectionChats")
            .document(str(request.section_id))
            .collection("messages")
        )

        previous_messages_docs = chat_ref.order_by("timestamp").stream()

        conversation_history = [
            doc.to_dict() for doc in previous_messages_docs
        ]

        ai_response = llm.generate_section_chat_response(
            transcript_segments=transcript,
            section_summary=section,
            conversation_history=conversation_history,
            user_message=request.user_message
        )

        chat_ref.add({
            "role": "user",
            "content": request.user_message,
            "timestamp": SERVER_TIMESTAMP
        })

        chat_ref.add({
            "role": "assistant",
            "content": ai_response,
            "timestamp": SERVER_TIMESTAMP
        })

        return {
            "status": "success",
            "response": ai_response
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))