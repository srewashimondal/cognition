/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

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
setGlobalOptions({maxInstances: 10});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();
const db = admin.firestore();


export const onSimulationModuleDeployed = onDocumentUpdated(
  "simulationModules/{moduleId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    const wasDeployed = before.deployed;
    const isDeployed = after.deployed;

    const beforeAssigned = before.assignedUsers || [];
    const afterAssigned = after.assignedUsers || [];

    const getIds = (arr: any[]) => arr.map((ref) => ref.id);
    const beforeIds = new Set(getIds(beforeAssigned));
    const newUserRefs = afterAssigned.filter(
      (ref: any) => !beforeIds.has(ref.id)
    );

    const justDeployed = !wasDeployed && isDeployed;
    const assignedChanged =
      isDeployed &&
      JSON.stringify(getIds(beforeAssigned)) !==
      JSON.stringify(getIds(afterAssigned));
    if (!justDeployed && !assignedChanged) return;

    const moduleId = event.params.moduleId;
    const moduleRef = db.collection("simulationModules").doc(moduleId);
    const workspaceRef = after.workspaceRef;

    console.log("Simulation module deployed:", moduleId);

    try {
      let usersToProcess: any[] = [];
      if (justDeployed) {
        usersToProcess = afterAssigned;
      } else if (assignedChanged) {
        usersToProcess = newUserRefs;
      }

      console.log(`Users to process: ${usersToProcess.length}`);

      const lessonsSnap = await db
        .collection("simulationLessons")
        .where("moduleRef", "==", moduleRef)
        .get();

      const lessons = lessonsSnap.docs;
      console.log(`Lessons found: ${lessons.length}`);

      let batch = db.batch();
      let opCount = 0;
      const MAX_BATCH = 400;
      const commits: Promise<any>[] = [];

      const commitIfNeeded = async () => {
        if (opCount >= MAX_BATCH) {
          commits.push(batch.commit());
          batch = db.batch();
          opCount = 0;
        }
      };


      // iterate thru users
      for (const userRef of usersToProcess) {
        const existing = await db
          .collection("simulationModuleAttempts")
          .where("user", "==", userRef)
          .where("moduleInfo", "==", moduleRef)
          .limit(1)
          .get();

        if (!existing.empty) {
          console.log("Skipping existing attempt for user:", userRef.id);
          continue;
        }

        const moduleAttemptRef = db
          .collection("simulationModuleAttempts")
          .doc();

        batch.set(moduleAttemptRef, {
          workspaceRef,
          user: userRef,
          moduleInfo: moduleRef,
          status: "not begun",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          percent: 0,
        });

        opCount++;

        await commitIfNeeded();

        // iterate thru lessons
        for (const lessonDoc of lessons) {
          const lessonAttemptRef = db
            .collection("simulationLessonAttempts")
            .doc();

          batch.set(lessonAttemptRef, {
            user: userRef,
            moduleRef: moduleAttemptRef,
            lessonInfo: lessonDoc.ref,
            status: "not begun",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          opCount++;

          await commitIfNeeded();
        }
      }

      if (opCount > 0) commits.push(batch.commit());

      await Promise.all(commits);

      console.log("Simulation attempts created successfully");
    } catch (err) {
      console.error("Error creating simulation attempts:", err);
    }
  }
);

export const onStandardModuleDeployed = onDocumentUpdated(
  "standardModules/{moduleId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    const wasDeployed = before.deployed;
    const isDeployed = after.deployed;

    const beforeAssigned = before.assignedUsers || [];
    const afterAssigned = after.assignedUsers || [];

    const getIds = (arr: any[]) => arr.map((ref) => ref.id);
    const beforeIds = new Set(getIds(beforeAssigned));
    const newUserRefs = afterAssigned.filter(
      (ref: any) => !beforeIds.has(ref.id)
    );

    const justDeployed = !wasDeployed && isDeployed;
    const assignedChanged =
      isDeployed &&
      JSON.stringify(getIds(beforeAssigned)) !==
      JSON.stringify(getIds(afterAssigned));
    if (!justDeployed && !assignedChanged) return;

    const moduleId = event.params.moduleId;
    const moduleRef = db.collection("standardModules").doc(moduleId);
    const workspaceRef = after.workspaceRef;

    console.log("Standard module deployed:", moduleId);

    try {
      let usersToProcess: any[] = [];
      if (justDeployed) {
        usersToProcess = afterAssigned;
      } else if (assignedChanged) {
        usersToProcess = newUserRefs;
      }

      console.log(`Users to process: ${usersToProcess.length}`);

      const lessons: FirebaseFirestore.DocumentReference[] =
                after.lessonRefs || [];


      let batch = db.batch();
      let opCount = 0;
      const MAX_BATCH = 400;
      const commits: Promise<any>[] = [];

      const commitIfNeeded = async () => {
        if (opCount >= MAX_BATCH) {
          commits.push(batch.commit());
          batch = db.batch();
          opCount = 0;
        }
      };

      // iterate thru users
      for (const userRef of usersToProcess) {
        const existing = await db
          .collection("standardModuleAttempts")
          .where("user", "==", userRef)
          .where("moduleInfo", "==", moduleRef)
          .limit(1)
          .get();

        if (!existing.empty) {
          console.log("Skipping existing attempt for user:", userRef.id);
          continue;
        }

        const moduleAttemptRef = db
          .collection("standardModuleAttempts")
          .doc();

        batch.set(moduleAttemptRef, {
          workspaceRef,
          user: userRef,
          moduleInfo: moduleRef,
          status: "not begun",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          percent: 0,
        });

        opCount++;
        await commitIfNeeded();

        // iterate thru lessons
        for (const lessonRef of lessons) {
          const lessonAttemptRef = db
            .collection("standardLessonAttempts")
            .doc();

          batch.set(lessonAttemptRef, {
            user: userRef,
            moduleRef: moduleAttemptRef,
            lessonInfo: lessonRef,
            status: "not begun",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          opCount++;
          await commitIfNeeded();
        }
      }

      if (opCount > 0) commits.push(batch.commit());

      await Promise.all(commits);

      console.log("Standard attempts created successfully");
    } catch (err) {
      console.error("Error creating standard attempts:", err);
    }
  }
);
