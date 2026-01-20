import type { ModuleType } from "../types/Modules/ModuleType";

export const modules: ModuleType[] = [
    {
      id: 1,
      title: "Store Orientation and Navigation",
      hours: "1:30",
      numLessons: 3,
      createTime: "January 16, 2025 10:00AM",
      difficulty: "Intermediate",
      references: ["Document1", "Document2", "Document3"],
      lessons: [
        {
          id: 1,
          title: "Reading the Store Map",
          type: "simulation",
          skills: ["Spatial Reasoning", "Department Zones"],
          duration: 30,
          dueDate: "May 24, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 2,
          title: "Department Logic",
          type: "simulation",
          skills: ["Department Zones", "Category Grouping"],
          duration: 30,
          dueDate: "May 24, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 3,
          title: "Efficient Routing",
          type: "simulation",
          skills: ["Shortest Path", "Confidence"],
          duration: 30,
          dueDate: "May 24, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
      ],
      deployed: true
    },
    {
      id: 2,
      title: "Product Knowledge & Inventory",
      hours: "1:30",
      numLessons: 3,
      createTime: "January 16, 2025 10:00AM",
      difficulty: "Intermediate",
      references: ["Document1", "Document2", "Document3"],
      lessons: [
        {
          id: 1,
          title: "Exact Product Requests",
          type: "simulation",
          skills: ["SKU Recognition", "Brand Recognition"],
          duration: 30,
          dueDate: "May 31, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 2,
          title: "Vague Product Requests",
          type: "simulation",
          skills: ["Clarification", "Probing Questions"],
          duration: 30,
          dueDate: "May 31, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 3,
          title: "Out-of-Stock Handling",
          type: "simulation",
          skills: ["Substitution", "Transparency", "Confidence"],
          duration: 30,
          dueDate: "May 31, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        }
      ],
      deployed: false
    },
    {
      id: 3,
      title: "Customer Interaction & Communication",
      hours: "1:30",
      numLessons: 3,
      createTime: "January 16, 2025 10:00AM",
      difficulty: "Intermediate",
      references: ["Document1", "Document2", "Document3"],
      lessons: [
        {
          id: 1,
          title: "Greeting & Engagement",
          type: "simulation",
          skills: ["Opening Lines", "Tone"],
          duration: 30,
          dueDate: "June 7, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 2,
          title: "Active Listening",
          type: "simulation",
          skills: ["Paraphrasing", "Confirmation"],
          duration: 30,
          dueDate: "June 7, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 3,
          title: "Difficult Customers",
          type: "simulation",
          skills: ["De-escalation", "Policy Awareness"],
          duration: 30,
          dueDate: "June 7, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        }
      ],
      deployed: false
    },
    {
      id: 4,
      title: "Checkout, POS & Transactions",
      hours: "1:30",
      numLessons: 3,
      createTime: "January 16, 2025 10:00AM",
      difficulty: "Intermediate",
      references: ["Document1", "Document2", "Document3"],
      lessons: [
        {
          id: 1,
          title: "Basic Checkout Flow",
          type: "simulation",
          skills: ["Sequence Accuracy"],
          duration: 30,
          dueDate: "June 14, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 2,
          title: "Discounts, Returns & Exceptions",
          type: "simulation",
          skills: ["Policy Awareness", "Decision Making"],
          duration: 30,
          dueDate: "June 14, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 3,
          title: "Speed Under Pressure",
          type: "simulation",
          skills: ["Efficiency", "Multitasking"],
          duration: 30,
          dueDate: "June 14, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        }
      ],
      deployed: false
    },
    {
      id: 5,
      title: "Safety, Compliance & Store Policy",
      hours: "1:30",
      numLessons: 3,
      createTime: "January 16, 2025 10:00AM",
      difficulty: "Intermediate",
      references: ["Document1", "Document2", "Document3"],
      lessons: [
        {
          id: 1,
          title: "Basic Safety Awareness",
          type: "simulation",
          skills: ["Hazard Identification"],
          duration: 30,
          dueDate: "June 21, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 2,
          title: "Emergency Protocols",
          type: "simulation",
          skills: ["Calm Decision Making", "Escalation"],
          duration: 30,
          dueDate: "June 21, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 3,
          title: "Policy Boundaries",
          type: "simulation",
          skills: ["Professional Refusal", "Policy Communication"],
          duration: 30,
          dueDate: "June 21, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        }
      ],
      deployed: false
    },
    {
      id: 6,
      title: "Multitasking & Real-World Pressure",
      hours: "1:30",
      numLessons: 3,
      createTime: "January 16, 2025 10:00AM",
      difficulty: "Intermediate",
      references: ["Document1", "Document2", "Document3"],
      lessons: [
        {
          id: 1,
          title: "Multiple Customers",
          type: "simulation",
          skills: ["Prioritization"],
          duration: 30,
          dueDate: "June 28, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 2,
          title: "Interruptions",
          type: "simulation",
          skills: ["Task Resumption", "Focus"],
          duration: 30,
          dueDate: "June 28, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        },
        {
          id: 3,
          title: "End-to-End Scenario",
          type: "simulation",
          skills: ["Integration", "End-to-End Reasoning"],
          duration: 30,
          dueDate: "June 28, 2026",
          numAttempts: "unlimited",
          randomize: true,
          lessonAbstractInfo: {
            simulationModel: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            targetBehaviors: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            contextualConstraints: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            evaluationSignals: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.",
            adaptionLogic: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
          }
        }
      ],
      deployed: false
    }
  ];