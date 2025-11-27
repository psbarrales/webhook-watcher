export interface AnalyticsPort {
    setUserId(userId: string): Promise<void>;
    setUserProperty(propertyName: string, value: string): Promise<void>;
    trackEvent(
        eventName: string,
        params?: Record<string, string | number | boolean | undefined>
    ): void;
    trackView(
        viewName: string,
        params?: Record<string, string | number | boolean | undefined>
    ): void;
}
