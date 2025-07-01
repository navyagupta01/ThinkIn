// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type UserRole = 'student' | 'teacher';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  getTotalStudents: () => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTotalStudents = async () => {
    try {
      console.log('getTotalStudents: Starting query');
      const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      console.log('getTotalStudents: Query constructed:', studentsQuery);
      const querySnapshot = await getDocs(studentsQuery);
      console.log('getTotalStudents: Query succeeded, size:', querySnapshot.size);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error fetching total students:', error.code, error.message, error.stack);
      return 0;
    }
  };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    console.log('Auth state changed:', firebaseUser?.email);

    if (firebaseUser) {
      setFirebaseUser(firebaseUser);

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userObj = {
            id: firebaseUser.uid,
            name: userData.name || firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            role: userData.role || 'student',
          };
          console.log('Setting user data:', userObj);
          setUser(userObj);
        } else {
          console.warn('User document does not exist for UID:', firebaseUser.uid);
          const fallbackUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            role: 'student' as UserRole,
          };
          console.log('Setting fallback user data:', fallbackUser);
          setUser(fallbackUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        const errorFallbackUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'student' as UserRole,
        };
        console.log('Setting error fallback user data:', errorFallbackUser);
        setUser(errorFallbackUser);
      }
    } else {
      console.log('No user, clearing state');
      setFirebaseUser(null);
      setUser(null);
    }
    setIsLoading(false);
  });

  return () => unsubscribe();
}, []);

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      console.log('Starting signup process...');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Firebase user created:', firebaseUser.uid);

      await updateProfile(firebaseUser, {
        displayName: name,
      });
      console.log('Display name updated');

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      });
      console.log('Firestore document created');

      const newUser = {
        id: firebaseUser.uid,
        name,
        email,
        role,
      };

      setUser(newUser);
      setFirebaseUser(firebaseUser);
      console.log('Signup process completed');
    } catch (error: any) {
      console.error('Signup error:', error);
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user.email);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        login,
        signup,
        logout,
        isLoading,
        getTotalStudents,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};