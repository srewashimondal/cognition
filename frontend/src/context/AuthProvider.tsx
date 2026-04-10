import React, {createContext, useContext, useEffect, useState,} from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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
    let unsubscribeUser: (() => void) | null = null;
  
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
  
      const userRef = doc(db, "users", firebaseUser.uid);
  
      unsubscribeUser = onSnapshot(userRef, (snap) => {
        if (!snap.exists()) {
          setUser(null);
          setLoading(false);
          return;
        }
  
        const data = snap.data();
  
        setUser({
          uid: firebaseUser.uid,
          ...data,
        } as AppUser);
  
        setLoading(false);
      });
    });
  
    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
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
