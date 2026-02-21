/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import axios from "axios";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();
const db = admin.firestore();

export const onVideoLessonUpdated = onDocumentUpdated("standardLessons/{lessonId}",
    async (event) => {
  
      const before = event.data?.before.data();
      const after = event.data?.after.data();
      const lessonId = event.params.lessonId;
  
        if (!before || !after) return;
  
        if (!before.videoFilePath && after.videoFilePath) {
            console.log(`Video detected for lesson ${lessonId}`);
            try {
                await db.collection("standardLessons")
                .doc(lessonId)
                .update({ aiStatus: "processing" });

                await axios.post(
                "https://YOUR_BACKEND_URL/ai/generate-video-summary",
                {
                    lesson_id: lessonId,
                    video_path: after.videoFilePath,
                });

                await db.collection("standardLessons").doc(lessonId).update({ aiStatus: "complete" });

            } catch (error) {
                console.error("AI generation failed:", error);
                await db.collection("standardLessons").doc(lessonId).update({ aiStatus: "failed" });
            }
        }
    }
);