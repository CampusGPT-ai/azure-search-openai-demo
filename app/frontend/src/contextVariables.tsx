import React from "react";
import { InterestModel, ProfileModel, TopicModel } from "./api/models";
import { usePresenceBadgeStyles_unstable } from "@fluentui/react-components";

export type updateSelectedInterestFunc = (interest: InterestModel) => void;

// Initial context state
const initialUserState = {
    user: null as ProfileModel | null,
    setUser: (_user: ProfileModel | null) => {},
    setSelectedProfile: (_selectedProfile: string) => {},
    selectedProfile: "none" as string
};

const initialTopicState = {
    topics: [] as TopicModel[],
    setTopics: (_topics: TopicModel[]) => {}
};

// Create the context
const UserContext = React.createContext(initialUserState);
const TopicContext = React.createContext(initialTopicState);

export { UserContext, TopicContext };
