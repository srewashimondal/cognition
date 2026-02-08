import type { WorkspaceType } from "../types/User/WorkspaceType";
import { modules } from "./modules_data";
import { standardModule } from "./standard_data";
import { employer } from "./user_data";
import { employee, janeCooper } from "./user_data";

export const workspace: WorkspaceType = {
    id: "workspace-1",
    name: "Acme Retail",
    icon: "https://i.pinimg.com/736x/c2/af/6e/c2af6e4f4ef43d2afda4b24894d3f3b8.jpg",
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