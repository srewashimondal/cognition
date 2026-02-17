import React, { createContext, useContext, useEffect, useState } from "react";
import type { StoreType, WorkspaceType } from "../types/User/WorkspaceType";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthProvider";

type WorkspaceContextType = {
    workspace: WorkspaceType | null;
    loading: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType>({
    workspace: null,
    loading: true,
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [workspace, setWorkspace] = useState<WorkspaceType | null>(null);
    const [loading, setLoading] = useState(true);

    // console.log("WorkspaceProvider mounted");

    /*useEffect(() => {
        async function loadWorkspace() {
            if (!user) {
                setWorkspace(null);
                setLoading(false);
                return;
            }
            
            const userSnap = await getDoc(doc(db, "users", user.uid));
            // console.log("User exists:", userSnap.exists());
            // console.log("User data:", userSnap.data());

            const workspaceRef = userSnap.data()?.workspaceID;
            
            if (!workspaceRef) {
                setWorkspace(null);
                setLoading(false);
                return;
            }
            
            const workspaceSnap = await getDoc(workspaceRef);
            // console.log("Workspace exists:", workspaceSnap.exists());
            // console.log("Workspace data:", workspaceSnap.data());

            if (workspaceSnap.exists()) {
                const workspaceData = workspaceSnap.data() as Omit<WorkspaceType, "id">;

                let storeData: StoreType | undefined = undefined;
                if (workspaceData.storeID) {
                    console.log("Fetching store data for storeID:", workspaceData.storeID.path);
                    const storeSnap = await getDoc(workspaceData.storeID);
                    if (storeSnap.exists()) {
                        const data = storeSnap.data();
                        if (data.storeName && data.category && data.storeFormat) {
                            storeData = data as StoreType;
                            console.log("Store data fetched:", storeData);
                        } else {
                            console.error("Store data missing required fields:", data);
                        }
                    }
                }
            
                setWorkspace({
                    id: workspaceSnap.id,
                    ...workspaceData,
                    store: storeData ?? { 
                        storeName: "Store Not Found",
                        category: "General Retail",
                        storeFormat: "Standalone Store"
                    }
                });
            } else {
                setWorkspace(null);
            }
            
            setLoading(false);
        }

        loadWorkspace();
    }, [user]); */

    useEffect(() => {
        async function loadWorkspace() {
            if (!user?.workspaceID) {
                setWorkspace(null);
                setLoading(false);
                return;
            }
            setLoading(true);
        
            try {
                const workspaceSnap = await getDoc(user.workspaceID);
            
                if (workspaceSnap.exists()) {
                    const workspaceData = workspaceSnap.data() as Omit<WorkspaceType, "id">;
                    let storeData: StoreType | undefined = undefined;
                    if (workspaceData.storeID) {
                        console.log("Fetching store data for storeID:", workspaceData.storeID.path);
                        const storeSnap = await getDoc(workspaceData.storeID);
                        if (storeSnap.exists()) {
                            const data = storeSnap.data();
                            if (data.storeName && data.category && data.storeFormat) {
                                storeData = data as StoreType;
                                console.log("Store data fetched:", storeData);
                            } else {
                                console.error("Store data missing required fields:", data);
                            }
                        }
                    }
                
                    setWorkspace({
                        id: workspaceSnap.id,
                        ...workspaceData,
                        store: storeData ?? { 
                            storeName: "Store Not Found",
                            category: "General Retail",
                            storeFormat: "Standalone Store"
                        }
                    });
                } else {
                    setWorkspace(null);
                }
            } catch (err) {
                console.error("Workspace load error:", err);
                setWorkspace(null);
            }
            setLoading(false);
        }
        
        loadWorkspace();
    }, [user]);
      

    return (
    <WorkspaceContext.Provider value={{ workspace, loading }}>
        {children}
    </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
