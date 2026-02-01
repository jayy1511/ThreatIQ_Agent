// Dynamic Expo Configuration
// Using app.config.js instead of app.json for environment variable support

export default {
    expo: {
        name: "ThreatIQ",
        slug: "threatiq-mobile",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        scheme: "threatiq",
        userInterfaceStyle: "dark",

        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#0B0F1A"
        },

        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.threatiq.mobile"
        },

        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#0B0F1A"
            },
            package: "com.threatiq.mobile"
        },

        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/favicon.png"
        },

        plugins: [
            "expo-router"
        ],

        experiments: {
            typedRoutes: true
        },

        extra: {
            router: {
                origin: false
            },
            eas: {
                projectId: "cec65e27-bcc8-4a5d-a4a1-02da76c8e16b"
            }
        }
    }
};
