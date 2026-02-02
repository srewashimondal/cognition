import type { EmployeeUserType, EmployerUserType } from "./UserType"
import type { ModuleType } from "../Modules/ModuleType";
import type { StandardModuleType } from "../Standard/StandardModule";

export type StoreType = {
    storeName: string;
    category: "Beauty & Cosmetics" | "Drugstore & Pharmacy"| "General Retail" | "Electronics & Tech" | "Apparel & Fashion" | "Specialty Retail" | "Home Goods" | "Grocery" | "Sporting Goods & Hobbies";
    storeFormat: "Standalone Store" | "Mall Location" | "Department Store Section";
}

export type WorkspaceType = {
    id: string;
    name: string;
    icon: string;
    admins: EmployerUserType[];
    employees: EmployeeUserType[];
    simulationModules: ModuleType[];
    standardModules: StandardModuleType[];
    store: StoreType;
}