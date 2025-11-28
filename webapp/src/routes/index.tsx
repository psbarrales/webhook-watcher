import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import { Outlet } from "react-router";
import NotFound from "@pages/NotFound";
import { PublicRoute } from "@routes/routeGuards";
import auth from "./auth";
import app from "./app";
import NotImplemented from "@pages/NotImplemented";
import VersionUpdatePrompt from "@pages/VersionUpdatePrompt";
import Home from "@pages/Home/Home";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicRoute component={<Outlet />} />,
        errorElement: <NotFound />,
        children: [
            {
                path: "",
                element: <Home />
            },
            {
                path: ":webhookId",
                element: <Home />
            },
            {
                path: ":webhookId/requests/:requestId",
                element: <Home />
            },
            {
                path: "update",
                element: <VersionUpdatePrompt />
            },
            {
                path: "debug",
                element: <NotImplemented />
            },
            ...auth,
            ...app,
            {
                path: "*",
                element: <Navigate to="/" replace />
            }
        ]
    },
]);

export default router;
