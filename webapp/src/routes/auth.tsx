import { Navigate } from "react-router";
import { PublicUnAuthorizedRoute } from "./routeGuards";
import AuthLayout from "@pages/Auth/AuthLayout";
import Login from "@pages/Auth/Login";
import Register from "@pages/Auth/Register";

export default [
    {
        path: "auth",
        element: <PublicUnAuthorizedRoute component={<AuthLayout />} />,
        children: [
            {
                path: "",
                element: <Navigate to={"/auth/login"} replace />
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            }
        ],
    }
];
