import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { UserContext, TopicContext } from "./contextVariables";
import { ProfileModel, TopicModel } from "./api";

import "./index.css";

import Layout from "./pages/layout/Layout";
import Chat from "./pages/chat/Chat";
import ProfileSetup from "./pages/profileSetup/ProfileSetup";

initializeIcons();

const App: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState<ProfileModel | null>(null);
    const [topics, setTopics] = useState<TopicModel[]>([]);
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

    return (
        <UserContext.Provider value={{ user: loggedInUser, setUser: setLoggedInUser }}>
            <TopicContext.Provider value={{ topics: topics, setTopics: setTopics }}>
                <RouterProvider router={router} />
            </TopicContext.Provider>
        </UserContext.Provider>
    );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
