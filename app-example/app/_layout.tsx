import "../global.css";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Slot, Stack } from "expo-router";
import { ConvexReactClient } from "convex/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL);

const secureStorage = Platform.OS === "web" ? {
  getItem: async (key: string) => localStorage.getItem(key),
  setItem: async (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: async (key: string) => localStorage.removeItem(key),
} : {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function Layout() {
  return <ConvexAuthProvider client={convex} storage={secureStorage}>
    <Slot />
  </ConvexAuthProvider>;
}
