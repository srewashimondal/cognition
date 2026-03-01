import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { LearningStreak } from "../types/User/UserType";

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function updateLearningStreakForUser(userId: string): Promise<LearningStreak> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error("User not found when updating learning streak");
  }

  const data = snap.data() as { learningStreak?: LearningStreak };

  const existing: LearningStreak = data.learningStreak ?? {
    current: 0,
    longest: 0,
    lastActiveDate: null,
  };

  const today = todayDateString();
  const yesterday = yesterdayDateString();

  let current = existing.current ?? 0;

  if (existing.lastActiveDate === today) {
    current = current || 1;
  } else if (existing.lastActiveDate === yesterday) {
    current = current + 1;
  } else {
    current = 1;
  }

  const longest = Math.max(existing.longest ?? 0, current);

  const updated: LearningStreak = {
    current,
    longest,
    lastActiveDate: today,
  };

  await updateDoc(userRef, { learningStreak: updated });

  return updated;
}

