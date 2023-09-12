import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";

import "./index.css";

import Layout from "./pages/layout/Layout";
import Chat from "./pages/chat/Chat";
import ProfileSetup from "./pages/profileSetup/ProfileSetup";

initializeIcons();

const router = createHashRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Chat />
            },
            {
                path: "qa",
                lazy: () => import("./pages/oneshot/OneShot")
            },
            {
                path: "profile",
                element: <ProfileSetup />
                //lazy: () => import("./pages/profileSetup/ProfileSetup")
            },
            {
                path: "*",
                lazy: () => import("./pages/NoPage")
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
