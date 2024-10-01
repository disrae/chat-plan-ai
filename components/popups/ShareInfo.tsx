import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Popup } from '../utils/Popup';
import { DashboardModals } from '@/app/[company]';
import { ConversationModals } from '@/app/[company]/[project]/[conversationId]';

type Props = {
    setModal: React.Dispatch<React.SetStateAction<ConversationModals>>;
    shareLink?: string;
};

export function ShareInfo({ setModal, shareLink }: Props) {

    if (!shareLink) { return null; }
    return (
        <Popup onClose={() => setModal({ type: '' })}>
            <ScrollView className="p-6 max-w-lg rounded-lg bg-white shadow-lg">
                <View className="">

                    {/* Header Section */}
                    <View className="mb-4">
                        {/* <Text className="text-2xl font-bold">Invite to Chat</Text> */}
                        {/* <View className='h-1' /> */}
                        <Text className="text-gray-600">Magic link copied to your clipboard!</Text>
                        <Text className="text-gray-600">{shareLink}</Text>
                    </View>

                    {/* Info Section */}
                    <View className="mb-4 gap-2">
                        {/* <Text className="text-gray-900">Send the link we've copied to your clipboard to your customers to join the chat.</Text> */}
                        <Text className="text-gray-900">This is a secret link, anyone with this link can join your chat.</Text>
                    </View>

                    <View>
                        <Pressable className='bg-primary py-3 rounded-md' onPress={() => setModal({ type: '' })}>
                            <Text className="text-white text-center text-lg font-medium">Got it</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </Popup>
    );
}
