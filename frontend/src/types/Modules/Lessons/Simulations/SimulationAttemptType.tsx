import type { SimulationType } from "./SimulationType";

export type SimulationAttemptType = {
    attempt_id: number;
    simulationInfo: SimulationType;
    status: "not begun" | "started" | "completed";
    conversationId: string;
    messages: {
      role: "user" | "assistant" | "character";
      content: string;
      name?: string;
    }[];
};
  