import React, { ComponentType, PropsWithChildren } from "react";
import { composeProviders } from "./composeProvider";

export const withProvider = <P extends object>(
    providers: React.FC<PropsWithChildren> | React.FC<PropsWithChildren>[],
    Component: ComponentType<P>
): React.FC<P> => {
    // Handle a single provider by turning it into an array
    const ComposedProviders = Array.isArray(providers)
        ? composeProviders(...providers)
        : ({ children }: PropsWithChildren) => React.createElement(providers, null, children);

    // Retorna el componente envuelto en los providers compuestos
    return (props: P) => (
        <ComposedProviders>
            <Component {...props} />
        </ComposedProviders>
    );
};
