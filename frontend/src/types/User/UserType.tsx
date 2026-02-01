import type { ModuleType } from "../Modules/ModuleType";
import type { StandardModuleType } from "../Standard/StandardModule";
import type { ModuleAttemptType } from "../Modules/ModuleAttemptType";
import type { StandardModuleAttempt } from "../Standard/StandardAttempt";

export type GenericModuleType = ModuleType | StandardModuleType;
export type GenericModuleAttempt = ModuleAttemptType | StandardModuleAttempt;

export type BaseUserType = {
    email: string;
    fullName: string;
    role: "employee" | "employer";
    jobTitle: string;
    profilePicture?: string;
    notifPreference: "In-App" | "E-mail";
    workspaceID: string;
    joinDate: string;
}

export type BadgeType = {
    id: string;
    name: string;
    description: string;
    icon: "star" | "bolt" | "map";
}

export type EmployeeUserType = BaseUserType & {
    role: "employee";
    employeeID: string;
    assignedModules: GenericModuleType[];
    completedModules: GenericModuleAttempt[];
    modulesInProgress: GenericModuleAttempt[];
    averageScore: number;
    totalHours: number;
    achievements: BadgeType[];
}

export type EmployerUserType = BaseUserType & {
    role: "employer";
    employerID: string;
}

