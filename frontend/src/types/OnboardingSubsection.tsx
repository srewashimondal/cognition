import type { OnboardingData } from "./OnboardingData";

export type OnboardingSubsection = {
    data: Record<string, any>; 
    updateData: (updates: Partial<OnboardingData>) => void;
}