import React, {
    ComponentType,
    PropsWithChildren,
    createContext,
    useContext,
    useMemo,
} from 'react';
import { AnalyticsPort } from '@domain/ports/out/analytics/AnalyticsPort';
import { createFirebaseAnalyticsAdapter } from '@infrastructure/firebase/createFirebaseAnalyticsAdapter';

const AnalyticsContext = createContext<AnalyticsPort | null>(null);

export const WithAnalyticsProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const analyticsService = useMemo(() => createFirebaseAnalyticsAdapter(), []);

    return (
        <AnalyticsContext.Provider value={analyticsService}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const withAnalytics = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const analytics = useAnalyticsService();
        return <WrappedComponent {...props} analytics={analytics} />;
    };
};

export const useAnalyticsService = (): AnalyticsPort => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalyticsService debe ser usado dentro de WithAnalyticsProvider');
    }
    return context;
};

export { AnalyticsContext };
