/**
 * API Client for ThreatIQ Mobile
 * Reads API URL from environment variable
 */

import { auth } from "../firebase";

// API URL from environment variable
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://threatiq-gateway-service.onrender.com";

// Helper to generate UUID v4
function generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Get auth headers if user is logged in
async function getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            headers["Authorization"] = `Bearer ${token}`;
        }
    } catch (error) {
        console.warn("[API] Error getting token:", error);
    }

    return headers;
}

// Parse error response
async function parseError(response: Response): Promise<string> {
    try {
        const data = await response.json();
        return data.detail || data.message || data.error || `Error ${response.status}`;
    } catch {
        return `Error ${response.status}: ${response.statusText}`;
    }
}

// Generic GET request
async function get<T = any>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] GET ${endpoint}`);

    const response = await fetch(url, {
        method: "GET",
        headers: await getHeaders(),
    });

    if (!response.ok) {
        const errorMessage = await parseError(response);
        console.error(`[API] GET ${endpoint} failed:`, errorMessage);
        throw new Error(errorMessage);
    }

    return response.json();
}

// Generic POST request
async function post<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] POST ${endpoint}`, body);

    const response = await fetch(url, {
        method: "POST",
        headers: await getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorMessage = await parseError(response);
        console.error(`[API] POST ${endpoint} failed:`, errorMessage);
        throw new Error(errorMessage);
    }

    return response.json();
}

// ============== ANALYSIS APIs ==============

export const analyzeMessage = async (
    message: string,
    userGuess: string,
    userId: string
) => {
    const requestId = generateUUID();
    return post("/api/analyze", {
        message,
        user_guess: userGuess,
        user_id: userId,
        request_id: requestId,
    });
};

export const analyzePublicMessage = async (
    message: string,
    userGuess: string,
    userId: string
) => {
    const requestId = generateUUID();
    return post("/api/analyze-public", {
        message,
        user_guess: userGuess,
        user_id: userId,
        request_id: requestId,
    });
};

// ============== PROFILE APIs ==============

export const getUserProfile = async (userId: string) => {
    const response = await get(`/api/profile/${userId}`);
    return response.profile;
};

export const getUserSummary = async (userId: string) => {
    return get(`/api/profile/${userId}/summary`);
};

export const getUserHistory = async (userId: string) => {
    const response = await get(`/api/profile/${userId}/history`);
    return response.history;
};

// ============== GMAIL APIs ==============

export const getGmailStatus = async () => {
    return get("/api/gmail/status");
};

export const getGmailConnectUrl = async () => {
    return get("/api/gmail/connect");
};

export const disconnectGmail = async () => {
    return post("/api/gmail/disconnect");
};

export const runGmailTriage = async (params: {
    limit?: number;
    mark_spam?: boolean;
    archive_safe?: boolean;
}) => {
    return post("/api/gmail/triage", params);
};

export const getGmailHistory = async (limit: number = 50) => {
    return get(`/api/gmail/history?limit=${limit}`);
};

// ============== LESSON APIs ==============

export const getTodayLesson = async () => {
    return get("/api/lessons/today");
};

export const completeLesson = async (lessonId: string, answers: number[]) => {
    return post("/api/lessons/complete", {
        lesson_id: lessonId,
        answers,
    });
};

export const getLessonProgress = async () => {
    return get("/api/lessons/progress");
};

export const getRecentLessons = async (limit: number = 5) => {
    return get(`/api/lessons/recent?limit=${limit}`);
};

export const getLessonsList = async () => {
    return get("/api/lessons/list");
};

// Export default api object
const api = {
    get,
    post,
    analyzeMessage,
    analyzePublicMessage,
    getUserProfile,
    getUserSummary,
    getUserHistory,
    getGmailStatus,
    getGmailConnectUrl,
    disconnectGmail,
    runGmailTriage,
    getGmailHistory,
    getTodayLesson,
    completeLesson,
    getLessonProgress,
    getRecentLessons,
    getLessonsList,
    API_BASE_URL,
};

export default api;
