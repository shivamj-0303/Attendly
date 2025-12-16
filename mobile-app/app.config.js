export default {
  expo: {
    name: "Attendly",
    slug: "attendly",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#2563eb"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.attendly.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#2563eb"
      },
      package: "com.attendly.app",
      versionCode: 1,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // API URL from environment variable or fallback to localhost
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api",
      eas: {
        projectId: "27d102f1-8754-4875-843c-334473755cfb"
      }
    }
  }
};
