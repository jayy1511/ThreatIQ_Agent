"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Mail, CheckCircle2, XCircle, Loader2, AlertTriangle, Shield, ShieldAlert } from "lucide-react"
import {
    getGmailStatus,
    getGmailConnectUrl,
    disconnectGmail,
    runGmailTriage,
} from "@/lib/api"
import type {
    GmailStatusResponse,
    GmailTriageResult,
} from "@/types/gmail"

export default function GmailIntegration() {
    const { user } = useAuth()
    const [status, setStatus] = useState<GmailStatusResponse>({ connected: false })
    const [loading, setLoading] = useState(false)
    const [triageLoading, setTriageLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [triageResults, setTriageResults] = useState<GmailTriageResult[]>([])
    const [triageLimit, setTriageLimit] = useState(10)
    const [markSpam, setMarkSpam] = useState(false)
    const [archiveSafe, setArchiveSafe] = useState(false)

    useEffect(() => {
        if (user) {
            fetchStatus()
        }
    }, [user])

    const fetchStatus = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getGmailStatus()
            setStatus(data)
        } catch (err) {
            console.error("Error fetching Gmail status:", err)
            setError("Failed to fetch Gmail status")
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getGmailConnectUrl()
            window.location.href = data.url
        } catch (err) {
            console.error("Error connecting Gmail:", err)
            setError("Failed to initiate Gmail connection")
            setLoading(false)
        }
    }

    const handleDisconnect = async () => {
        try {
            setLoading(true)
            setError(null)
            await disconnectGmail()
            setStatus({ connected: false })
            setTriageResults([])
        } catch (err) {
            console.error("Error disconnecting Gmail:", err)
            setError("Failed to disconnect Gmail")
        } finally {
            setLoading(false)
        }
    }

    const handleRunTriage = async () => {
        try {
            setTriageLoading(true)
            setError(null)
            const data = await runGmailTriage({
                limit: triageLimit,
                mark_spam: markSpam,
                archive_safe: archiveSafe,
            })
            setTriageResults(data.results)
        } catch (err) {
            console.error("Error running triage:", err)
            setError("Failed to run triage. Make sure Gmail is connected.")
        } finally {
            setTriageLoading(false)
        }
    }

    const getLabelBadge = (label: string) => {
        switch (label.toUpperCase()) {
            case "SAFE":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                        <Shield className="mr-1 h-3 w-3" />
                        Safe
                    </Badge>
                )
            case "SUSPICIOUS":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Suspicious
                    </Badge>
                )
            case "PHISHING":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                        <ShieldAlert className="mr-1 h-3 w-3" />
                        Phishing
                    </Badge>
                )
            default:
                return <Badge variant="outline">{label}</Badge>
        }
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Gmail Integration
                    </CardTitle>
                    <CardDescription>Please sign in to connect your Gmail account</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Gmail Integration
                </CardTitle>
                <CardDescription>
                    Automatically triage your inbox using ThreatIQ&apos;s phishing detection
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            {status.connected ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span className="text-green-600 dark:text-green-400">Connected</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Not Connected</span>
                                </>
                            )}
                        </div>
                        {status.connected && status.email && (
                            <p className="text-sm text-muted-foreground">{status.email}</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {status.connected ? (
                            <Button
                                variant="outline"
                                onClick={handleDisconnect}
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Disconnect
                            </Button>
                        ) : (
                            <Button onClick={handleConnect} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Connect Gmail
                            </Button>
                        )}
                    </div>
                </div>

                {status.connected && (
                    <>
                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-semibold">Run Inbox Triage</h3>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <label htmlFor="limit" className="text-sm font-medium">
                                        Message Limit
                                    </label>
                                    <select
                                        id="limit"
                                        value={triageLimit}
                                        onChange={(e) => setTriageLimit(parseInt(e.target.value))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value={5}>5 messages</option>
                                        <option value={10}>10 messages</option>
                                        <option value={20}>20 messages</option>
                                        <option value={50}>50 messages</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Options</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={markSpam}
                                                onChange={(e) => setMarkSpam(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            Mark phishing as spam
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={archiveSafe}
                                                onChange={(e) => setArchiveSafe(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            Archive safe emails
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        onClick={handleRunTriage}
                                        disabled={triageLoading}
                                        className="w-full"
                                    >
                                        {triageLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Run Triage
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {triageResults.length > 0 && (
                            <>
                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="font-semibold">
                                        Triage Results ({triageResults.length} processed)
                                    </h3>

                                    <div className="space-y-3">
                                        {triageResults.map((result, index) => (
                                            <div
                                                key={result.message_id || index}
                                                className="rounded-lg border p-4 space-y-2"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{result.subject}</p>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            From: {result.from}
                                                        </p>
                                                    </div>
                                                    {getLabelBadge(result.label)}
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-muted-foreground">
                                                        Confidence: {Math.round(result.confidence * 100)}%
                                                    </span>
                                                    {result.label_applied && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Label Applied
                                                        </Badge>
                                                    )}
                                                </div>

                                                {result.reasons && result.reasons.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {result.reasons.slice(0, 3).map((reason, i) => (
                                                            <Badge key={i} variant="secondary" className="text-xs">
                                                                {reason}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {result.error && (
                                                    <Alert variant="destructive" className="mt-2">
                                                        <AlertDescription className="text-xs">
                                                            {result.error}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
