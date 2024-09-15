import { Stack } from 'expo-router';

export default function CompanyLayout() {
    return (
        <Stack>
            {/* Project List Screen */}
            <Stack.Screen
                name="[project]"
                options={{ title: 'Projects' }}
            />

            {/* Settings Screen */}
            <Stack.Screen
                name="account"
                options={{ title: 'Account' }}
            />
        </Stack>
    );
}
