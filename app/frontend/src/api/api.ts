import {
    AskResponse,
    ChatTurn,
    ChatRequest,
    InterestsResponse,
    ConversationsResponse,
    ProfileResponse,
    ProfilesResponse,
    TopicResponse,
    createDefaultProfile
} from "./models";

export async function chatApi(question: string, answers: [string, AskResponse][], conversationId?: string, isNewConversation?: boolean): Promise<AskResponse> {
    const history: ChatTurn[] = answers?.map(a => ({ user: a[0], bot: a[1].answer })) || [];

    const response = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            history: [...history, { user: question, bot: undefined }],
            approach: "rrr",
            overrides: {
                conversation_id: conversationId || "",
                is_new_conversation: isNewConversation || false,
                suggest_followup_questions: true
            }
        })
    });

    const parsedResponse: AskResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function interestsAllApi(): Promise<InterestsResponse> {
    const response = await fetch("/interests", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const parsedResponse: InterestsResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

//TODO: Add topics api to python app
export async function topicsAllApi(): Promise<TopicResponse> {
    const response = await fetch("/topics", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const parsedResponse: TopicResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function demoProfilesApi(): Promise<ProfilesResponse> {
    const response = await fetch("/demo_profiles", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const parsedResponse: ProfilesResponse = await response.json();
    if (response.status > 299 || !response.ok) {
        throw Error(parsedResponse.error || "Unknown error");
    }

    return parsedResponse;
}

export async function conversationsApi(): Promise<ConversationsResponse> {
    try {
        const response = await fetch("/conversations", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const parsedResponse: ConversationsResponse = await response.json();
        if (response.status > 299 || !response.ok) {
            throw Error(parsedResponse.error || "Unknown error");
        } else {
            return parsedResponse;
        }
    } catch (e) {
        console.log("raising api error to caller: " + e);
        throw e;
    }
}

export async function currentProfileApi(profile_id: string): Promise<ProfileResponse> {
    try {
        const response = await fetch("/current_profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                profile_id: profile_id
            })
        });

        const parsedResponse: ProfileResponse = await response.json();
        if (response.status > 299 || !response.ok) {
            console.log("no user logged in - keeping default profile");
            return {
                profile: createDefaultProfile()
            };
        } else {
            return parsedResponse;
        }
    } catch (e) {
        console.log("raising api error to caller: " + e);
        throw e;
    }
}

export function getCitationFilePath(citation: string): string {
    return `/content/${citation}`;
}
