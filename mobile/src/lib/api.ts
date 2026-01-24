/**
 * API Client for ThreatIQ Mobile
 * 
 * Fetch wrapper with:
 * - Base URL configuration
 * - JSON headers
 * - Error handling
 * - Auth token support (to be added in Part 2)
 */

import { API_BASE_URL } from "../config";

// Type for API response
interface ApiResponse<T = any> {
    data?: T;
    error?: string;
}

// Stored auth token (will be set after Firebase login in Part 2)
let authToken: string | null = null;

/**
 * Set the authentication token
 */
export function setAuthToken(token: string | null) {
    authToken = token;
}

/**
 * Get default headers for API requests
 */
function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
}

/**
 * Parse error response from server
 */
async function parseError(response: Response): Promise<string> {
    try {
        const data = await response.json();
        return data.detail || data.message || data.error || `Error ${response.status}`;
    } catch {
        return `Error ${response.status}: ${response.statusText}`;
    }
}

/**
 * GET request
 */
export async function get<T = any>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
    });

    if (!response.ok) {
        const errorMessage = await parseError(response);
        throw new Error(errorMessage);
    }

    return response.json();
}

/**
 * POST request
 */
export async function post<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorMessage = await parseError(response);
        throw new Error(errorMessage);
    }

    return response.json();
}

/**
 * PUT request
 */
export async function put<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorMessage = await parseError(response);
        throw new Error(errorMessage);
    }

    return response.json();
}

/**
 * DELETE request
 */
export async function del<T = any>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: getHeaders(),
    });

    if (!response.ok) {
        const errorMessage = await parseError(response);
        throw new Error(errorMessage);
    }

    return response.json();
}

// Export as default object for convenience
const api = { get, post, put, del, setAuthToken };
export default api;
