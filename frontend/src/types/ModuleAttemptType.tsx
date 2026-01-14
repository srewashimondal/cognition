import type { ModuleType } from "./ModuleType";

export type ModuleAttemptType = {
    moduleInfo: ModuleType;
    status?: "not begun" | "completed" | "started";
    percent?: number;
}