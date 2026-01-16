import { modules } from './modules_data';
import type { ModuleAttemptType } from '../types/Modules/ModuleAttemptType';
import type { LessonAttemptType } from "../types/Modules/Lessons/LessonAttemptType";
import type { SimulationAttemptType } from "../types/Modules/Lessons/Simulations/SimulationAttemptType";

const loremMessages = (
    characterName: string
  ): {
    id: number;
    role: "user" | "assistant" | "character";
    content: string;
    name?: string;
    rating?: number;
    replyToId?: number;
  }[] => [
    { id: 1, role: "character", name: characterName, content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { id: 2, role: "user", content: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus." },
    { id: 3, role: "assistant", content: "Lorem ipsum evaluation feedback.", rating: 6, replyToId: 2 },
    { id: 4, role: "character", name: characterName, content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { id: 5, role: "user", content: "Lorem ipsum dolor sit amet." },
    { id: 6, role: "assistant", content: "Lorem ipsum evaluation feedback.", rating: 7, replyToId: 5 },
    { id: 7, role: "character", name: characterName, content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { id: 8, role: "user", content: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus." },
    { id: 9, role: "assistant", content: "Lorem ipsum evaluation feedback.", rating: 9, replyToId: 8 },
    { id: 10, role: "character", name: characterName, content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { id: 11, role: "user", content: "Lorem ipsum dolor sit amet." },
    { id: 12, role: "assistant", content: "Lorem ipsum evaluation feedback.", rating: 4, replyToId: 11},
];
  
export const moduleAttempts: ModuleAttemptType[] = [
    {
      attempt_id: 1,
      moduleInfo: modules[0],
      status: "completed",
      percent: 100,
      lessons: modules[0].lessons!.map(
        (lesson, lessonIdx): LessonAttemptType => ({
          attempt_id: lessonIdx + 1,
          lessonInfo: lesson,
          status: "completed",
          simulations: [1, 2, 3].map(
            (simId): SimulationAttemptType => ({
              attempt_id: simId,
              simulationInfo: {
                id: simId,
                premise: "Lorem ipsum simulation premise.",
                characterName: "Astra"
            },
              status: "completed",
              conversationId: `m1-l${lesson.id}-s${simId}`,
              messages: loremMessages("Astra")
            })
          ),
          evaluation: {
            strengths: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex sapien vitae pellentesque sem placerat in id.",
            shortcomings: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex sapien vitae pellentesque sem placerat in id. ",
            overallFeedback: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Elit quisque faucibus ex sapien vitae pellentesque sem. Sem placerat in id cursus mi pretium tellus. Tellus duis convallis tempus leo eu aenean sed. Sed diam urna tempor pulvinar vivamus fringilla lacus. Lacus nec metus bibendum egestas iaculis massa nisl. Nisl malesuada lacinia integer nunc posuere ut hendrerit."
          }
        })
      )
    },
    {
      attempt_id: 2,
      moduleInfo: modules[1],
      status: "started",
      percent: 50,
      lessons: [
        // Lesson 1 – all simulations completed
        {
          attempt_id: 1,
          lessonInfo: modules[1].lessons![0],
          status: "completed",
          simulations: [1, 2, 3].map(
            (simId): SimulationAttemptType => ({
              attempt_id: simId,
              simulationInfo: {
                id: simId,
                premise: "Lorem ipsum simulation premise.",
                characterName: "Nova"
              },
              status: "completed",
              conversationId: `m2-l1-s${simId}`,
              messages: loremMessages("Nova")
            })
          ),
          evaluation: {
            strengths: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex sapien vitae pellentesque sem placerat in id. ",
            shortcomings: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex sapien vitae pellentesque sem placerat in id. ",
            overallFeedback: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Elit quisque faucibus ex sapien vitae pellentesque sem. Sem placerat in id cursus mi pretium tellus. Tellus duis convallis tempus leo eu aenean sed. Sed diam urna tempor pulvinar vivamus fringilla lacus. Lacus nec metus bibendum egestas iaculis massa nisl. Nisl malesuada lacinia integer nunc posuere ut hendrerit."
          }
        },
  
        // Lesson 2 – one simulation completed
        {
          attempt_id: 2,
          lessonInfo: modules[1].lessons![1],
          status: "started",
          simulations: [
            {
              attempt_id: 1,
              simulationInfo: {
                id: 1,
                premise: "Lorem ipsum simulation premise.",
                characterName: "Nova"
              },
              status: "completed",
              conversationId: "m2-l2-s1",
              messages: loremMessages("Nova")
            },
            {
              attempt_id: 2,
              simulationInfo: {
                id: 2,
                premise: "Lorem ipsum simulation premise.",
                characterName: "Nova"
              },
              status: "not begun",
              conversationId: "m2-l2-s2",
              messages: loremMessages("Nova")
            },
            {
              attempt_id: 3,
              simulationInfo: {
                id: 3,
                premise: "Lorem ipsum simulation premise.",
                characterName: "Nova"
              },
              status: "not begun",
              conversationId: "m2-l2-s3",
              messages: loremMessages("Nova")
            }
          ]
        },
  
        // Lesson 3 – not started
        {
          attempt_id: 3,
          lessonInfo: modules[1].lessons![2],
          status: "not begun",
          simulations: [1, 2, 3].map(
            (simId): SimulationAttemptType => ({
              attempt_id: simId,
              simulationInfo: {
                id: simId,
                premise: "Lorem ipsum simulation premise.",
                characterName: "Nova"
              },
              status: "not begun",
              conversationId: `m2-l3-s${simId}`,
              messages: []
            })
          )
        }
      ]
    },
    ...modules.slice(2).map(
      (module, moduleIdx): ModuleAttemptType => ({
        attempt_id: moduleIdx + 3,
        moduleInfo: module,
        status: "not begun",
        percent: 0,
        lessons: module.lessons!.map(
          (lesson, lessonIdx): LessonAttemptType => ({
            attempt_id: lessonIdx + 1,
            lessonInfo: lesson,
            status: "not begun",
            simulations: [1, 2, 3].map(
              (simId): SimulationAttemptType => ({
                attempt_id: simId,
                simulationInfo: {
                  id: simId,
                  premise: "Lorem ipsum simulation premise.",
                  characterName: "Astra"
                },
                status: "not begun",
                conversationId: `m${module.id}-l${lesson.id}-s${simId}`,
                messages: []
              })
            )
          })
        )
      })
    )
];