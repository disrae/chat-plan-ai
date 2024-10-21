import { Slot, Stack } from 'expo-router';

export default function CompanyLayout() {
    return (
        <Slot screenOptions={{ headerShown: true }}></Slot>
    );
}
