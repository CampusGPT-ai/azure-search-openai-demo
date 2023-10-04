import { TopicModel } from "../../api";

export const filterTopicsByInterests = (topics: TopicModel[], interests: string[]): string[] => {
    const filteredTopics = topics.filter(topic => topic.related_interests.some(interest => interests.includes(interest)));
    return [...new Set(filteredTopics.map(topic => topic.topic))];
};

export const getDistinctTopics = (topics: TopicModel[]): string[] => {
    const distinctTopics = [...new Set(topics.map(topic => topic.topic))];
    return distinctTopics.slice(0, 5);
};

export const getQuestionsByTopic = (topics: TopicModel[], topicName: string): string[] => {
    return topics.filter(topic => topic.topic === topicName).map(topic => topic.question);
};
