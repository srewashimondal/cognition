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
    displayName?: string;
}

export type BadgeIconKey =
    | "star"
    | "bolt"
    | "map"
    | "medal1"
    | "medal2"
    | "medalWhite"
    | "sunrise"
    | "target"
    | "layers";

export type BadgeType = {
    id: string;
    name: string;
    description: string;
    icon: BadgeIconKey;
    kind?: "badge" | "achievement";
};

export type AchievementEntry = BadgeType | DocumentReference;

export const EARLY_BIRD_END_HOUR = 9;

export const WELCOME_BACK_MIN_GAP_DAYS = 14;

export const BADGE_IDS = {
    earlyBird: "badge-early-bird",
    weekStreak: "badge-week-streak",
    simPro: "badge-sim-pro",
    highScore: "badge-high-score",
    allRounder: "badge-all-rounder",
    firstLesson: "ach-first-lesson",
    moduleDone: "ach-module-done",
    perfectScore: "ach-perfect-score",
    fiveDays: "ach-five-days",
    welcomeBack: "ach-welcome-back",
} as const;

export const BADGE_CATALOG: Record<string, BadgeType> = {
    [BADGE_IDS.earlyBird]: {
        id: BADGE_IDS.earlyBird,
        name: "Early Bird",
        description: "Finished a lesson before the morning cutoff time",
        icon: "sunrise",
        kind: "badge",
    },
    [BADGE_IDS.weekStreak]: {
        id: BADGE_IDS.weekStreak,
        name: "Week Streak",
        description: "Trained on 5 different days in one calendar week",
        icon: "bolt",
        kind: "badge",
    },
    [BADGE_IDS.simPro]: {
        id: BADGE_IDS.simPro,
        name: "Sim Pro",
        description: "Finished 5 simulation lessons",
        icon: "target",
        kind: "badge",
    },
    [BADGE_IDS.highScore]: {
        id: BADGE_IDS.highScore,
        name: "High Score",
        description: "Averaged 90%+ on your last 10 scored quiz attempts",
        icon: "star",
        kind: "badge",
    },
    [BADGE_IDS.allRounder]: {
        id: BADGE_IDS.allRounder,
        name: "All-Rounder",
        description: "Completed training in both standard and simulation module types",
        icon: "layers",
        kind: "badge",
    },
    [BADGE_IDS.firstLesson]: {
        id: BADGE_IDS.firstLesson,
        name: "First Lesson",
        description: "Completed your first lesson",
        icon: "medalWhite",
        kind: "achievement",
    },
    [BADGE_IDS.moduleDone]: {
        id: BADGE_IDS.moduleDone,
        name: "Module Done",
        description: "Finished every lesson in one module",
        icon: "medal1",
        kind: "achievement",
    },
    [BADGE_IDS.perfectScore]: {
        id: BADGE_IDS.perfectScore,
        name: "Perfect Score",
        description: "Scored 100% on a graded lesson or quiz",
        icon: "star",
        kind: "achievement",
    },
    [BADGE_IDS.fiveDays]: {
        id: BADGE_IDS.fiveDays,
        name: "Five Days",
        description: "Trained on five separate days",
        icon: "map",
        kind: "achievement",
    },
    [BADGE_IDS.welcomeBack]: {
        id: BADGE_IDS.welcomeBack,
        name: "Welcome Back",
        description: "Completed a lesson within a few days after two weeks away",
        icon: "medal2",
        kind: "achievement",
    },
};

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
    achievements: AchievementEntry[];
    learningStreak?: LearningStreak;
}

export type EmployerUserType = BaseUserType & {
    role: "employer";
    employerID: string;
}

