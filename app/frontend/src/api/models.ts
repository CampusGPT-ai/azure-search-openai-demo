export const enum Approaches {
    RetrieveThenRead = "rtr",
    ReadRetrieveRead = "rrr",
    ReadDecomposeAsk = "rda"
}

export const enum RetrievalMode {
    Hybrid = "hybrid",
    Vectors = "vectors",
    Text = "text"
}

export type AskRequestOverrides = {
    conversationId: string;
    isNewConversation: boolean;
    retrievalMode?: RetrievalMode;
    semanticRanker?: boolean;
    semanticCaptions?: boolean;
    excludeCategory?: string;
    top?: number;
    temperature?: number;
    promptTemplate?: string;
    promptTemplatePrefix?: string;
    promptTemplateSuffix?: string;
    suggestFollowupQuestions?: boolean;
};

export type AskRequest = {
    question: string;
    approach: Approaches;
    overrides?: AskRequestOverrides;
};

export type AskResponse = {
    conversation_id: string;
    conversation_topic: string;
    answer: string;
    question: string;
    thoughts: string | null;
    data_points: string[];
    follow_up: string[];
    error?: string;
};

export type ChatTurn = {
    user: string;
    bot?: string;
};

export type ChatRequest = {
    history: ChatTurn[];
    approach: Approaches;
    overrides?: AskRequestOverrides;
};

export type InterestModel = {
    interest: string;
    selected: boolean;
};

export type ExampleModel = {
    question: string;
    conversation_topic: string;
};

export type InterestsResponse = {
    list: Array<InterestModel>;
    error?: string;
};

export type ChatHistoryMessageModel = {
    timestamp: string;
    user: string;
    bot: string;
};

export type TopicModel = {
    id: string;
    topic: string;
};

export type TopicsResponse = {
    list: Array<TopicModel>;
    error?: string;
};

export type QuestionsResponse = {
    list: Array<QuestionModel>;
    error?: string;
};

export type QuestionModel = {
    id: string;
    question: string;
    topics: Array<TopicModel>;
    interests: Array<InterestModel>;
};

export type ConversationsModel = {
    id: string;
    topic: string;
    question: string;
    start_time: string;
    end_time: string;
    interactions: Array<ChatHistoryMessageModel>;
};

export type ConversationsResponse = {
    list: Array<ConversationsModel>;
    error?: string;
};
