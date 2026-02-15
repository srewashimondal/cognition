import React, {createContext, useContext, useEffect, useState,} from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import type { EmployerUserType, EmployeeUserType } from "../types/User/UserType";

type AppUser = EmployerUserType | EmployeeUserType;

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (userSnap.exists()) {
        const data = userSnap.data();

        setUser({
          uid: firebaseUser.uid,
          ...data,
        } as AppUser);
        } else {
          setUser(null);
        }

        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
