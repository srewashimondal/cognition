import type { OnboardingData } from "./OnboardingData";

export type OnboardingSection = {
    substep: number;
    data: Record<string, any>;
    updateData: (updates: Partial<OnboardingData>) => void;
}