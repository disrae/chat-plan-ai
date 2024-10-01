import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Popup } from '../utils/Popup';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DashboardModals } from '@/app/[company]';
import { Id } from '@/convex/_generated/dataModel';

type Props = {
    setModal: React.Dispatch<React.SetStateAction<DashboardModals>>;
    projectId?: Id<'projects'>;
};

export function AddConversation({ setModal, projectId }: Props) {
    const [loading, setLoading] = useState<'creating-conversation' | ''>('');
    const [name, setName] = useState('');
    const [emails, setEmails] = useState<string>();
    const [error, setError] = useState('');
    const addConversation = useMutation(api.conversations.addConversation);
    const dashboard = useQuery(api.users.getUserDashboardData);

    const updateError = (error: string) => {
        setError(error);
        setTimeout(() => setError(''), 8000);
    };

    return (
        <Popup onClose={() => setModal({ type: '' })}>
            <ScrollView className="p-6 max-w-lg rounded-lg bg-white shadow-lg">
                <View className="">

                    {/* Header Section */}
                    <View className="mb-4">
                        <Text className="text-2xl font-bold">Create New Conversation</Text>
                        {/* <View className='h-2' />
                        <Text className="text-gray-600">Enter the conversation name</Text> */}
                    </View>

                    {/* Name Input */}
                    <View className="">
                        <Text className="font-semibold text-gray-800 ">Name</Text>
                        <View className='h-2' />
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-md p-3 text-gray-800 focus:border-primary focus:outline-primary"
                            placeholder="General Planning"
                            value={name}
                            onChangeText={setName}
                        />
                        <View className='h-4' />
                    </View>
                    {/* Email Input */}
                    {/* <View className="mb-4">
                        <Text className="font-semibold text-gray-800 ">Participants</Text>
                        <View className='h-2' />
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-md p-3 text-gray-800 focus:border-primary focus:outline-primary"
                            placeholder="email1, email2, email3..."
                            value={emails}
                            onChangeText={setName}
                        />
                    </View> */}

                    {error && <View className='h-12 justify-center items-center'>
                        <Text className="text-red-500 text-center">{JSON.stringify(error, null, 2)}</Text>
                    </View>}

                    {/* Submit Button */}
                    <Pressable
                        className={`bg-primary py-3 rounded-md `}
                        onPress={async () => {
                            if (loading) { return; }
                            if (!dashboard?.businesses?.[0]?._id) {
                                updateError('Uh oh! Couldn\'t find your business.');
                                return;
                            }
                            setLoading('creating-conversation');
                            try {
                                if (!name) { throw new Error('The conversation name is required'); }
                                if (!projectId) { throw new Error('Contact the developer, no projectId found'); }
                                await addConversation({ name, projectId, business: dashboard.businesses[0]._id });
                                setModal({ type: '' });
                            } catch (error) {
                                console.error(error);
                                updateError(error.message);
                            } finally {
                                setLoading('');
                            }
                        }}
                        disabled={!!loading}
                    >
                        {loading ? (
                            <ActivityIndicator style={{ height: 28 }} color="#fff" />
                        ) : (
                            <Text className="text-white text-center text-lg font-medium">Create</Text>
                        )}
                    </Pressable>

                </View>
            </ScrollView>
        </Popup>
    );
}
