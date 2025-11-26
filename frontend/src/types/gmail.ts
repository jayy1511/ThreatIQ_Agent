export interface GmailStatusResponse {
    connected: boolean;
    email?: string;
    scopes?: string[];
}

export interface GmailConnectResponse {
    url: string;
}

export interface GmailTriageRequest {
    limit?: number;
    mark_spam?: boolean;
    archive_safe?: boolean;
}

export interface GmailTriageResult {
    message_id: string;
    from: string;
    subject: string;
    label: string;
    confidence: number;
    reasons: string[];
    label_applied: boolean;
    success: boolean;
    error?: string;
}

export interface GmailTriageResponse {
    processed: number;
    results: GmailTriageResult[];
}

export interface GmailTriageRecord {
    _id: string;
    user_id: string;
    gmail_message_id: string;
    thread_id: string;
    from: string;
    subject: string;
    date: string;
    snippet: string;
    body_excerpt: string;
    label: string;
    confidence: number;
    reasons: string[];
    label_applied: boolean;
    created_at: string;
}

export interface GmailHistoryResponse {
    items: GmailTriageRecord[];
}
