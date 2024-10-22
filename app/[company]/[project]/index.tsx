import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { colors } from '@/constants/Colors';
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProjectDashboard() {
    const { company, project } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useQuery(api.users.currentUser);
    const businessData = useQuery(api.users.getBusinessByName, { name: company as string });
    const projectData = useQuery(api.users.getProjectByName, {
        businessId: businessData?._id,
        name: project as string
    });

    useEffect(() => {
        if (user === null) {
            router.replace('/');
        } else if (user && !businessData) {
            router.replace('/404');
        } else if (businessData && !projectData) {
            router.replace(`/${company}`);
        }
    }, [user, businessData, projectData]);

    const handleBack = () => {
        router.push(`/${company}`);
    };

    if (user === undefined || businessData === undefined || projectData === undefined) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            </View>
        );
    }

    if (!projectData) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-lg">Project not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1" style={{ paddingTop: insets.top }}>
            <View className="bg-primary-dark p-4 flex-row items-center">
                <Pressable onPress={handleBack}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold ml-4">{projectData.name}</Text>
            </View>
            <View className="flex-1 justify-center items-center">
                <Text className="text-2xl font-bold">{projectData.name} Dashboard</Text>
                <Text className="text-lg mt-4">Company: {businessData?.name}</Text>
            </View>
        </SafeAreaView>
    );
}