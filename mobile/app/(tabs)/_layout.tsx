// Tabs Layout
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';

// Simple icon component using emojis for now
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
    return (
        <View style={[styles.iconContainer, focused && styles.iconFocused]}>
            <View style={styles.icon}>
                <View style={{ opacity: focused ? 1 : 0.6 }}>
                    <TabEmoji emoji={emoji} />
                </View>
            </View>
        </View>
    );
}

function TabEmoji({ emoji }: { emoji: string }) {
    // Using Text for emoji icons
    const Text = require('react-native').Text;
    return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="analyze"
                options={{
                    title: 'Analyze',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="lessons"
                options={{
                    title: 'Lessons',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.card,
        borderTopColor: colors.cardBorder,
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: 8,
        height: 70,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 4,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconFocused: {
        // Add any focused styles
    },
    icon: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
