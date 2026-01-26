/**
 * Gmail Screen - With real API integration
 */

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from "../components/ui";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";
import { useAuth } from "../context/AuthContext";
import { getGmailStatus, getGmailConnectUrl, getGmailHistory, API_BASE_URL } from "../lib/api";

export default function GmailScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [gmailConnected, setGmailConnected] = useState(false);
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const [statusData, historyData] = await Promise.all([
                getGmailStatus().catch(() => ({ connected: false })),
                getGmailHistory(10).catch(() => ({ results: [] })),
            ]);

            setGmailConnected(statusData?.connected || false);
            setRecentScans(historyData?.results || []);
        } catch (error) {
            console.error("[Gmail] Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGmail = async () => {
        setConnecting(true);
        try {
            // Get the OAuth URL and open it in browser
            const data = await getGmailConnectUrl();
            if (data?.url) {
                await Linking.openURL(data.url);
            } else {
                // Fallback: construct URL manually
                const connectUrl = `${API_BASE_URL}/api/gmail/connect`;
                await Linking.openURL(connectUrl);
            }
        } catch (error) {
            console.error("[Gmail] Error connecting:", error);
        } finally {
            setConnecting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading Gmail status...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Gmail Integration</Text>
                    <Text style={styles.subtitle}>
                        Connect your Gmail to automatically scan for phishing threats.
                    </Text>
                </View>

                {/* Connection Status Card */}
                <Card style={styles.statusCard}>
                    <CardContent style={styles.statusContent}>
                        <View style={styles.statusIcon}>
                            <Ionicons
                                name={gmailConnected ? "checkmark-circle" : "mail"}
                                size={48}
                                color={gmailConnected ? colors.success : colors.mutedForeground}
                            />
                        </View>
                        <Text style={styles.statusTitle}>
                            {gmailConnected ? "Gmail Connected" : "Gmail Not Connected"}
                        </Text>
                        <Text style={styles.statusDescription}>
                            {gmailConnected
                                ? "Your inbox is being monitored for phishing threats."
                                : "Connect your Gmail account to start scanning your inbox."}
                        </Text>
                        <Button
                            variant={gmailConnected ? "outline" : "default"}
                            fullWidth
                            style={styles.connectButton}
                            onPress={handleConnectGmail}
                            loading={connecting}
                        >
                            <Ionicons
                                name={gmailConnected ? "settings" : "logo-google"}
                                size={16}
                                color={gmailConnected ? colors.foreground : colors.primaryForeground}
                            />
                            <Text style={gmailConnected ? styles.outlineButtonText : styles.buttonText}>
                                {gmailConnected ? "Manage Connection" : "Connect Gmail"}
                            </Text>
                        </Button>
                    </CardContent>
                </Card>

                {gmailConnected && recentScans.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Scans</Text>
                        {recentScans.slice(0, 5).map((scan, idx) => (
                            <Card key={idx} style={styles.scanCard}>
                                <CardContent style={styles.scanContent}>
                                    <View style={styles.scanInfo}>
                                        <View style={[
                                            styles.verdictDot,
                                            { backgroundColor: scan.classification === "phishing" ? colors.destructive : colors.success }
                                        ]} />
                                        <View style={styles.scanText}>
                                            <Text style={styles.scanSubject} numberOfLines={1}>
                                                {scan.subject || "No subject"}
                                            </Text>
                                            <Text style={styles.scanDate}>
                                                {scan.analyzed_at ? new Date(scan.analyzed_at).toLocaleDateString() : ""}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.verdictBadge,
                                        { backgroundColor: scan.classification === "phishing" ? `${colors.destructive}15` : `${colors.success}15` }
                                    ]}>
                                        <Text style={[
                                            styles.verdictText,
                                            { color: scan.classification === "phishing" ? colors.destructive : colors.success }
                                        ]}>
                                            {scan.classification || "unknown"}
                                        </Text>
                                    </View>
                                </CardContent>
                            </Card>
                        ))}
                    </View>
                )}

                {!gmailConnected && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What you get</Text>
                        <View style={styles.featureList}>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>Automatic Scanning</Text>
                                    <Text style={styles.featureDesc}>
                                        Your inbox is monitored for suspicious emails
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name="notifications" size={20} color={colors.orange} />
                                </View>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>Instant Alerts</Text>
                                    <Text style={styles.featureDesc}>
                                        Get notified when threats are detected
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name="analytics" size={20} color={colors.success} />
                                </View>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>Detailed Reports</Text>
                                    <Text style={styles.featureDesc}>
                                        See why emails were flagged as threats
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: spacing[4],
    },
    loadingText: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing[4],
        paddingBottom: spacing[10],
    },
    header: {
        marginBottom: spacing[6],
    },
    title: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
        marginTop: spacing[2],
        lineHeight: fontSize.base * 1.5,
    },
    statusCard: {
        marginBottom: spacing[6],
    },
    statusContent: {
        alignItems: "center",
        paddingVertical: spacing[6],
    },
    statusIcon: {
        marginBottom: spacing[4],
    },
    statusTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[2],
    },
    statusDescription: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        textAlign: "center",
        marginBottom: spacing[6],
        lineHeight: fontSize.sm * 1.5,
        maxWidth: 280,
    },
    connectButton: {
        width: "100%",
    },
    buttonText: {
        color: colors.primaryForeground,
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
        marginLeft: spacing[2],
    },
    outlineButtonText: {
        color: colors.foreground,
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
        marginLeft: spacing[2],
    },
    section: {
        marginBottom: spacing[4],
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[4],
    },
    scanCard: {
        marginBottom: spacing[3],
    },
    scanContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing[3],
    },
    scanInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: spacing[3],
    },
    verdictDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    scanText: {
        flex: 1,
    },
    scanSubject: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.foreground,
    },
    scanDate: {
        fontSize: fontSize.xs,
        color: colors.mutedForeground,
        marginTop: spacing[0.5],
    },
    verdictBadge: {
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2.5],
        borderRadius: radius.full,
    },
    verdictText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        textTransform: "capitalize",
    },
    featureList: {
        gap: spacing[4],
    },
    featureItem: {
        flexDirection: "row",
        gap: spacing[4],
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[1],
    },
    featureDesc: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        lineHeight: fontSize.sm * 1.5,
    },
});
