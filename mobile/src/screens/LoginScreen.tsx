/**
 * Login Screen with Google Sign-In
 */

import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/ui";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await signUpWithEmail(email.trim(), password);
                Alert.alert("Success", "Account created successfully!");
            } else {
                await signInWithEmail(email.trim(), password);
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            let message = "Authentication failed. Please try again.";
            if (error.code === "auth/user-not-found") {
                message = "No account found with this email. Please sign up.";
            } else if (error.code === "auth/wrong-password") {
                message = "Incorrect password. Please try again.";
            } else if (error.code === "auth/invalid-email") {
                message = "Invalid email address.";
            } else if (error.code === "auth/weak-password") {
                message = "Password should be at least 6 characters.";
            } else if (error.code === "auth/email-already-in-use") {
                message = "This email is already registered. Please sign in.";
            }
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            if (Platform.OS !== "web") {
                Alert.alert("Note", "Google Sign-In works in web browser. Use email/password on mobile.");
            } else {
                Alert.alert("Error", "Google sign-in failed. Please try again.");
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Logo/Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>ThreatIQ</Text>
                        <Text style={styles.subtitle}>
                            {isSignUp ? "Create your account" : "Sign in to continue"}
                        </Text>
                    </View>

                    {/* Google Sign-In Button */}
                    <Button
                        variant="outline"
                        fullWidth
                        onPress={handleGoogleSignIn}
                        loading={googleLoading}
                        disabled={googleLoading || loading}
                        style={styles.googleButton}
                    >
                        <Ionicons name="logo-google" size={20} color={colors.foreground} />
                        <Text style={styles.googleText}>Continue with Google</Text>
                    </Button>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Email/Password Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor={colors.mutedForeground}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={colors.mutedForeground}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        <Button
                            fullWidth
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={loading || googleLoading}
                            style={styles.submitButton}
                        >
                            {isSignUp ? "Create Account" : "Sign In"}
                        </Button>

                        <Button
                            variant="ghost"
                            fullWidth
                            onPress={() => setIsSignUp(!isSignUp)}
                            disabled={loading || googleLoading}
                        >
                            <Text style={styles.switchText}>
                                {isSignUp
                                    ? "Already have an account? Sign In"
                                    : "Don't have an account? Sign Up"}
                            </Text>
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: spacing[6],
    },
    header: {
        alignItems: "center",
        marginBottom: spacing[8],
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: radius.xl,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[4],
    },
    title: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        marginBottom: spacing[2],
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
    },
    googleButton: {
        marginBottom: spacing[4],
    },
    googleText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.foreground,
        marginLeft: spacing[2],
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing[4],
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        paddingHorizontal: spacing[3],
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
    form: {
        gap: spacing[4],
    },
    inputGroup: {
        gap: spacing[2],
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.foreground,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[3],
        fontSize: fontSize.base,
        color: colors.foreground,
    },
    submitButton: {
        marginTop: spacing[2],
    },
    switchText: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
});
