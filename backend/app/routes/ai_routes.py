from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
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
import json
import requests
from collections import Counter

router = APIRouter()
llm = LLMService()

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'cognition-d6663.firebasestorage.app'  
    })

db = firestore.client()


def _create_and_save_hume_voice(
    hume_api_key: str,
    voice_name: str,
    opening_text: str,
    description: str,
) -> str:
    """
    Generate speech from description + opening text via Hume JSON TTS,
    then save that generation as a reusable custom voice. Returns the voice name.
    """
    # 1. Generate with description (voice design) to get generation_id
    json_body = {
        "utterances": [
            {
                "text": (opening_text or "").strip() or "Hello.",
                "description": (description or "").strip() or "Natural, clear, conversational delivery.",
                "speed": 1,
                "trailing_silence": 0.25,
            }
        ],
        "num_generations": 1,
        "format": {"type": "mp3"},
    }
    resp = requests.post(
        "https://api.hume.ai/v0/tts",
        headers={
            "Content-Type": "application/json",
            "X-Hume-Api-Key": hume_api_key,
        },
        json=json_body,
        timeout=60,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Hume TTS JSON failed: {resp.status_code} {resp.text}")

    data = resp.json()
    generations = data.get("generations") or []
    if not generations:
        raise RuntimeError("Hume TTS returned no generations")
    generation_id = generations[0].get("generation_id")
    if not generation_id:
        raise RuntimeError("Hume TTS response missing generation_id")

    # 2. Save as named custom voice
    save_body = {"generation_id": generation_id, "name": voice_name}
    save_resp = requests.post(
        "https://api.hume.ai/v0/tts/voices",
        headers={
            "Content-Type": "application/json",
            "X-Hume-Api-Key": hume_api_key,
        },
        json=save_body,
        timeout=30,
    )
    if save_resp.status_code != 200:
        raise RuntimeError(f"Hume create voice failed: {save_resp.status_code} {save_resp.text}")

    return voice_name


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
    safe_module_data = make_json_safe(module_data)
    ai_response = llm.generate_module_edits(
        module=safe_module_data,
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

@router.post("/create-module")
async def create_module(request: AICreateRequest):

    print("[1] Create module request received")
    module_ref = db.collection("simulationModules").document(request.module_id)
    ai_messages_ref = module_ref.collection("aiMessages")

    module_doc = module_ref.get()

    if not module_doc.exists:
        raise HTTPException(status_code=404, detail="Module not found")
    
    module_data = module_doc.to_dict()
    workspace_ref = module_data.get("workspaceRef")

    if not workspace_ref:
        raise HTTPException(status_code=400, detail="Module missing workspaceRef")
    
    print("[2] Writing user message")
    ai_messages_ref.add({
        "message": {
            "role": "user",
            "content": request.user_message
        },
        "createdAt": SERVER_TIMESTAMP
    })

    reference_summaries = []
    if request.reference_ids:
        for ref_id in request.reference_ids:

            resource_ref = workspace_ref.collection("resources").document(ref_id)
            resource_doc = resource_ref.get()

            if not resource_doc.exists:
                continue

            ref_data = resource_doc.to_dict()

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

    print(f"[3] Processed {len(reference_summaries)} references")

    print("[4] Calling LLM...")
    ai_response = llm.generate_module(
        user_message=request.user_message,
        reference_summaries=reference_summaries
    )

    assistant_message = ai_response["message"]
    assistant_message["id"] = str(uuid.uuid4())

    print("[5] Writing assistant message")
    ai_messages_ref.add({
        "message": assistant_message,
        "module": ai_response["module"],
        "createdAt": SERVER_TIMESTAMP
    })

    print("[6] Module generation complete")

    module_blueprint = ai_response["module"]

    module_ref.update({
        "title": module_blueprint["title"],
        "difficulty": module_blueprint["difficulty"],
    })

    for lesson in module_blueprint["lessons"]:
        db.collection("simulationLessons").add({
            **lesson,
            "moduleRef": module_ref,
            "createdAt": SERVER_TIMESTAMP
        })

    return assistant_message


@router.post("/deploy-simulation-module")
async def deploy_simulation_module(request: DeploySimulationModuleRequest):
    """
    When an employer deploys a simulation module, create simulationModuleAttempt
    and simulationLessonAttempts for each employee in the same workspace so they
    see the module in their Simulation Modules list.
    """
    try:
        module_ref = db.collection("simulationModules").document(request.module_id)
        module_doc = module_ref.get()
        if not module_doc.exists:
            raise HTTPException(status_code=404, detail="Module not found")

        module_data = module_doc.to_dict()
        workspace_ref = module_data.get("workspaceRef")
        if not workspace_ref:
            raise HTTPException(status_code=400, detail="Module missing workspaceRef")

        employees_snap = (
            db.collection("users")
            .where("workspaceID", "==", workspace_ref)
            .where("role", "==", "employee")
            .stream()
        )
        employee_user_refs = [doc.reference for doc in employees_snap]

        if not employee_user_refs:
            return {"success": True, "created": 0, "message": "No employees in workspace"}

        existing_snap = (
            db.collection("simulationModuleAttempts")
            .where("moduleInfo", "==", module_ref)
            .stream()
        )
        existing_user_ids = set()
        for doc in existing_snap:
            d = doc.to_dict()
            u = d.get("user")
            if u is not None and getattr(u, "id", None):
                existing_user_ids.add(u.id)

        lessons_snap = (
            db.collection("simulationLessons")
            .where("moduleRef", "==", module_ref)
            .stream()
        )
        lesson_refs = [doc.reference for doc in lessons_snap]

        created = 0
        for user_ref in employee_user_refs:
            if user_ref.id in existing_user_ids:
                continue
            attempt_ref = db.collection("simulationModuleAttempts").document()
            attempt_ref.set({
                "user": user_ref,
                "workspaceRef": workspace_ref,
                "moduleInfo": module_ref,
                "status": "not begun",
                "percent": 0,
            })
            existing_user_ids.add(user_ref.id)
            created += 1
            for lesson_ref in lesson_refs:
                db.collection("simulationLessonAttempts").add({
                    "moduleRef": attempt_ref,
                    "lessonInfo": lesson_ref,
                    "status": "not begun",
                })

        return {"success": True, "created": created}
    except HTTPException:
        raise
    except Exception as e:
        print("Deploy simulation module failed:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/employee-insights")
async def employee_insights(request: EmployeeInsightsRequest):
    """
    Aggregate simulation and standard module performance for this employee and return
    real AI-powered insights (strengths, areas for improvement, scores) from the modules they've been doing.
    """
    try:
        user_ref = db.collection("users").document(request.user_id)
        workspace_ref = db.collection("workspaces").document(request.workspace_id)

        # Simulations
        mod_attempts = (
            db.collection("simulationModuleAttempts")
            .where("user", "==", user_ref)
            .where("workspaceRef", "==", workspace_ref)
            .stream()
        )

        ratings = []
        all_strengths = []
        all_areas = []
        criteria_sums = {}
        criteria_counts = {}
        improved_examples = []

        for mod_doc in mod_attempts:
            lesson_attempts = (
                db.collection("simulationLessonAttempts")
                .where("moduleRef", "==", mod_doc.reference)
                .stream()
            )
            for lesson_doc in lesson_attempts:
                for sim_index in (1, 2, 3):
                    sim_ref = lesson_doc.reference.collection("simulations").document(f"sim_{sim_index}")
                    messages = sim_ref.collection("messages").where("role", "==", "assistant").stream()
                    for msg_doc in messages:
                        d = msg_doc.to_dict()
                        r = d.get("rating")
                        if r is not None:
                            try:
                                ratings.append(int(r))
                            except (TypeError, ValueError):
                                pass
                        content = d.get("content") or ""
                        if content:
                            for line in content.replace("\r\n", "\n").split("\n"):
                                line = line.strip()
                                if line:
                                    all_strengths.append(line)
                        areas = d.get("areasForImprovement")
                        if isinstance(areas, list):
                            all_areas.extend([str(a).strip() for a in areas if a])
                        elif isinstance(areas, str) and areas.strip():
                            all_areas.append(areas.strip())
                        cb = d.get("criteriaBreakdown")
                        if isinstance(cb, dict):
                            for k, v in cb.items():
                                if v is not None:
                                    try:
                                        v = int(v)
                                        criteria_sums[k] = criteria_sums.get(k, 0) + v
                                        criteria_counts[k] = criteria_counts.get(k, 0) + 1
                                    except (TypeError, ValueError):
                                        pass
                        imp = d.get("improved")
                        if imp and isinstance(imp, str) and imp.strip():
                            improved_examples.append(imp.strip())

        # Standard 
        standard_scores = []  
        standard_completed = 0
        standard_passed = 0

        std_mod_attempts = (
            db.collection("standardModuleAttempts")
            .where("user", "==", user_ref)
            .where("workspaceRef", "==", workspace_ref)
            .stream()
        )
        for std_mod_doc in std_mod_attempts:
            std_mod_data = std_mod_doc.to_dict()
            module_info_ref = std_mod_data.get("moduleInfo")
            module_title = ""
            if module_info_ref:
                mod_snap = module_info_ref.get()
                if mod_snap.exists:
                    module_title = (mod_snap.to_dict() or {}).get("title") or ""

            std_lesson_attempts = (
                db.collection("standardLessonAttempts")
                .where("moduleRef", "==", std_mod_doc.reference)
                .stream()
            )
            for std_lesson_doc in std_lesson_attempts:
                ld = std_lesson_doc.to_dict()
                if ld.get("status") == "completed":
                    standard_completed += 1
                    if ld.get("passed") is True:
                        standard_passed += 1
                score = ld.get("score")
                if score is not None:
                    try:
                        score_val = int(score)
                        lesson_title = ""
                        lesson_info_ref = ld.get("lessonInfo")
                        if lesson_info_ref:
                            lesson_snap = lesson_info_ref.get()
                            if lesson_snap.exists:
                                lesson_title = (lesson_snap.to_dict() or {}).get("title") or ""
                        standard_scores.append((score_val, module_title, lesson_title))
                    except (TypeError, ValueError):
                        pass

        insights = []

        if ratings:
            avg = round(sum(ratings) / len(ratings), 1)
            count = len(ratings)
            pct = min(100, round(avg * 10))
            insights.append({
                "title": "📊 Simulation performance",
                "description": f"You've received feedback on {count} scenario response{'' if count == 1 else 's'} with an average score of {avg}/10 ({pct}%).",
                "suggestion": "Keep practicing to maintain and improve your scores."
            })

        if all_strengths:
            strength_counts = Counter(all_strengths)
            top_strength = strength_counts.most_common(1)[0][0]
            short = top_strength[:120] + "…" if len(top_strength) > 120 else top_strength
            insights.append({
                "title": "💚 Strength",
                "description": short,
                "suggestion": "Keep it up—this is a standout skill in your simulations."
            })

        if all_areas:
            area_counts = Counter(all_areas)
            top_area = area_counts.most_common(1)[0][0]
            short = top_area[:120] + "…" if len(top_area) > 120 else top_area
            insights.append({
                "title": "📚 Area to improve",
                "description": f"Feedback often suggests: {short}",
                "suggestion": "Try the related simulation again or review reference materials to strengthen this."
            })

        if criteria_sums and criteria_counts:
            avg_by_criterion = {}
            for k, total in criteria_sums.items():
                n = criteria_counts.get(k, 0)
                if n:
                    avg_by_criterion[k] = round(total / n, 1)
            if avg_by_criterion:
                best_name = max(avg_by_criterion, key=avg_by_criterion.get)
                best_score = avg_by_criterion[best_name]
                label = best_name.replace("_", " ").replace("storeAlignment", "store alignment").title()
                insights.append({
                    "title": "🎯 Strongest criterion",
                    "description": f"You score highest on \"{label}\" in simulation feedback (avg {best_score}/10).",
                    "suggestion": "Use this strength when handling difficult scenarios."
                })

        if standard_scores:
            avg_score = round(sum(s[0] for s in standard_scores) / len(standard_scores))
            insights.append({
                "title": "📖 Standard modules performance",
                "description": f"You've completed {standard_completed} standard lesson{'' if standard_completed == 1 else 's'} with an average quiz/assessment score of {avg_score}% ({standard_passed} passed).",
                "suggestion": "Keep completing modules to build your knowledge and track progress."
            })
        low_standard = [(s, mt, lt) for s, mt, lt in standard_scores if s < 70]
        if low_standard:
            score_val, mod_title, lesson_title = low_standard[0]
            lesson_label = lesson_title or "this lesson"
            mod_label = mod_title or "Standard Modules"
            insights.append({
                "title": "📚 Review opportunity",
                "description": f"\"{lesson_label}\" in {mod_label} was scored {score_val}%. A quick review could strengthen this area.",
                "suggestion": "Revisit the lesson or reference materials and try again to improve your score."
            })

        if not insights:
            insights.append({
                "title": "🚀 Get started",
                "description": "Complete simulation and standard modules to see personalized feedback and insights here.",
                "suggestion": "Go to Simulations or Standard Modules and complete at least one lesson to unlock your first insight."
            })

        return {"insights": insights[:6]}

    except Exception as e:
        print("Employee insights failed:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-simulation")
async def create_simulation(request: CreateSimulationRequest):

    print("[1] Grabbing simulation reference")
    sim_ref = (
        db.collection("simulationLessonAttempts")
        .document(request.lesson_attempt_id)
        .collection("simulations")
        .document(f"sim_{request.sim_index}")
    )

    try:
        existing_sim = sim_ref.get()
        if existing_sim.exists:
            existing_data = existing_sim.to_dict()
            if existing_data.get("generationStatus") == "ready":
                return { "success": True, "simulation": existing_data }

        lesson_attempt_ref = db.collection("simulationLessonAttempts").document(request.lesson_attempt_id)
        lesson_attempt_doc = lesson_attempt_ref.get()
        if not lesson_attempt_doc.exists:
            raise HTTPException(status_code=404, detail="Lesson attempt not found")
        lesson_ref = lesson_attempt_doc.to_dict().get("lessonInfo")
        if not lesson_ref:
            raise HTTPException(status_code=400, detail="Lesson attempt missing lessonInfo")

        lesson_doc = lesson_ref.get()
        if not lesson_doc.exists:
            raise HTTPException(status_code=404, detail="Lesson not found")

        lesson_data = lesson_doc.to_dict() or {}
        canonical_map = lesson_data.get("canonicalSimulations") or {}
        key = str(request.sim_index)
        canonical = canonical_map.get(key)

        if canonical:
            print("[2] Using canonical simulation content for this lesson")
            sim_ref.set({
                "characterName": canonical["characterName"],
                "premise": canonical["premise"],
                "evaluationCriteria": canonical.get("evaluationCriteria") or {},
                "generationStatus": "ready",
                "completionStatus": "not begun",
                "updatedAt": firestore.SERVER_TIMESTAMP
            }, merge=True)
            if canonical.get("humeVoiceName"):
                sim_ref.set({"humeVoiceName": canonical["humeVoiceName"]}, merge=True)

            messages_ref = sim_ref.collection("messages")
            existing_messages = list(messages_ref.limit(1).stream())
            if not existing_messages:
                messages_ref.add({
                    "role": "character",
                    "name": canonical["characterName"],
                    "content": canonical.get("openingMessage") or "",
                    "timestamp": firestore.SERVER_TIMESTAMP
                })

            return {
                "success": True,
                "simulation": {
                    "characterName": canonical["characterName"],
                    "premise": canonical["premise"],
                    "openingMessage": canonical.get("openingMessage") or "",
                    "evaluationCriteria": canonical.get("evaluationCriteria") or {}
                }
            }

        workspace_ref = db.collection("workspaces").document(request.workspace_id)
        reference_summaries = []
        if request.reference_ids:
            for ref_id in request.reference_ids:
                resource_ref = workspace_ref.collection("resources").document(ref_id)
                resource_doc = resource_ref.get()
                if not resource_doc.exists:
                    continue
                ref_data = resource_doc.to_dict()
                if ref_data.get("section") == "Maps":
                    reference_summaries.append({"type": "map", "data": ref_data})
                else:
                    summary = ref_data.get("summary")
                    if summary:
                        reference_summaries.append({"type": "document", "data": summary})

        print("[3] Calling LLM... (first employee for this lesson – will become canonical)")
        ai_response = llm.generate_simulation(
            store_info=request.store_info,
            lesson_title=request.lesson_title,
            lesson_skills=request.lesson_skills,
            lesson_difficulty=request.lesson_difficulty,
            lesson_abstract=request.lesson_abstract,
            reference_summaries=reference_summaries
        )

        voice_name = None
        hume_api_key = os.getenv("HUME_API_KEY")
        if hume_api_key:
            try:
                safe_lesson_id = "".join(c if c.isalnum() or c in "_-" else "_" for c in lesson_ref.id)
                voice_name = f"lesson_{safe_lesson_id}_{request.sim_index}"
                _create_and_save_hume_voice(
                    hume_api_key,
                    voice_name,
                    ai_response.get("openingMessage") or "",
                    ai_response.get("premise") or "",
                )
                print("[4a] Hume voice created and saved for character (canonical).")
            except Exception as voice_err:
                print("[4a] Hume voice creation failed:", voice_err)

        canonical_entry = {
            "characterName": ai_response["characterName"],
            "premise": ai_response["premise"],
            "openingMessage": ai_response.get("openingMessage") or "",
            "evaluationCriteria": ai_response.get("evaluationCriteria") or {},
        }
        if voice_name:
            canonical_entry["humeVoiceName"] = voice_name

        lesson_ref.update({
            "canonicalSimulations": {**canonical_map, key: canonical_entry}
        })

        print("[4] Updating Firebase")
        sim_ref.set({
            "characterName": ai_response["characterName"],
            "premise": ai_response["premise"],
            "evaluationCriteria": ai_response.get("evaluationCriteria") or {},
            "generationStatus": "ready",
            "completionStatus": "not begun",
            "updatedAt": firestore.SERVER_TIMESTAMP
        }, merge=True)
        if voice_name:
            sim_ref.set({"humeVoiceName": voice_name}, merge=True)

        messages_ref = sim_ref.collection("messages")
        messages_ref.add({
            "role": "character",
            "name": ai_response["characterName"],
            "content": ai_response.get("openingMessage") or "",
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        print("[5] Generation complete.")
        return {
            "success": True,
            "simulation": ai_response
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Simulation creation failed:", e)
        try:
            sim_ref.set({
                "generationStatus": "failed",
                "updatedAt": SERVER_TIMESTAMP
            }, merge=True)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Simulation generation failed")
    
@router.post("/simulation-reply")
async def simulation_reply(request: SimulationReplyRequest):
    try:
        sim_ref = (
            db.collection("simulationLessonAttempts")
            .document(request.lesson_attempt_id)
            .collection("simulations")
            .document(f"sim_{request.sim_index}")
        )

        sim_snap = sim_ref.get()
        if not sim_snap.exists:
            raise HTTPException(status_code=404, detail="Simulation not found")

        sim_data = sim_snap.to_dict()

        character_name = sim_data.get("characterName")
        premise = sim_data.get("premise")
        evaluation_criteria = sim_data.get("evaluationCriteria")

        if not all([character_name, premise, evaluation_criteria]):
            raise HTTPException(
                status_code=400,
                detail="Simulation missing required fields"
            )

        messages_ref = sim_ref.collection("messages")
        message_docs = messages_ref.order_by("timestamp").stream()

        conversation_history = []
        for doc in message_docs:
            msg = doc.to_dict()
            conversation_history.append({
                "role": msg.get("role"),
                "content": msg.get("content")
            })

        latest = (request.latest_user_message or "").strip()
        if latest:
            if not conversation_history or conversation_history[-1].get("role") != "user":
                conversation_history.append({"role": "user", "content": latest})
            else:
                conversation_history[-1] = {"role": "user", "content": latest}

        ai_response = llm.generate_simulation_reply(
            character_name=character_name,
            premise=premise,
            evaluation_criteria=evaluation_criteria,
            conversation_history=conversation_history
        )

        character_reply = ai_response["characterReply"]
        evaluation = ai_response["evaluation"]

        messages_ref.add({
            "role": "character",
            "name": character_name,
            "content": character_reply,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        messages_ref.add({
            "role": "assistant",
            "content": "\n".join(evaluation.get("strengths", [])),
            "rating": evaluation.get("overallScore"),
            "criteriaBreakdown": evaluation.get("criteriaBreakdown"),
            "areasForImprovement": evaluation.get("areasForImprovement"),
            "improved": evaluation.get("improvedResponse"),
            "replyToId": request.reply_to_id,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        return {
            "success": True
        }

    except Exception as e:
        print("Simulation reply failed:", e)
        raise HTTPException(status_code=500, detail="Simulation reply failed")

@router.post("/tts")
async def tts(request: TTSRequest):
    """
    Synthesize speech for simulation character messages via Hume TTS.

    Env vars:
      - HUME_API_KEY (required)
      - HUME_VOICE_MAP (optional JSON): {"Alex":"Serena","Jordan":"Miles"}
      - HUME_VOICE_PROVIDER (optional): "HUME_AI" | "CUSTOM_VOICE" (default "HUME_AI")
      - HUME_DEFAULT_VOICE_NAME (optional, default "Serena")
      - HUME_DESCRIPTION_MAP (optional JSON): {"Serena":"Warm, supportive, professional."}
      - HUME_DEFAULT_DESCRIPTION (optional)
    """
    hume_api_key = os.getenv("HUME_API_KEY")
    if not hume_api_key:
        raise HTTPException(status_code=500, detail="Missing HUME_API_KEY")

    text = (request.text or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="Missing text")

    resolved_voice_name = (request.voice_name or "").strip()
    provider = (request.voice_provider or os.getenv("HUME_VOICE_PROVIDER", "HUME_AI"))
    if provider not in ("HUME_AI", "CUSTOM_VOICE"):
        provider = "HUME_AI"

    # Prefer saved voice for this simulation when lesson_attempt_id + sim_index are provided
    if request.lesson_attempt_id is not None and request.sim_index is not None:
        try:
            sim_ref = (
                db.collection("simulationLessonAttempts")
                .document(request.lesson_attempt_id)
                .collection("simulations")
                .document(f"sim_{request.sim_index}")
            )
            sim_snap = sim_ref.get()
            if sim_snap.exists:
                sim_data = sim_snap.to_dict()
                saved_voice = (sim_data.get("humeVoiceName") or "").strip()
                if saved_voice:
                    resolved_voice_name = saved_voice
                    provider = "CUSTOM_VOICE"
        except Exception:
            pass

    if not resolved_voice_name:
        voice_map_raw = os.getenv("HUME_VOICE_MAP", "{}")
        try:
            voice_map = json.loads(voice_map_raw) if voice_map_raw else {}
        except Exception:
            voice_map = {}
        default_voice_name = os.getenv("HUME_DEFAULT_VOICE_NAME", "").strip()
        resolved_voice_name = (voice_map.get(request.character_name) or default_voice_name or "").strip()

    desc_map_raw = os.getenv("HUME_DESCRIPTION_MAP", "{}")
    try:
        desc_map = json.loads(desc_map_raw) if desc_map_raw else {}
    except Exception:
        desc_map = {}

    description = request.description or desc_map.get(resolved_voice_name) or os.getenv(
        "HUME_DEFAULT_DESCRIPTION",
        "Natural, clear, conversational delivery."
    )

    utterance = {
        "text": text,
        "description": description,
        "speed": 1,
        "trailing_silence": 0.25
    }

    if resolved_voice_name:
        utterance["voice"] = {
            "name": resolved_voice_name,
            "provider": provider
        }

    body = {
        "utterances": [
            utterance
        ],
        "format": { "type": "mp3" }
    }

    try:
        resp = requests.post(
            "https://api.hume.ai/v0/tts/file",
            headers={
                "Content-Type": "application/json",
                "X-Hume-Api-Key": hume_api_key
            },
            json=body,
            stream=True,
            timeout=60
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hume request failed: {str(e)}")

    if resp.status_code != 200:
        try:
            detail = resp.text
        except Exception:
            detail = "Unknown error"
        raise HTTPException(status_code=500, detail=f"Hume TTS failed: {detail}")

    return StreamingResponse(resp.iter_content(chunk_size=1024 * 64), media_type="audio/mpeg")


@router.post("/stt")
async def stt(file: UploadFile = File(...)):
    """
    Speech-to-text for voice messages. Uses OpenAI Whisper.

    Expects multipart/form-data with "file".
    Returns: { "text": "..." }
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY")

    tmp_path = None
    try:
        suffix = os.path.splitext(file.filename or "")[1] or ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            contents = await file.read()
            if not contents:
                raise HTTPException(status_code=422, detail="Empty audio file")
            tmp.write(contents)

        with open(tmp_path, "rb") as audio_file:
            transcript = llm.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )

        text = getattr(transcript, "text", None) or ""
        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass