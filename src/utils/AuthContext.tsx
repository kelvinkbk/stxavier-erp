// src/utils/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import { User } from '../types';
import { LocalStorageService } from '../services/localStorage';
import { PlatformStorageService } from '../services/platformStorage';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Debug storage
          console.log('Platform:', PlatformStorageService.getPlatformInfo());
          await PlatformStorageService.debugStorage();
          
          let userData = await LocalStorageService.getUser(firebaseUser.uid);
          console.log('Retrieved user data for UID:', firebaseUser.uid, userData);
          
          if (userData) {
            // Check if user has username field, if not add it for backward compatibility
            if (!userData.username) {
              userData.username = userData.email.split('@')[0] || 'user' + Date.now();
              // Save updated user data with username
              await LocalStorageService.saveUser(firebaseUser.uid, userData);
            }
            setUser(userData);
          } else {
            // User authenticated but no profile found on this platform
            // This happens when user was registered on a different platform
            console.log('No user profile found for authenticated user:', firebaseUser.uid);
            console.log('User email:', firebaseUser.email);
            
            // Determine role based on email or other criteria
            let role: 'admin' | 'faculty' | 'student' = 'student';
            
            // Check if this should be an admin user (replace with your admin email)
            if (firebaseUser.email === 'kelvinkbk2006@gmail.com' || 
                firebaseUser.email === 'admin@stxavier.edu') {
              role = 'admin';
            }
            
            const profileData: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              username: firebaseUser.email?.split('@')[0] || 'user' + Date.now(),
              role: role,
              createdAt: new Date(),
            };
            
            console.log('Creating cross-platform profile with role:', role, profileData);
            await LocalStorageService.saveUser(firebaseUser.uid, profileData);
            setUser(profileData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
