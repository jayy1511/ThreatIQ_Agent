/**
 * App Navigation Setup
 * Shows Login if not authenticated, otherwise main tabs
 */

import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import {
    DashboardScreen,
    AnalyzeScreen,
    LessonsScreen,
    ProgressScreen,
    GmailScreen,
    LoginScreen,
} from "../screens";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

// Tab param list type
export type TabParamList = {
    Dashboard: undefined;
    Analyze: undefined;
    Lessons: undefined;
    Progress: undefined;
    Gmail: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Icon mapping
function getTabIcon(routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap {
    const iconMap: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
        Dashboard: { active: "home", inactive: "home-outline" },
        Analyze: { active: "search", inactive: "search-outline" },
        Lessons: { active: "book", inactive: "book-outline" },
        Progress: { active: "stats-chart", inactive: "stats-chart-outline" },
        Gmail: { active: "mail", inactive: "mail-outline" },
    };

    const icons = iconMap[routeName] || { active: "ellipse", inactive: "ellipse-outline" };
    return focused ? icons.active : icons.inactive;
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const iconName = getTabIcon(route.name, focused);
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.mutedForeground,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "500",
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ tabBarLabel: "Home" }}
            />
            <Tab.Screen
                name="Analyze"
                component={AnalyzeScreen}
            />
            <Tab.Screen
                name="Lessons"
                component={LessonsScreen}
            />
            <Tab.Screen
                name="Progress"
                component={ProgressScreen}
                options={{ tabBarLabel: "Stats" }}
            />
            <Tab.Screen
                name="Gmail"
                component={GmailScreen}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <MainTabs /> : <LoginScreen />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
});
