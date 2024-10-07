import { AntDesign } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = { leftButton?: React.ReactNode; rightButton?: React.ReactNode; };
export function Header({ }: Props) {
    return (
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
                <AntDesign name="home" size={24} color="black" />
                <Text className="text-xl font-bold">ChatPlan</Text>
            </View>
            <View className="flex-row items-center gap-2">
                <AntDesign name="setting" size={24} color="black" />
                <Text className="text-xl font-bold">Settings</Text>
            </View>
        </View>
    );
}