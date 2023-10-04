import React from "react";
import { ProfileModel } from "./api/models";

// Initial context state
const initialState = {
    user: null as ProfileModel | null,
    setUser: (_user: ProfileModel | null) => {}
};

// Create the context
const UserContext = React.createContext(initialState);

export default UserContext;
