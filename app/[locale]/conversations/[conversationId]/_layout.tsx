import { colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';

export default function TabLayout() {
    const { width } = useWindowDimensions();
    const isLargeScreen = width > 768; // Assuming 768px as the breakpoint for large screens

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: colors.primary.DEFAULT,
            tabBarStyle: isLargeScreen ? {
                paddingVertical: 10,
            } : undefined,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
                    headerShown: false,
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
