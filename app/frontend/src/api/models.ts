import { v4 as uuid } from "uuid";

export type AskRequestOverrides = {
    conversationId: string;
    isNewConversation: boolean;
    top?: number;
    temperature?: number;
    promptTemplate?: string;
    promptTemplatePrefix?: string;
    promptTemplateSuffix?: string;
    suggestFollowupQuestions?: boolean;
};

export type AskResponse = {
    conversation_id: string;
    conversation_topic: string;
    answer: string;
    thoughts: string | null;
    data_points: string[];
    follow_up: string[];
    error?: string;
};

export function createDefaultAskResponse(conversation_id?: string): AskResponse {
    return {
        conversation_id: conversation_id || uuid().toString(),
        conversation_topic: "",
        answer: "",
        thoughts: null,
        data_points: [],
        follow_up: []
    };
}

export type ChatTurn = {
    user: string;
    bot?: string;
};

export type ChatRequest = {
    history: ChatTurn[];
    approach: string;
    overrides?: AskRequestOverrides;
};

export type InterestModel = {
    interest: string;
    selected: boolean;
};

export type InterestsResponse = {
    list: Array<InterestModel>;
    error?: string;
};

export type TopicModel = {
    id: string;
    topic: string;
    question: string;
    answer: string;
    related_interests: Array<string>;
};

export type TopicResponse = {
    topic: Array<TopicModel>;
    error?: string;
};

export type ChatHistoryMessageModel = {
    timestamp: string;
    user: string;
    bot: string;
};

export type ConversationsModel = {
    id: string;
    topic: string;
    start_time: string;
    end_time: string;
    interactions: Array<ChatHistoryMessageModel>;
};

export type ConversationsResponse = {
    list: Array<ConversationsModel>;
    error?: string;
};

export type ProfileResponse = {
    profile: ProfileModel;
    error?: string;
};

export type ProfilesResponse = {
    profiles: Array<ProfileModel>;
    error?: string;
};

export type ProfileModel = {
    id: string;
    user_id: string;
    full_name: string;
    avatar: string;
    interests: Array<string>;
    demographics: {
        Ethnicity: string;
        Gender: string;
    };
    academics: {
        "Academic Year": string;
        Major: string;
        Minor: string;
    };
    courses: Array<string>;
};
