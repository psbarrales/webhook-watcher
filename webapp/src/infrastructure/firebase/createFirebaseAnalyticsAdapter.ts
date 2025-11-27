import { AnalyticsPort } from "@domain/ports/out/analytics/AnalyticsPort";
import { getAnalytics, logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { initialize } from "@infrastructure/firebase/initializeApp";

let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

const getFirebaseAnalytics = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!analyticsInstance) {
    const app = initialize();
    analyticsInstance = getAnalytics(app);
  }

  return analyticsInstance;
};

const createNoopAnalytics = (reason: string): AnalyticsPort => ({
  async setUserId() {
    console.warn(reason);
  },
  async setUserProperty() {
    console.warn(reason);
  },
  trackEvent() {
    console.warn(reason);
  },
  trackView() {
    console.warn(reason);
  },
});

export const createFirebaseAnalyticsAdapter = (): AnalyticsPort => {
  const analytics = getFirebaseAnalytics();

  if (!analytics) {
    return createNoopAnalytics("Firebase Analytics no está disponible en este entorno.");
  }

  return {
    async setUserId(userId: string): Promise<void> {
      setUserId(analytics, userId);
    },

    async setUserProperty(propertyName: string, value: string): Promise<void> {
      setUserProperties(analytics, { [propertyName]: value });
    },

    trackEvent(
      eventName: string,
      params?: Record<string, string | number | boolean | undefined>
    ): void {
      logEvent(analytics, eventName, params ?? {});
    },

    trackView(
      viewName: string,
      params?: Record<string, string | number | boolean | undefined>
    ): void {
      logEvent(analytics, "page_view", {
        page_title: viewName,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...params,
      });
    },
  };
};
