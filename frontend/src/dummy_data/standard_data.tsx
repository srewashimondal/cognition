import type { StandardModuleType } from "../types/Standard/StandardModule";
import { transcript } from './video_transcript.tsx';
import { summaries } from "./sectionSummaries.tsx";

export const standardModule: StandardModuleType[] = [
    {
        id: 1,
        title: "Standards of Conduct",
        hours: "0:40",
        deployed: true,
        createTime: "January 16, 2026",
        numLessons: 3,
        lessons: [
            {
                id: 1,
                type: "video",
                title: "Professional Conduct on the Sales Floor",
                duration: 10,
                dueDate: "May 7, 2026",
                videoFileId: "1",
                filename: "Professional_Conduct.mov",
                durationSeconds: 600,
                thumbnailUrl: "https://plus.unsplash.com/premium_photo-1683141052679-942eb9e77760?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmV0YWlsfGVufDB8fDB8fHww",
                transcript: transcript,
                summaries: summaries
            },
            {
                id: 2,
                type: "video",
                title: "Handling Customers with Respect & Integrity",
                duration: 10,
                dueDate: "May 7, 2026",
                videoFileId: "1",
                filename: "Handling_Customers.mov",
                durationSeconds: 600,
                thumbnailUrl: "https://t4.ftcdn.net/jpg/06/09/96/33/360_F_609963349_1re1J0uIy8RyEXqoOoHPPiypN5Vf2G0D.jpg",
                transcript: transcript,
                summaries: summaries
            },
            {
                id: 3,
                type: "quiz",
                title: "Standards of Conduct Knowledge Check",
                duration: 10,
                dueDate: "May 10, 2026",
                passingScore: 50,
                numberOfRetakes: 3,
                questions: [
                    {
                        id: 1,
                        prompt: "Which of the following best represents professional conduct on the sales floor?",
                        type: "mcq",
                        options: [
                            "Using personal devices when the store is quiet",
                            "Speaking casually with coworkers while a customer is waiting",
                            "Greeting customers promptly and maintaining a respectful tone",
                            "Ignoring minor customer concerns if they don’t affect sales"
                        ],
                        correctAnswerIndex: 2
                    },
                    {
                        id: 2,
                        prompt: "Employees should maintain professional behavior at all times while on the sales floor, even during slow periods.",
                        type: "true false",
                        correctAnswer: true
                    },
                    {
                        id: 3,
                        prompt: "Describe one situation where professional conduct can positively impact a customer’s experience. How would you handle it? Answer in 2-3 sentences.",
                        type: "open ended"
                    }
                ]
            },
            {
                id: 4,
                type: "quiz",
                title: "Professional Conduct in Customer Interactions",
                duration: 10,
                dueDate: "May 11, 2026",
                passingScore: 50,
                numberOfRetakes: 3,
                questions: [
                    {
                        id: 1,
                        prompt: "Which of the following best represents professional conduct on the sales floor?",
                        type: "mcq",
                        options: [
                            "Using personal devices when the store is quiet",
                            "Speaking casually with coworkers while a customer is waiting",
                            "Greeting customers promptly and maintaining a respectful tone",
                            "Ignoring minor customer concerns if they don’t affect sales"
                        ],
                        correctAnswerIndex: 2
                    },
                    {
                        id: 2,
                        prompt: "Employees should maintain professional behavior at all times while on the sales floor, even during slow periods.",
                        type: "true false",
                        correctAnswer: true
                    },
                    {
                        id: 3,
                        prompt: "Describe one situation where professional conduct can positively impact a customer’s experience. How would you handle it? Answer in 2-3 sentences.",
                        type: "open ended"
                    }
                ]
            }
        ]
    }
];