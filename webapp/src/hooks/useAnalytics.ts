import { useMemo } from 'react';
import { useAnalyticsService } from '@providers/withAnalyticsProvider';

type AnalyticsParams = Record<string, string | number | boolean | undefined>;

type AnalyticsHook = {
    trackEvent: (eventName: string, params?: AnalyticsParams) => void;
    trackView: (viewName: string, params?: AnalyticsParams) => void;
    setUserId: (userId: string) => Promise<void>;
    setUserProperty: (propertyName: string, value: string) => Promise<void>;
};

export const useAnalytics = (): AnalyticsHook => {
    const analyticsService = useAnalyticsService();

    return useMemo(
        () => ({
            trackEvent: (eventName: string, params?: AnalyticsParams) =>
                analyticsService.trackEvent(eventName, params),
            trackView: (viewName: string, params?: AnalyticsParams) =>
                analyticsService.trackView(viewName, params),
            setUserId: (userId: string) => analyticsService.setUserId(userId),
            setUserProperty: (propertyName: string, value: string) =>
                analyticsService.setUserProperty(propertyName, value),
        }),
        [analyticsService]
    );
};

export type { AnalyticsHook };
