'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import GmailIntegration from '@/components/GmailIntegration';

export default function GmailPage() {
    return (
        <ProtectedRoute>
            <div className="container mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold tracking-tight mb-8">
                    Gmail Integration
                </h1>
                <p className="text-muted-foreground mb-6">
                    Connect your Gmail account to automatically scan and triage your inbox for phishing threats.
                </p>
                <GmailIntegration />
            </div>
        </ProtectedRoute>
    );
}
