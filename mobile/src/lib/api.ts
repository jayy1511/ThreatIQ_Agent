// API Client for ThreatIQ Backend Gateway
import { auth } from './firebase';
import { API_BASE_URL } from './config';

// Types
export interface AnalysisRequest {
    message: string;
    user_guess?: string;
    user_id?: string;
}

export interface ClassificationResult {
    label: 'phishing' | 'suspicious' | 'safe';
    confidence: number;
    reason_tags: string[];
}

export interface AnalysisResponse {
    classification: ClassificationResult;
    explanation: string;
    similar_examples: Array<{
        text: string;
        label: string;
        similarity: number;
    }>;
    coach_response: string;
    session_id: string;
    category?: string;
    was_correct?: boolean;
}

export interface TodayLesson {
    lesson: {
        lesson_id: string;
        title: string;
        topic: string;
        content: string;
        quiz: Array<{
            question: string;
            options: string[];
            correct_index: number;
        }>;
    };
    date: string;
    already_completed: boolean;
}

export interface LessonProgress {
    xp_total: number;
    level: number;
    streak_current: number;
    streak_best: number;
    last_lesson_completed_date: string | null;
    lessons_completed: number;
    last_7_days: Array<{
        date: string;
        completed: boolean;
    }>;
}

export interface ProfileSummary {
    total_analyzed: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    weak_spots: string[];
    recent_categories: string[];
}

export interface LessonCompleteRequest {
    lesson_id: string;
    answers: number[];
}

export interface LessonCompleteResponse {
    score_percent: number;
    xp_earned: number;
    xp_total: number;
    level: number;
    streak_current: number;
    streak_best: number;
    last_completed_date: string;
    already_completed_today: boolean;
    message: string;
    correct_answers: number[];
}

// API Error class
export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// Get auth token for authenticated requests
async function getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
    }
}

// Fetch wrapper with error handling
async function apiFetch<T>(
    endpoint: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        body?: any;
        authenticated?: boolean;
        timeout?: number;
    } = {}
): Promise<T> {
    const { method = 'GET', body, authenticated = false, timeout = 30000 } = options;

    if (!API_BASE_URL) {
        throw new ApiError('API base URL not configured', 0);
    }

    const url = `${API_BASE_URL}/api${endpoint}`;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (authenticated) {
        const token = await getAuthToken();
        if (!token) {
            throw new ApiError('Not authenticated', 401);
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = `Request failed: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch {
                // Ignore JSON parse error
            }
            throw new ApiError(errorMessage, response.status);
        }

        return await response.json();
    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new ApiError('Request timeout', 408);
        }

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error.message || 'Network error. Please check your connection.',
            0
        );
    }
}

// ============================================
// PUBLIC ENDPOINTS (no auth required)
// ============================================

/**
 * Analyze a message for phishing (public, no auth)
 */
export async function analyzePublic(message: string, userGuess?: string): Promise<AnalysisResponse> {
    return apiFetch<AnalysisResponse>('/analyze-public', {
        method: 'POST',
        body: {
            message,
            user_guess: userGuess,
        },
    });
}

// ============================================
// AUTHENTICATED ENDPOINTS
// ============================================

/**
 * Analyze a message with full tracking (authenticated)
 */
export async function analyze(
    message: string,
    userId: string,
    userGuess?: string
): Promise<AnalysisResponse> {
    return apiFetch<AnalysisResponse>('/analyze', {
        method: 'POST',
        body: {
            message,
            user_id: userId,
            user_guess: userGuess,
        },
        authenticated: true,
    });
}

/**
 * Get today's lesson
 */
export async function getTodayLesson(): Promise<TodayLesson> {
    return apiFetch<TodayLesson>('/lessons/today', {
        authenticated: true,
    });
}

/**
 * Complete a lesson
 */
export async function completeLesson(
    lessonId: string,
    answers: number[]
): Promise<LessonCompleteResponse> {
    return apiFetch<LessonCompleteResponse>('/lessons/complete', {
        method: 'POST',
        body: {
            lesson_id: lessonId,
            answers,
        },
        authenticated: true,
    });
}

/**
 * Get lesson progress (XP, streak, etc.)
 */
export async function getLessonProgress(): Promise<LessonProgress> {
    return apiFetch<LessonProgress>('/lessons/progress', {
        authenticated: true,
    });
}

/**
 * Get user profile summary
 */
export async function getProfileSummary(userId: string): Promise<ProfileSummary> {
    return apiFetch<ProfileSummary>(`/profile/${userId}/summary`, {
        authenticated: true,
    });
}

/**
 * Get user analysis history
 */
export async function getAnalysisHistory(userId: string): Promise<{ history: any[] }> {
    return apiFetch<{ history: any[] }>(`/profile/${userId}/history`, {
        authenticated: true,
    });
}
