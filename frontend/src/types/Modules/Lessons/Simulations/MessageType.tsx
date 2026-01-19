export type MessageType = {
    id: number;
    role: "user" | "assistant" | "character";
    content: string;
    name?: string;
    rating?: number;
    replyToId?: number;
    improved?: string;
};