/**
 * Skeleton Component
 * Loading placeholder with shimmer effect
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";
import { Colors, BorderRadius } from "../../config";

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({
    width = "100%",
    height = 20,
    borderRadius = BorderRadius.md,
    style,
}: SkeletonProps) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
}

// Preset skeleton shapes
export function SkeletonText({ lines = 1, style }: { lines?: number; style?: ViewStyle }) {
    return (
        <View style={style}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height={16}
                    width={i === lines - 1 ? "70%" : "100%"}
                    style={{ marginBottom: i < lines - 1 ? 8 : 0 }}
                />
            ))}
        </View>
    );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
    return (
        <View style={[styles.skeletonCard, style]}>
            <Skeleton height={24} width="60%" style={{ marginBottom: 12 }} />
            <SkeletonText lines={2} />
            <Skeleton height={40} width="100%" style={{ marginTop: 16 }} borderRadius={BorderRadius.md} />
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: Colors.muted,
    },
    skeletonCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
    },
});
