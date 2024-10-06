import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // For icons, you can replace these if needed

import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { shadow } from '@/constants/styles';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/dist/react';
import { AddProject } from '@/components/popups/AddProject';
import { Id } from '@/convex/_generated/dataModel';
import { AddConversation } from '@/components/popups/AddConversation';

export type DashboardModals = {
    type: '' | 'addProject' | 'addConversation',
    payload?: { projectId?: Id<'projects'>; };
};

export default function CompanyDashboard() {
    const router = useRouter();
    const { company } = useLocalSearchParams();
    const { signOut } = useAuthActions();
    const dashboard = useQuery(api.users.getUserDashboardData);
    const user = useQuery(api.users.currentUser);
    const business = dashboard?.businesses?.[0];
    const [modal, setModal] = useState<DashboardModals>({ type: '' });

    useEffect(() => {
        if (user === null) {
            router.replace('/');
        }
    }, [user]);

    return (
        <View className="flex-1">
            {modal.type === 'addProject' && <AddProject setModal={setModal} />}
            {modal.type === 'addConversation' && <AddConversation setModal={setModal} projectId={modal.payload?.projectId} />}
            <SafeAreaView className="flex-1 mx-4 md:my-4 items-center gap-y-4">
                <View className='w-full max-w-2xl'>

                    {/* Logout Button */}
                    <View className='flex-row justify-end'>
                        <Pressable
                            onPress={signOut}
                            className="bg-slate-200 shadow px-4 py-2 rounded">
                            <Text className="text-xs font-medium">Logout</Text>
                        </Pressable>
                    </View>

                    {/* Company Info */}
                    <View className="mb-4">
                        <Text className="text-3xl font-bold mt-2">{company}</Text>
                        <Text className="text-xl font-semibold">Projects & Conversations</Text>
                    </View>

                    {/* Search Input */}
                    {!!business?.projects.length && <TextInput
                        className="bg-white p-2 mb-4 border rounded-lg"
                        placeholder="Search conversations..."
                        inputMode='search'
                    />}

                    {/* Conversation List */}
                    <View className="space-y-6">

                        {/* Conversations List */}
                        {dashboard?.conversations?.map((conversation) => {
                            if (!conversation) { return null; }
                            return (
                                <Pressable
                                    key={conversation?._id}
                                    className="flex-row items-center bg-slate-200 py-3 px-2 rounded-md shadow"
                                    onPress={() => {
                                        router.push(`/conversations/${conversation?._id}`);
                                    }}
                                >
                                    <AntDesign style={{ paddingRight: 8 }} name="message1" size={16} color={colors.primary.DEFAULT} />
                                    <View className=''>
                                        <Text className="text-lg font-medium">{conversation?.projectName}</Text>
                                        <Text className="font-medium">{conversation?.businessName}</Text>
                                        <Text className="">{conversation?.ownerName}</Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </SafeAreaView >
        </View >
    );
};

