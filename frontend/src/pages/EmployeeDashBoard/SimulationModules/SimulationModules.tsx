import './SimulationModules.css';
import { useState, useEffect } from 'react';
//import { moduleAttempts } from '../../../dummy_data/modulesAttempt_data';
import ModuleCard from '../../../cards/ModuleCard/ModuleCard';
import type { EmployeeUserType } from '../../../types/User/UserType';
import type { ModuleAttemptType } from '../../../types/Modules/ModuleAttemptType';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from '../../../firebase';

/*
const modules: ModuleAttemptType[] = [
    {   
        attempt_id: 1,
        moduleInfo: {
            id: 1,
            title: "Store Orientation and Navigation",
            hours: "1:30",
            numLessons: 3,
            deployed: true 
        },
        status: "completed"
    },
    {   
        attempt_id: 2,
        moduleInfo: {
            id: 2,
            title: "Product Knowledge & Inventory",
            hours: "1:30",
            numLessons: 3
        },
        status: "started",
        percent: 60
    },
    {   
        attempt_id: 3,
        moduleInfo: {
        id: 3,
        title: "Customer Interaction & Communication",
        hours: "1:30",
        numLessons: 3
        },
        status: "not begun"
    },
    {   
        attempt_id: 4,
        moduleInfo: {
            id: 4,
            title: "Checkout, POS, & Transactions",
            hours: "1:30",
            numLessons: 3,
        },
        status: "not begun"
    },
    {   
        attempt_id: 5,
        moduleInfo: {
            id: 5,
            title: "Safety, Compliance, & Store Policy",
            hours: "1:30",
            numLessons: 3,
        },
        status: "not begun"
    },
    {   
        attempt_id: 6,
        moduleInfo: {
            id: 6,
            title: "Multitasking & Real World Pressure",
            hours: "1:30",
            numLessons: 3,
        },
        status: "not begun"
    },
];
*/
export default function SimulationModules({ user }: { user: EmployeeUserType }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    useEffect(() => {
        async function fetchModuleAttempts() {
            if (!user?.workspaceID) return;
        
            setLoading(true);
            try {
                const currentUserRef = doc(db, "users", user.uid);
                const q = query(
                    collection(db, "simulationModuleAttempts"),
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
                        const moduleInfo = moduleSnap.exists() ? 
                            {
                                id: moduleSnap.id,
                                ...(moduleSnap.data() as Omit<StandardModuleType, "id">),
                            } : null;
                        const moduleAttemptRef = docSnap.ref;
                        const lessonSnap = await getDocs(
                            query(
                                collection(db, "standardLessonAttempts"),
                                where("moduleRef", "==", moduleAttemptRef)
                            )
                        );

                        const totalLessons = lessonSnap.size;
                        let completedCount = 0;

                        lessonSnap.docs.forEach((lessonDoc) => {
                            const lessonData = lessonDoc.data();
                            if (lessonData.status === "completed") {
                                completedCount++;
                            }
                        });

                        const percent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
                        
                        return {
                            id: docSnap.id,
                            status: data.status,
                            percent,
                            moduleInfo
                        } as ModuleAttemptType;
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
        <div className="employee-modules">
            <div className="modules-header">
                <div>
                    <h1>Simulation Modules</h1>
                    <p>View simulation tasks.</p>
                </div>
            </div>

            <div className="modules-grid">
                {/*moduleAttempts.map((m) => (<ModuleCard moduleInfo={m.moduleInfo} type={"simulation"} role={"employee"} status={m.status} percent={m.percent} style={true} />))*/}
            </div>

            <div className="filler-space"></div>
        </div>
    );
}