import type { EmployerUserType, EmployeeUserType } from "../types/User/UserType";
import { modules } from "./modules_data";
import { standardModule } from "./standard_data";

export const employer: EmployerUserType = {
    email: "harsh@cognition.ai",
    fullName: "Harsh Smith",
    role: "employer",
    jobTitle: "General Manager",
    profilePicture: "https://i.etsystatic.com/30289585/r/il/3f982c/4322819070/il_fullxfull.4322819070_tn35.jpg",
    notifPreference: "In-App",
    workspaceID: "workspace-1",
    employerID: "employer-1",
    joinDate: "January 2025"
}

export const employee: EmployeeUserType = {
    email: "jane@cognition.ai",
    fullName: "Jane Doe",
    role: "employee",
    jobTitle: "Sales Associate",
    profilePicture: "https://i.pinimg.com/736x/7d/5d/4c/7d5d4cd7857e0496c83280d2e447f2c7.jpg",
    notifPreference: "In-App",
    workspaceID: "workspace-1",
    joinDate: "January 2026",
    employeeID: "employee-1",
    assignedModules: [...modules, ...standardModule],
    completedModules: [modules[0]],
    modulesInProgress: [modules[1], ...standardModule],
    averageScore: 90,
    totalHours: 8.5,
    achievements: [
        {
            id: "badge-1",
            name: "First Day Ready",
            description: "Complete your first assigned module",
            icon: "star"
        },
        {
            id: "badge-2",
            name: "Fast Learner",
            description: "Complete a module ahead of schedule",
            icon: "bolt"
        },
        {
            id: "badge-3",
            name: "Floor GPS",
            description: "Completed the 'Store Orientation and Navigation' Module with a Perfect Score",
            icon: "map"
        }
    ]
}