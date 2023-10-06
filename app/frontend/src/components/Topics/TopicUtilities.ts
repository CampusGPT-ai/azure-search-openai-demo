import { TopicModel } from "../../api";

export const filterTopicsByInterests = async (topics: TopicModel[], interests: string[]): Promise<string[]> => {
    try {
        const interestsLower: string[] = interests.map(x => x.toLowerCase());
        const filteredTopics = topics.filter((topic, index) => {
            const hasRelatedInterest = topic.related_interests.some((interest, interestIndex) => {
                const isInterestIncluded = interestsLower.includes(interest.toLowerCase());
                return isInterestIncluded;
            });
            return hasRelatedInterest;
        });

        console.log("Retrieved filtered topics:", filteredTopics);
        const distinctTopics = [...new Set(filteredTopics.map(topic => topic.question))];
        return distinctTopics.slice(0, 4);
    } catch (error) {
        console.error("Error getting filtered topics:", error);
        return [];
    }
};

export const getDistinctTopics = async (topics: TopicModel[]): Promise<string[]> => {
    const topicCounts: { [key: string]: number } = {};

    topics.forEach(topic => {
        const name = topic.question;
        topicCounts[name] = (topicCounts[name] || 0) + 1;
    });

    const topicCountEntries = Object.entries(topicCounts);
    const sortedTopicCountEntries = topicCountEntries.sort((a, b) => b[1] - a[1]);
    const topTopicCountEntries = sortedTopicCountEntries.slice(0, 4);
    const topTopics = topTopicCountEntries.map(entry => entry[0]);
    return topTopics;
};

export const getQuestionsByTopic = async (topics: TopicModel[], topicName: string): Promise<string[]> => {
    return topics.filter(topic => topic.topic === topicName).map(topic => topic.question);
};
