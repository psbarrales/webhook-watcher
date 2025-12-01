import { useEffect, useState, useCallback } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  User,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { initialize } from "./initializeApp";

const app = initialize();
const auth = app ? getAuth(app) : null;
const provider = new GoogleAuthProvider();

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      console.warn("Firebase Auth not initialized");
      return;
    }
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === "auth/operation-not-supported-in-this-environment") {
        await signInWithRedirect(auth, provider);
      } else if (error.code === "auth/account-exists-with-different-credential") {
        // Attempt to link accounts if the email already exists with another method
        const email = error.customData?.email;
        const pendingCred = GoogleAuthProvider.credentialFromError(error);
        if (email && pendingCred) {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.includes("password")) {
            const password = prompt("Your account already exists with email and password. Enter your password to link it:");
            if (password) {
              const userCredential = await signInWithPopup(auth, provider).catch(() => null);
              if (userCredential?.user) {
                const credential = EmailAuthProvider.credential(email, password);
                await linkWithCredential(userCredential.user, credential);
              }
            }
          }
        }
      } else {
        console.error("Error during Google sign-in:", error);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  return { user, loading, signInWithGoogle, logout };
}
