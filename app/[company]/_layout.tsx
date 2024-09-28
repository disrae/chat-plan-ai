import { Slot } from "expo-router";
import { View } from "react-native";

export default function DashboardLayout() {
    return <View className="flex-1">
        <Slot screenOptions={{ headerShown: false }} />
    </View>;
}