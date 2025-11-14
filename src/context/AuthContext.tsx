import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { initializeApi } from '../services/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  confirmation: any | null;
  signInWithPhoneNumber: (phoneNumber: string) => Promise<void>;
  confirmCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmation, setConfirmation] = useState<any>(null);

  // Detect user state
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (usr) => {
      setUser(usr);
      setLoading(false);

      if (usr) {
        const token = await usr.getIdToken();
        initializeApi(() => Promise.resolve(token));
      }
    });

    return unsubscribe;
  }, []);

  // Send SMS
  const signInWithPhoneNumber = async (phoneNumber: string) => {
    try {
      const confirmObj = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirmation(confirmObj);
    } catch (err) {
      console.error("Error sending SMS:", err);
      throw err;
    }
  };

  // Confirm SMS code
  const confirmCode = async (code: string) => {
    try {
      if (!confirmation) throw new Error("No confirmation available");

      const result = await confirmation.confirm(code);

      const token = await result.user.getIdToken();
      initializeApi(() => Promise.resolve(token));

      setConfirmation(null);
    } catch (err) {
      console.error("Error verifying code:", err);
      throw err;
    }
  };

  const signOut = async () => {
    await auth().signOut();
  };

  const getIdToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        confirmation,
        signInWithPhoneNumber,
        confirmCode,
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
