export type OnboardingData = {
    fullName: string;
    workEmail: string;
    jobTitle: string;
    displayName: string;
    profilePicture: File | null;
    notificationPreference: string[];
    workspaceName: string;
    workspaceIcon: File | null;
    accessibilityPref: boolean;
    storeName: string;
    retailCategory: string;
    storeFormat: string;
    numEmployees: [number, number];
    expLevel: string;
    challenge: string[];
    uploadedPDF: File[];
    posProvider: string;
    selectedSettings: string[];
    map: File | null;
    type: string; 
    scenTypes: string[];
    difficultyLevel: string;
};

export type EmployeeOnboardingData = {
    fullName: string;
    workEmail: string;
    jobTitle: string[];
    displayName: string;
    profilePicture: File | null;
    notificationPreference: string[];
    confidence: string;
    customerInteraction: string;
    haveADHD: boolean;
    learningPreference: string[];
    improvements: string[];
};