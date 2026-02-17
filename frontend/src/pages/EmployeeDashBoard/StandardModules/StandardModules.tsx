import './StandardModules.css';
import { useState, useEffect } from 'react';
// import { standardModuleAttempt } from '../../../dummy_data/standardAttempt_data';
import ModuleCard from '../../../cards/ModuleCard/ModuleCard';
import type { StandardModuleType } from '../../../types/Standard/StandardModule';
import type { EmployeeUserType } from '../../../types/User/UserType';
import type { StandardModuleAttempt } from '../../../types/Standard/StandardAttempt';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '../../../firebase';

export default function StandardModules({ user }: { user: EmployeeUserType }) {
    const [moduleAttempts, setModuleAttempts] = useState<StandardModuleAttempt[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchModuleAttempts() {
            if (!user?.workspaceID) return;
        
            setLoading(true);
            try {
                const currentUserRef = doc(db, "users", user.uid);
                const q = query(
                    collection(db, "standardModuleAttempts"),
                    where("user", "==", currentUserRef),
                    where("workspaceRef", "==", user.workspaceID)
                );
      
                const snapshot = await getDocs(q);
                const attempts = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    console.log("data:", data);
                    console.log("moduleRef:", data.moduleInfo);
                    const moduleSnap = await getDoc(data.moduleInfo);
                    return {
                        id: docSnap.id,
                        status: data.status,
                        percent: data.percent,
                        moduleInfo: moduleSnap.exists()
                            ? {
                                id: moduleSnap.id,
                                ...(moduleSnap.data() as Omit<StandardModuleType, "id">),
                            } : null,
                    } as StandardModuleAttempt;
                })
                );
      
                setModuleAttempts(attempts);
                console.log("Received module attempts")
          } catch (error) {
                console.error("Error fetching module attempts:", error);
          } finally {
                setLoading(false);
          }
        }
      
        fetchModuleAttempts();
      }, [user]);
      


    return (
        <div className="standard-lesson-view">
            <div className="modules-header">
                <div>
                    <h1>Standard Modules</h1>
                    <p></p>
                </div>
            </div>

            <div className="modules-grid">
                {moduleAttempts.map((m) => (<ModuleCard moduleInfo={m.moduleInfo} type={"standard"} role={"employee"} status={m.status} percent={m.percent} style={true} attemptId={m.id} />))}
            </div>

            <div className="filler-space"></div>
        </div>
    );
}