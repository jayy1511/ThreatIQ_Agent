// Screen Container - Wrapper for all screens
import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/colors';

interface ScreenContainerProps {
    children: ReactNode;
    scroll?: boolean;
    padding?: boolean;
    keyboard?: boolean;
}

export function ScreenContainer({
    children,
    scroll = true,
    padding = true,
    keyboard = false
}: ScreenContainerProps) {
    const content = (
        <View style={[styles.content, padding && styles.padding]}>
            {children}
        </View>
    );

    const scrollContent = scroll ? (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {content}
        </ScrollView>
    ) : content;

    const keyboardContent = keyboard ? (
        <KeyboardAvoidingView
            style={styles.keyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {scrollContent}
        </KeyboardAvoidingView>
    ) : scrollContent;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {keyboardContent}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
    },
    padding: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    keyboard: {
        flex: 1,
    },
});
