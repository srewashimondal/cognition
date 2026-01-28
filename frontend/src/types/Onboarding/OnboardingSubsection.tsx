import type { OnboardingData } from "./OnboardingData";
import type { EmployeeOnboardingData } from "./OnboardingData";

export type OnboardingSubsection = {
    data: Record<string, any>; 
    updateData: (updates: Partial<OnboardingData>) => void;
    registerFormId: (id: string) => void;
    onNext: () => void;
}

export type EmployeeOnboardingSubsection = {
    data: Record<string, any>; 
    updateData: (updates: Partial<EmployeeOnboardingData>) => void;
    registerFormId: (id: string) => void;
    onNext: () => void;
}