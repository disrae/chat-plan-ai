import { colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useLocalSearchParams } from 'expo-router';

export default function TabLayout() {
    const { company, project, conversationId } = useLocalSearchParams();

    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary.DEFAULT }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
                    headerShown: false,
                }}
                initialParams={{ company, project, conversationId }}
            />
            <Tabs.Screen
                name="summary"
                options={{
                    title: 'Summary',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="list-ul" color={color} />,
                    headerShown: false,
                }}
                initialParams={{ company, project, conversationId }}
            />
        </Tabs>
    );
}
