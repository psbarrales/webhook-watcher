import { useAuth } from "@providers/AuthProvider";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";

interface RouteProps {
    component?: React.FC<any> | JSX.Element;
}

const BuildComponent: React.FC<{ component?: React.ElementType | JSX.Element }> = ({ component }) => {
    if (React.isValidElement(component)) {
        return component;
    }

    if (typeof component === "function") {
        const Component = component;
        return <Component />;
    }

    return <Outlet />;
};

export const PublicRoute: React.FC<RouteProps> = ({ component }) => {
    return <BuildComponent component={component} />;
};

export const PublicUnAuthorizedRoute: React.FC<RouteProps> = ({ component }) => {
    const auth = useAuth();
    const location = useLocation();

    if (auth.loading) {
        return <div className="flex h-screen items-center justify-center text-sm text-slate-500">Cargando...</div>;
    }

    if (auth.user) {
        const fromPath = location.state?.from?.pathname || "/app/dashboard";
        return <Navigate to={fromPath} replace />;
    }

    return <BuildComponent component={component} />;
};

export const ProtectedRoute: React.FC<RouteProps> = ({ component }) => {
    const auth = useAuth();
    const location = useLocation();

    if (auth.loading) {
        return <div className="flex h-screen items-center justify-center text-sm text-slate-500">Cargando...</div>;
    }

    if (!auth.user) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    return <BuildComponent component={component} />;
};
