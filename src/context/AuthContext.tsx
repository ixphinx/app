import React, { createContext, useContext, useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  confirmation: FirebaseAuthTypes.ConfirmationResult | null;
  signInWithPhoneNumber: (phone: string) => Promise<void>;
  confirmCode: (code: string) => Promise<void>;
  resetConfirmation: () => void;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  useEffect(() => {
    console.log("👀 AuthProvider montado");

    const unsubscribeAuth = auth().onAuthStateChanged((usr) => {
      console.log("🔄 onAuthStateChanged:", usr ? "LOGGED IN" : "LOGGED OUT");
      setUser(usr);
      setLoading(false);
    });

    const unsubscribeToken = auth().onIdTokenChanged((usr) => {
      console.log("🔁 Token refrescado");
      setUser(usr);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, []);

  const signInWithPhoneNumber = async (phone: string) => {
    const confirm = await auth().signInWithPhoneNumber(phone);
    setConfirmation(confirm);
  };

  const confirmCode = async (code: string) => {
    if (!confirmation) throw new Error("No se ha enviado un código");
    await confirmation.confirm(code);
  };

  const resetConfirmation = () => {
    setConfirmation(null);
  };

  const getIdToken = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken();
  };

  const signOut = async () => {
    console.log("🚪 Cerrando sesión...");
    await auth().signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        confirmation,
        signInWithPhoneNumber,
        confirmCode,
        resetConfirmation,
        signOut,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
