export type MessageType = {
    role: "user" | "assistant" | "character";
    content: string;
    name?: string;
};