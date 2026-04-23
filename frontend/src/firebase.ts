import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function buildNewUserDocForGoogle(
  user: User,
  role: "employee" | "employer"
) {
  const fullName =
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "User";

  return {
    uid: user.uid,
    email: user.email,
    fullName,
    role,
    profilePicture: user.photoURL ?? "",
    notifPreference: "In-App",
    workspaceID: "workspace-1",
    joinDate: new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    }),
    ...(role === "employee"
      ? {
          employeeID: user.uid,
          jobTitle: "Sales Associate",
          assignedModules: [],
          completedModules: [],
          modulesInProgress: [],
          achievements: [],
          averageScore: 0,
          totalHours: 0,
        }
      : {
          employerID: user.uid,
          jobTitle: "Manager",
        }),
    createdAt: serverTimestamp(),
  };
}

export type GoogleSignInResult = { path: string };

/** Firestore `users` doc is the app account. Missing doc is auto-created for Google users. */
export async function signInWithGoogleApp(
  role: "employee" | "employer"
): Promise<GoogleSignInResult> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    sessionStorage.setItem("currentUser", JSON.stringify(userData));
    const path = userData.role === "employer" ? "/employer" : "/employee";
    return { path };
  }

  await setDoc(userRef, buildNewUserDocForGoogle(user, role));
  const newSnap = await getDoc(userRef);
  if (newSnap.exists()) {
    sessionStorage.setItem("currentUser", JSON.stringify(newSnap.data()));
  }
  const path = role === "employer" ? "/join/employer" : "/join/employee";
  return { path };
}