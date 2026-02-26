from fastapi import APIRouter, HTTPException, UploadFile, File
from app.llms.llm_service import LLMService
import firebase_admin
from firebase_admin import credentials, firestore
from app.models.schemas import TranscriptRequest, SummaryRequest
import traceback
from app.models.schemas import SectionChatRequest
from firebase_admin.firestore import SERVER_TIMESTAMP
from app.models.schemas import *
from app.utils.utils import *
import tempfile
import os
import copy
import time
import uuid

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

        attempt_ref = (db.collection("standardLessonAttempts").document(request.lesson_attempt_id))

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
    
@router.post("/summarize-document")
async def summarize_document(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported.")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        extracted_text = extract_text_from_pdf(tmp_path)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        structured_summary = llm.generate_document_summary(extracted_text)
        return structured_summary

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

@router.post('/analyze-map')
async def analyze_map(file: UploadFile = File(...)):

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported.")

    try:
        contents = await file.read()
        structured_analysis = llm.analyze_map(contents)
        return structured_analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit-module")
async def edit_module(request: AIEditRequest):

    start_time = time.time()
    print("[1] Request received")

    module_ref = db.collection("simulationModules").document(request.module_id)
    ai_messages_ref = module_ref.collection("aiMessages")

    print("[2] Writing user message to Firestore")
    ai_messages_ref.add({
        "message": {
            "role": "user",
            "content": request.user_message,
            "scope": request.context_scope
        },
        "updates": None,
        "createdAt": SERVER_TIMESTAMP
    })

    print("[3] Fetching module document")
    module_doc = module_ref.get()

    if not module_doc.exists:
        raise HTTPException(status_code=404, detail="Module not found")
    
    module_data = module_doc.to_dict()
    module_data['id'] = request.module_id
    print("[4] Module loaded")

    print("[4.5] Fetching lessons for module")

    lessons_ref = db.collection("simulationLessons") \
        .where("moduleRef", "==", module_ref) \
        .stream()

    lesson_list = []

    for doc in lessons_ref:
        lesson_data = doc.to_dict()
        lesson_data["id"] = doc.id
        lesson_data.pop("moduleRef", None)
        lesson_list.append(lesson_data)

    module_data["lessons"] = lesson_list
    print(f"Loaded {len(lesson_list)} lessons")

    if "baseVersion" not in module_data:
        print("[5] Creating baseVersion snapshot")
        original_snapshot = {
            **copy.deepcopy(module_data),
            "lessons": lesson_list
        }

        module_ref.update({
            "baseVersion": original_snapshot
        })
        print("Base version saved")

    print("[6] Processing references")
    reference_summaries = []
    reference_refs = module_data.get("references", [])

    for ref in reference_refs:
        try:
            ref_doc = ref.get()
            if ref_doc.exists:
                ref_data = ref_doc.to_dict()

                if ref_data.get("section") == "Maps":
                    reference_summaries.append({
                        "type": "map",
                        "data": ref_data
                    })
                else: 
                    summary = ref_data.get("summary")
                    if summary:
                        reference_summaries.append({
                            "type": "document",
                            "data": summary
                        })
        
        except Exception: 
            continue

    print(f"Processed {len(reference_summaries)} references")

    print("[7] Calling LLM...") 
    llm_start = time.time() 
    ai_response = llm.generate_module_edits(
        module=module_data,
        user_message=request.user_message,
        scope=request.context_scope,
        reference_summaries=reference_summaries
    )

    llm_end = time.time()
    print(f"LLM finished in {llm_end - llm_start:.2f} seconds")

    print("[8] Writing AI response to Firestore")
    assistant_message = ai_response["message"]
    assistant_message["id"] = str(uuid.uuid4())

    ai_messages_ref.add({
        "message": assistant_message,
        "updates": ai_response["updates"],
        "createdAt": SERVER_TIMESTAMP
    })

    total_time = time.time() - start_time
    print(f"Done in {total_time:.2f} seconds")

    return ai_response["message"]
                