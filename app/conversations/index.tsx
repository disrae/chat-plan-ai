import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Pressable, Platform } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // For icons, you can replace these if needed

import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { shadow } from '@/constants/styles';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/dist/react';
import { AddProject } from '@/components/popups/AddProject';
import { Id } from '@/convex/_generated/dataModel';
import { AddConversation } from '@/components/popups/AddConversation';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export type DashboardModals = {
    type: '' | 'addProject' | 'addConversation',
    payload?: { projectId?: Id<'projects'>; };
};

export default function Conversations() {
    const router = useRouter();
    const { company } = useLocalSearchParams();
    const { signOut } = useAuthActions();
    const dashboard = useQuery(api.users.getUserDashboardData);
    const user = useQuery(api.users.currentUser);
    const business = dashboard?.businesses?.[0];
    const [modal, setModal] = useState<DashboardModals>({ type: '' });
    const updateUser = useMutation(api.users.updateUser);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    useEffect(() => {
        if (user === null) {
            router.replace('/');
        } else if (user) {
            registerForPushNotificationsAsync().then(token => updateUserPushToken(token));
        }

        // Set up notification listeners
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            // console.log(notification);
            // Handle the received notification here if needed
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const conversationId = response.notification.request.content.data?.conversationId;
            if (conversationId) {
                router.push(`/conversations/${conversationId}`);
            }
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current!);
            Notifications.removeNotificationSubscription(responseListener.current!);
        };
    }, [user]);

    const updateUserPushToken = async (token: string | undefined) => {
        if (token) {
            try {
                await updateUser({ pushToken: token });
            } catch (error) {
                console.error('Failed to update user push token:', error);
            }
        }
    };

    async function registerForPushNotificationsAsync() {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                alert('Project ID not found');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    }

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
