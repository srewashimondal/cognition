import { standardModule } from "./standard_data";
import type { StandardModuleAttempt } from "../types/Standard/StandardAttempt";

export const standardModuleAttempt: StandardModuleAttempt[] = 
    [
    {
        attempt_id: 1,
        moduleInfo: standardModule[0],
        status: "started",
        percent: 66,
        lessons: [
            {
                attempt_id: 1,
                lessonInfo: standardModule[0].lessons[0],
                status: "completed"
            },
            {
                attempt_id: 2,
                lessonInfo: standardModule[0].lessons[1],
                status: "completed"
            },
            {
                attempt_id: 3,
                lessonInfo: standardModule[0].lessons[2],
                status: "not begun"
            },
            {
                attempt_id: 4,
                lessonInfo: standardModule[0].lessons[3],
                status: "locked"
            }
        ]
    }
];