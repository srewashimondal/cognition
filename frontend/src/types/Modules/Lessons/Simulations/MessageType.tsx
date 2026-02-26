export type MessageType = {
    id: string;
    role: "user" | "assistant" | "character";
    content: string;
    name?: string;
    rating?: number;
    replyToId?: number;
    improved?: string;
    scope?: string[];
};