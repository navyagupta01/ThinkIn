// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userObj = {
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: userData.role || 'student'
            };
            console.log('Setting user data:', userObj);
            setUser(userObj);
          } else {
            // Fallback if no Firestore document exists
            const fallbackUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: 'student' as UserRole
            };
            console.log('Setting fallback user data:', fallbackUser);
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to Firebase Auth data only
          const errorFallbackUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            role: 'student' as UserRole
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
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Firebase user created:', firebaseUser.uid);

      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: name
      });
      console.log('Display name updated');

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });
      console.log('Firestore document created');

      // The user state will be automatically updated by the onAuthStateChanged listener
      // But we can set a temporary state for immediate UI feedback
      const newUser = {
        id: firebaseUser.uid,
        name,
        email,
        role
      };
      
      setUser(newUser);
      setFirebaseUser(firebaseUser);
      console.log('Signup process completed');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setIsLoading(false);
      throw new Error(error.message);
    } finally {
      // Don't set isLoading to false here, let the auth state change handle it
      // This prevents the loading state from flickering
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user.email);
      // The user state will be set automatically by the onAuthStateChanged listener
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      // The user state will be set to null automatically by the onAuthStateChanged listener
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      login, 
      signup, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};