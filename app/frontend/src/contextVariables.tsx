import React from "react";
import { ProfileModel, TopicModel } from "./api/models";

// Initial context state
const initialUserState = {
    user: null as ProfileModel | null,
    setUser: (_user: ProfileModel | null) => {}
};

const initialTopicState = {
    topics: [] as TopicModel[],
    setTopics: (_topics: TopicModel[]) => {}
};

// Create the context
const UserContext = React.createContext(initialUserState);
const TopicContext = React.createContext(initialTopicState);

export { UserContext, TopicContext };
