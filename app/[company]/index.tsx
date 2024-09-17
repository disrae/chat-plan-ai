import { useRouter } from "expo-router";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function CompanyPage() {
    const router = useRouter();
    return <SafeAreaView>
        <ScrollView className="flex-grow border">
            <Text className="text-3xl font-bold">Company Page</Text>
        </ScrollView>
    </SafeAreaView>;
}