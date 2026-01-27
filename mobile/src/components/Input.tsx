// Input Component
import React from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    multiline?: boolean;
    numberOfLines?: number;
}

export function Input({
    label,
    error,
    containerStyle,
    multiline = false,
    numberOfLines = 1,
    ...props
}: InputProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multiline,
                    multiline && { minHeight: numberOfLines * 24 + spacing.md * 2 },
                    error && styles.inputError,
                ]}
                placeholderTextColor={colors.textDim}
                multiline={multiline}
                numberOfLines={numberOfLines}
                textAlignVertical={multiline ? 'top' : 'center'}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        color: colors.text,
        fontSize: fontSize.sm,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: fontSize.md,
        color: colors.text,
        minHeight: 44,
    },
    multiline: {
        paddingTop: spacing.md,
    },
    inputError: {
        borderColor: colors.error,
    },
    error: {
        color: colors.error,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
});
