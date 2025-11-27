import { useCallback, useEffect, useMemo, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { AuthorizationServicePort } from '@domain/ports/out/api/AuthorizationServicePort';
import { IAuthorizationPort } from '@domain/ports/in/IAuthorizationPort';

const parseErrorMessage = (error: unknown): string => {
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'El correo electrónico no es válido.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Credenciales incorrectas. Revisa tu correo y contraseña.';
            case 'auth/email-already-in-use':
                return 'Ya existe una cuenta asociada a este correo electrónico.';
            case 'auth/weak-password':
                return 'La contraseña debe tener al menos 6 caracteres.';
            default:
                return error.message;
        }
    }
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    try {
        return JSON.stringify(error);
    } catch {
        return 'Unexpected authentication error';
    }
};

export const useAuthorizationUseCase = (
    service: AuthorizationServicePort
): IAuthorizationPort => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState(service.getCurrentUser());

    useEffect(() => {
        const unsubscribe = service.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const idToken = await firebaseUser.getIdToken();
                setToken(idToken);
                setIsAuthenticated(true);
            } else {
                setToken(null);
                setIsAuthenticated(false);
            }
            setIsReady(true);
        });

        return unsubscribe;
    }, [service]);

    const wrap = useCallback(<Args extends unknown[]>(fn: (...args: Args) => Promise<void>) => {
        return async (...args: Args) => {
            setIsProcessing(true);
            setError(null);
            try {
                await fn(...args);
            } catch (err) {
                const message = parseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsProcessing(false);
            }
        };
    }, []);

    const login = useMemo(() => wrap(service.login), [wrap, service]);
    const register = useMemo(() => wrap(service.register), [wrap, service]);
    const logout = useMemo(() => wrap(service.logout), [wrap, service]);

    const refreshToken = useCallback(async () => {
        const newToken = await service.refreshToken();
        if (newToken) {
            setToken(newToken);
        }
        return newToken;
    }, [service]);

    const clearError = useCallback(() => setError(null), []);

    return {
        login,
        register,
        logout,
        refreshToken,
        isAuthenticated,
        isReady,
        isProcessing,
        user,
        token,
        error,
        clearError,
    };
};
