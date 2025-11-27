import { Navigate } from "react-router";
import { ProtectedRoute } from "./routeGuards";
import AppLayout from "@pages/App/AppLayout";
import Dashboard from "@pages/App/Dashboard";
import Options from "@pages/App/Options";
import Support from "@pages/App/Support";

export default [{
    path: "app",
    element: <ProtectedRoute component={<AppLayout />} />,
    children: [
        {
            path: "",
            element: <Navigate to={"/app/dashboard"} replace />
        },
        {
            path: "dashboard",
            element: <Dashboard />
        },
        {
            path: "options",
            element: <Options />
        },
        {
            path: "support",
            element: <Support />
        }
    ],
}];
