import type { SimulationType } from "./SimulationType";
import type { MessageType } from "./MessageType";

export type SimulationAttemptType = {
    attempt_id: number;
    simulationInfo: SimulationType;
    status: "not begun" | "started" | "completed";
    conversationId: string;
    messages: MessageType[];
};
  