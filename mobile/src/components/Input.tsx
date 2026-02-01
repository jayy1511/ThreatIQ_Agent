// Input Component - Matches Web UI
import React from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme/colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
    containerStyle,
    ...props
}: InputProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    props.multiline && styles.multilineInput,
                    error && styles.inputError,
                ]}
                placeholderTextColor={colors.textDim}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: fontSize.md,
        color: colors.text,
        minHeight: 48,
    },
    multilineInput: {
        minHeight: 120,
        textAlignVertical: 'top',
        paddingTop: spacing.md,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        fontSize: fontSize.sm,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
