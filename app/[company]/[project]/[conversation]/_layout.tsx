import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
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
