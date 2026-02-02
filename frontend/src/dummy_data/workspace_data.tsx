import type { WorkspaceType } from "../types/User/WorkspaceType";
import { modules } from "./modules_data";
import { standardModule } from "./standard_data";
import { employer } from "./user_data";
import { employee, janeCooper } from "./user_data";

export const workspace: WorkspaceType = {
    id: "workspace-1",
    name: "Acme Retail",
    icon: "https://i.pinimg.com/1200x/20/4c/9b/204c9b1aa56c67d23bc247a401c10530.jpg",
    admins: [employer],
    employees: [employee, janeCooper],
    simulationModules: modules,
    standardModules: standardModule,
    store: {
        storeName: "Acme",
        storeFormat: "Standalone Store",
        category: "General Retail"
    }
}