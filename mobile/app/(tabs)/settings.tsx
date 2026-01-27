// Settings Screen - Full Implementation
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Card, Button, Input } from '../../src/components';
import { useAuth } from '../../src/lib/auth';
import { API_BASE_URL, validateConfig } from '../../src/lib/config';
import { colors, spacing, fontSize } from '../../src/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_OVERRIDE_KEY = 'api_base_url_override';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { valid, errors } = validateConfig();

    const [showDevSettings, setShowDevSettings] = useState(false);
    const [customApiUrl, setCustomApiUrl] = useState('');
    const [saving, setSaving] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/(auth)/login');
                        } catch (err) {
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    },
                },
            ]
        );
    };

    const clearLocalData = () => {
        Alert.alert(
            'Clear Local Data',
            'This will clear cached data. You will NOT lose your account or progress.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        Alert.alert('Done', 'Local cache cleared');
                    },
                },
            ]
        );
    };

    const saveCustomApiUrl = async () => {
        setSaving(true);
        try {
            if (customApiUrl.trim()) {
                await AsyncStorage.setItem(API_OVERRIDE_KEY, customApiUrl.trim());
                Alert.alert('Saved', 'Custom API URL saved. Restart the app to apply.');
            } else {
                await AsyncStorage.removeItem(API_OVERRIDE_KEY);
                Alert.alert('Cleared', 'Using default API URL');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const testApiConnection = async () => {
        const testUrl = customApiUrl.trim() || API_BASE_URL;
        if (!testUrl) {
            Alert.alert('Error', 'No API URL configured');
            return;
        }

        try {
            const response = await fetch(`${testUrl}/api/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                Alert.alert('Success', 'API connection successful! ✅');
            } else {
                Alert.alert('Warning', `API responded with status ${response.status}`);
            }
        } catch (err: any) {
            Alert.alert('Error', `Connection failed: ${err.message}`);
        }
    };

    return (
        <ScreenContainer>
            <Text style={styles.title}>Settings</Text>

            {/* Account Section */}
            <Card>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>User ID</Text>
                    <Text style={[styles.value, styles.uid]}>{user?.uid?.slice(0, 16)}...</Text>
                </View>
                <Button
                    title="Sign Out"
                    onPress={handleLogout}
                    variant="outline"
                    fullWidth
                    style={styles.button}
                />
            </Card>

            {/* Configuration Section */}
            <Card>
                <Text style={styles.sectionTitle}>Configuration</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>API Base URL</Text>
                    <Text style={[styles.value, !API_BASE_URL && styles.notSet]} numberOfLines={1}>
                        {API_BASE_URL || 'Not configured'}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Config Status</Text>
                    <Text style={[styles.value, valid ? styles.valid : styles.invalid]}>
                        {valid ? '✅ Valid' : '❌ Missing values'}
                    </Text>
                </View>

                {!valid && (
                    <View style={styles.errorList}>
                        <Text style={styles.errorListTitle}>Missing configuration:</Text>
                        {errors.map((error, i) => (
                            <Text key={i} style={styles.errorItem}>• {error}</Text>
                        ))}
                    </View>
                )}

                <Button
                    title="Test API Connection"
                    onPress={testApiConnection}
                    variant="outline"
                    fullWidth
                    style={styles.button}
                />
            </Card>

            {/* Storage Section */}
            <Card>
                <Text style={styles.sectionTitle}>Storage</Text>
                <Button
                    title="Clear Local Cache"
                    onPress={clearLocalData}
                    variant="secondary"
                    fullWidth
                />
            </Card>

            {/* Developer Settings */}
            <Card>
                <Button
                    title={showDevSettings ? "Hide Developer Options" : "Show Developer Options"}
                    onPress={() => setShowDevSettings(!showDevSettings)}
                    variant="ghost"
                    fullWidth
                />

                {showDevSettings && (
                    <View style={styles.devSection}>
                        <Text style={styles.devLabel}>Custom API URL Override:</Text>
                        <Input
                            placeholder="https://your-custom-api.com"
                            value={customApiUrl}
                            onChangeText={setCustomApiUrl}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <View style={styles.devButtons}>
                            <Button
                                title="Test"
                                onPress={testApiConnection}
                                variant="outline"
                                size="sm"
                                style={styles.devButton}
                            />
                            <Button
                                title={saving ? "Saving..." : "Save"}
                                onPress={saveCustomApiUrl}
                                loading={saving}
                                size="sm"
                                style={styles.devButton}
                            />
                        </View>
                    </View>
                )}
            </Card>

            {/* App Info */}
            <Card>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>App Version</Text>
                    <Text style={styles.value}>1.0.0</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Platform</Text>
                    <Text style={styles.value}>ThreatIQ Mobile (Expo)</Text>
                </View>
            </Card>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    label: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        flex: 1,
    },
    value: {
        fontSize: fontSize.md,
        color: colors.text,
        flex: 1,
        textAlign: 'right',
    },
    uid: {
        fontSize: fontSize.sm,
        fontFamily: 'monospace',
    },
    notSet: {
        color: colors.warning,
        fontStyle: 'italic',
    },
    valid: {
        color: colors.success,
    },
    invalid: {
        color: colors.error,
    },
    button: {
        marginTop: spacing.md,
    },
    errorList: {
        marginTop: spacing.sm,
        padding: spacing.sm,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
    },
    errorListTitle: {
        fontSize: fontSize.sm,
        color: colors.error,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    errorItem: {
        fontSize: fontSize.sm,
        color: colors.error,
        marginBottom: 2,
    },
    devSection: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
    },
    devLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.sm,
    },
    devButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    devButton: {
        flex: 1,
    },
});
