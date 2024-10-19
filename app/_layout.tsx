import { Platform, AppState } from "react-native";
import { Slot, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import * as Notifications from 'expo-notifications';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const secureStorage = Platform.OS === "web" ? {
  getItem: async (key: string) => localStorage.getItem(key),
  setItem: async (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: async (key: string) => localStorage.removeItem(key),
} : {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

Notifications.setNotificationHandler({
  handleNotification: async () => {
    const appState = AppState.currentState;
    return {
      shouldShowAlert: appState !== 'active',
      shouldPlaySound: appState !== 'active',
      shouldSetBadge: appState !== 'active',
    };
  },
});

export default function Layout() {
  return <ConvexAuthProvider client={convex} storage={secureStorage}>
    <Slot screenOptions={{ headerShown: false }} />
  </ConvexAuthProvider>;
}
