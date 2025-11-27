import { useCallback, useEffect, useMemo } from 'react';
import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    setPersistence,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
} from 'firebase/auth';
import { AuthorizationServicePort } from '@domain/ports/out/api/AuthorizationServicePort';
import { initialize } from '@infrastructure/firebase/initializeApp';

export const useAuthorizationAPIClient = (): AuthorizationServicePort => {
    const auth = useMemo(() => getAuth(initialize()), []);

    useEffect(() => {
        void setPersistence(auth, browserLocalPersistence);
    }, [auth]);

    const login = useCallback(async (email: string, password: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, password);
    }, [auth]);

    const register = useCallback(async (
        email: string,
        password: string,
        displayName?: string
    ): Promise<void> => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(credential.user, { displayName });
        }
    }, [auth]);

    const logout = useCallback(async (): Promise<void> => {
        await signOut(auth);
    }, [auth]);

    const subscribe = useCallback((callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    }, [auth]);

    const getCurrentUser = useCallback(() => auth.currentUser, [auth]);

    const refreshToken = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return null;
        return currentUser.getIdToken(true);
    }, [auth]);

    return {
        login,
        register,
        logout,
        onAuthStateChanged: subscribe,
        getCurrentUser,
        refreshToken,
    };
};
