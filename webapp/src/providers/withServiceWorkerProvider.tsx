import Fallback from "@pages/Fallback";
import React, { createContext, PropsWithChildren, useEffect, useState } from "react";

const ServiceWorkerContext = createContext<boolean>(false);

export const WithServiceWorkerProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isServiceWorkerAvailable, setIsServiceWorkerAvailable] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            if (import.meta.env.VITE_ENVIRONMENT == "test") {
                setIsServiceWorkerAvailable(true);
                return;
            }
            navigator.serviceWorker.register('/service-worker.js')
                .then(() => {
                    console.info('Service Worker registered successfully.');
                    setIsServiceWorkerAvailable(true);
                })
                .catch((error) => {
                    console.error('Error al registrar el Service Worker:', error);
                });

            // Manejo de notificaciones push
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NOTIFICATION') {
                    console.info('Notification received:', event.data);
                    // Handle the notification here
                }
            });

            // Handle background sync
            navigator.serviceWorker.ready.then(async (registration) => {
                if ('periodicSync' in registration) {
                    // Use type assertion since periodicSync is experimental
                    const periodicSync = (registration as any).periodicSync;
                    if (periodicSync && typeof periodicSync.getTags === 'function') {
                        periodicSync.getTags().then((tags: any) => {
                            console.info('Periodic sync tags:', tags);
                        });
                    }
                }
            });
        } else {
            console.warn('Service Worker is not supported in this browser.');
            setIsServiceWorkerAvailable(false);
        }
    }, []);

    if (!isServiceWorkerAvailable) {
        return <Fallback />;
    }

    return (
        <ServiceWorkerContext.Provider value={isServiceWorkerAvailable}>
            {children}
        </ServiceWorkerContext.Provider>
    );
};

export const useServiceWorker = (): boolean => {
    const context = React.useContext(ServiceWorkerContext);
    if (context === undefined) {
        throw new Error("useServiceWorker debe ser usado dentro de withServiceWorkerProvider");
    }
    return context;
};
