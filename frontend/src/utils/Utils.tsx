import { collection, query, getDocs, updateDoc, where } from "firebase/firestore";
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 

export function formatTimestamp(timestamp: string) {
    if (!timestamp) return 'Unknown';
    
    const secondsMatch = timestamp.match(/seconds=(\d+)/);  
    if (!secondsMatch) return 'Invalid date';
    
    const seconds = parseInt(secondsMatch[1]);
    const date = new Date(seconds * 1000);
    
    return date.toLocaleString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).replace(' at ', ' ').replace(/\s(?=[AP]M$)/, '');
}

export function formatTimestampString(timestamp: string) {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export async function updateModuleStatus(moduleAttemptRef: any) {
    const lessonSnap = await getDocs(
        query(
            collection(db, "standardLessonAttempts"),
            where("moduleRef", "==", moduleAttemptRef)
        )
    );

    let started = false;
    let completedCount = 0;

    lessonSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.status !== "not begun") started = true;
        if (data.status === "completed") completedCount++;
    });

    const total = lessonSnap.size;

    let newStatus = "not begun";
    if (completedCount === total && total > 0) {
        newStatus = "completed";
    } else if (started) {
        newStatus = "started";
    }

    await updateDoc(moduleAttemptRef, {
        status: newStatus,
        percent: total === 0 ? 0 : Math.round((completedCount / total) * 100),
    });
}

export function generateJoinCode(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
  
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
  
    return code;
}

export const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
};