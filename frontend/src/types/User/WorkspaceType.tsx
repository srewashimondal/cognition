import type { EmployeeUserType, EmployerUserType } from "./UserType"
import type { ModuleType } from "../Modules/ModuleType";
import type { StandardModuleType } from "../Standard/StandardModule";
import type { DocumentReference } from "firebase/firestore";

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
    simulationModules: DocumentReference[]; // was ModuleType[]
    standardModules: DocumentReference[]; // was StandardModuleType[]
    store: StoreType;
    storeID: DocumentReference;
}