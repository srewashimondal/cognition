import type { ModuleType } from "../Modules/ModuleType";
import type { StandardModuleType } from "../Standard/StandardModule";
import type { ModuleAttemptType } from "../Modules/ModuleAttemptType";
import type { StandardModuleAttempt } from "../Standard/StandardAttempt";
import { DocumentReference } from "firebase/firestore";

export type GenericModuleType = ModuleType | StandardModuleType;
export type GenericModuleAttempt = ModuleAttemptType | StandardModuleAttempt;

export type BaseUserType = {
    uid: string;
    email: string;
    fullName: string;
    role: "employee" | "employer";
    jobTitle: string;
    profilePicture?: string;
    notifPreference: "In-App" | "E-mail";
    workspaceID: DocumentReference;
    joinDate: string;
}

export type BadgeType = {
    id: string;
    name: string;
    description: string;
    icon: "star" | "bolt" | "map";
}

export type LearningStreak = {
    current: number;
    longest: number;
    lastActiveDate: string | null;
};

export type EmployeeUserType = BaseUserType & {
    role: "employee";
    employeeID: string;
    assignedModules: GenericModuleType[];
    completedModules: GenericModuleAttempt[];
    modulesInProgress: GenericModuleAttempt[];
    averageScore: number;
    totalHours: number;
    achievements: BadgeType[];
    learningStreak?: LearningStreak;
}

export type EmployerUserType = BaseUserType & {
    role: "employer";
    employerID: string;
}

