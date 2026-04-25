import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>({ uid: 'public-user', email: 'public@workspace.com', displayName: 'Public User' });
  const [profile, setProfile] = useState<UserProfile | null>({
    uid: 'public-user',
    email: 'public@workspace.com',
    role: 'Admin',
    name: 'Public User'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No-op - we don't want real auth anymore
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error signing in", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      
      // Check if this is the first user ever - if so, make them admin
      const q = query(collection(db, 'users'), limit(1));
      const snapshot = await getDocs(q);
      const isFirstUser = snapshot.empty;

      const profile: UserProfile = {
        uid: user.uid,
        email,
        name,
        role: isFirstUser ? 'Admin' : 'FOS'
      };

      await setDoc(doc(db, 'users', user.uid), profile);
      setProfile(profile);
    } catch (error: any) {
      console.error("Error signing up", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
