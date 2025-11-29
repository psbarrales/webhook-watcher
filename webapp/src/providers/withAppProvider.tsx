import React, { createContext, useContext, useState, useEffect, ComponentType, useRef, PropsWithChildren } from 'react';
import { AppPort } from '@domain/ports/out/app/AppPort';
import { useAppAdapter } from '@infrastructure/capacitor/useAppAdapter';
import RequestPrompt from '@pages/RequestPrompt';

const AppContext = createContext<AppPort | null>(null);

// Initialize with App Adapter for web environment
export const WithAppProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const appAdapter = useAppAdapter();
    const appServiceRef = useRef<AppPort | null>(appAdapter);
    const [initialized, setInitialized] = useState(false);
    const [isConnected, setIsConnected] = useState<boolean | undefined>();

    // Add event listeners to detect connection changes
    const handleOnline = () => { console.info('handleOnline'); setIsConnected(true) };
    const handleOffline = () => { console.info('handleOffline'); setIsConnected(false) };

    useEffect(() => {
        // Initialize the app service
        if (!appServiceRef.current) {
            appServiceRef.current = appAdapter;
        }
        setInitialized(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.ononline = handleOnline;
        window.onoffline = handleOffline;

        return () => {
            // Clean up event listeners when unmounting the component
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.ononline = null;
            window.onoffline = null;
        }
    }, [appAdapter]);

    useEffect(() => {
        if (typeof isConnected === 'undefined' && navigator.onLine) {
            setIsConnected(true)
        } else if (typeof isConnected !== 'undefined') {
            setIsConnected(navigator.onLine)
        }
    }, [navigator.onLine])

    return (
        <AppContext.Provider value={appServiceRef.current}>
            {(initialized && isConnected === false) && <RequestPrompt title='No internet connection' message='Please check your connection and try again.' />}
            {children}
        </AppContext.Provider>
    );
};

export const withApp = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const app = useApp();
        return <WrappedComponent {...props} app={{ ...app }} />;
    };
};

export const useApp = (): AppPort => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp debe ser usado dentro de withAppProvider');
    }
    return context;
};
