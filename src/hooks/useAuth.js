import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Adjust this path as needed

/**
 * Determines a user's role based on their email format.
 * Assumes numeric usernames (e.g., '2107123@cit.edu.in') are students.
 */
const determineUserRole = (email) => {
  if (!email) return 'staff';
  const username = email.split('@')[0];
  return /^\d+$/.test(username) ? 'student' : 'staff';
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const firestoreData = userSnap.data();

          // Ensure default appId if missing or null
          if (!firestoreData.appId) {
            const updatedData = { ...firestoreData, appId: 'trackademic-prod' };
            await setDoc(userRef, updatedData, { merge: true }); // merge ensures only appId is updated
            setUser({ ...updatedData, ...firebaseUser });
          } else {
            setUser({ ...firestoreData, ...firebaseUser });
          }
        } else {
          // New user creation
          const role = determineUserRole(firebaseUser.email);
          const newUserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || null,
            role,
            onboardingComplete: false,
            appId: 'trackademic-prod',
            createdAt: new Date(),
          };

          try {
            await setDoc(userRef, newUserProfile);
            setUser({ ...newUserProfile, ...firebaseUser });
          } catch (error) {
            console.error('Error creating user document in Firestore:', error);
            setUser(firebaseUser);
          }
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: 'cit.edu.in' });
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const emailSignIn = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      throw error;
    }
  };

  const emailSignUp = async (email, password) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    googleSignIn,
    emailSignIn,
    emailSignUp,
    logout,
  };
};
