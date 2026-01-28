import type { OnboardingData } from "./OnboardingData";
import type { EmployeeOnboardingData } from "./OnboardingData";

export type OnboardingSection = {
    substep: number;
    data: Record<string, any>;
    updateData: (updates: Partial<OnboardingData>) => void;
    registerFormId: (id: string) => void;
    onNext: () => void;
}

export type EmployeeOnboardingSection = {
    substep: number;
    data: Record<string, any>;
    updateData: (updates: Partial<EmployeeOnboardingData>) => void;
    registerFormId: (id: string) => void;
    onNext: () => void;
}