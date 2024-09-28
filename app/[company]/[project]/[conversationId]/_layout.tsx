import { colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary.DEFAULT }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'index',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
                    headerShown: false,
                    headerBackground: () => <View className="bg-red-500" />,
                }}
            />
            <Tabs.Screen
                name="summary"
                options={{
                    title: 'Summary',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="list-ul" color={color} />,
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
