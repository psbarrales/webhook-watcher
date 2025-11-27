import { ComponentType, useRef } from 'react';
import { createProvider } from './createProvider';
import { useAuthorizationUseCase } from '@application/auth/useAuthorizationUseCase';
import { useAuthorizationAPIClient } from '@infrastructure/api/useAuthorizationAPIClient';
import { useFirebaseAuth } from '@infrastructure/firebase/useFirebaseAuth';

export const {
    Provider: AuthProvider,
    useProvider: useAuth,
    withProvider: withAuth,
} = createProvider('auth', () => {
    const authAPIRef = useRef(useAuthorizationAPIClient());
    const authorization = useAuthorizationUseCase(authAPIRef.current);

    // Integración con Firebase Authentication
    const { user: userGoogle, loading: loadingGoogle, signInWithGoogle, logout: logoutGoogle } = useFirebaseAuth();

    return {
        ...authorization,
        userGoogle,
        loadingGoogle,
        loginWithGoogle: signInWithGoogle,
        logoutGoogle,
        // Alias para compatibilidad con componentes existentes
        user: userGoogle,
        loading: loadingGoogle,
        logout: logoutGoogle,
    };
}, 'useAuth debe ser usado dentro de AuthProvider');

export const withAuthProvider = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        return (
            <AuthProvider>
                <WrappedComponent {...props} />
            </AuthProvider>
        );
    };
};
