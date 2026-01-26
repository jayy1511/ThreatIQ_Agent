/**
 * Gmail Screen - Matches web gmail integration layout
 */

import React from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from "../components/ui";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";

export default function GmailScreen() {
    // Placeholder data
    const gmailConnected = false;

    const recentScans = [
        { id: "1", subject: "Urgent: Verify your account", verdict: "phishing", date: "2 hours ago" },
        { id: "2", subject: "Your order has shipped", verdict: "safe", date: "Yesterday" },
        { id: "3", subject: "Password reset request", verdict: "phishing", date: "2 days ago" },
    ];

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

                {gmailConnected && (
                    <>
                        {/* Triage Controls */}
                        <Card style={styles.triageCard}>
                            <CardHeader>
                                <View style={styles.titleWithIcon}>
                                    <Ionicons name="scan" size={20} color={colors.primary} />
                                    <CardTitle style={styles.cardTitleText}>Inbox Triage</CardTitle>
                                </View>
                                <CardDescription>
                                    Scan your recent emails for threats
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button fullWidth>
                                    <Ionicons name="refresh" size={16} color={colors.primaryForeground} />
                                    <Text style={styles.buttonText}>Scan Inbox Now</Text>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Scans */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Scans</Text>
                            {recentScans.map((scan) => (
                                <Card key={scan.id} style={styles.scanCard}>
                                    <CardContent style={styles.scanContent}>
                                        <View style={styles.scanInfo}>
                                            <View style={[
                                                styles.verdictDot,
                                                { backgroundColor: scan.verdict === "phishing" ? colors.destructive : colors.success }
                                            ]} />
                                            <View style={styles.scanText}>
                                                <Text style={styles.scanSubject} numberOfLines={1}>{scan.subject}</Text>
                                                <Text style={styles.scanDate}>{scan.date}</Text>
                                            </View>
                                        </View>
                                        <View style={[
                                            styles.verdictBadge,
                                            { backgroundColor: scan.verdict === "phishing" ? `${colors.destructive}15` : `${colors.success}15` }
                                        ]}>
                                            <Text style={[
                                                styles.verdictText,
                                                { color: scan.verdict === "phishing" ? colors.destructive : colors.success }
                                            ]}>
                                                {scan.verdict}
                                            </Text>
                                        </View>
                                    </CardContent>
                                </Card>
                            ))}
                        </View>
                    </>
                )}

                {!gmailConnected && (
                    /* Features Preview */
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
    triageCard: {
        marginBottom: spacing[6],
    },
    titleWithIcon: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
    },
    cardTitleText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
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
