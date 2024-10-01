import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { colors } from '@/constants/Colors';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Chat() {
    const router = useRouter();
    const { conversationId } = useLocalSearchParams() as { conversationId: Id<'conversations'>; };
    const [newMessage, setNewMessage] = useState('');
    const user = useQuery(api.users.currentUser);
    const conversation = useQuery(api.conversations.getConversationById, { conversationId });
    const messages = useQuery(api.messages.list, { conversationId });
    const send = useMutation(api.messages.send);
    const [loading, setLoading] = useState<'sending' | ''>('');

    console.log(JSON.stringify({ messages }, null, 2));

    const sendMessage = async () => {
        try {
            setLoading('sending');
            if (newMessage.trim() && conversationId.trim()) {
                await send({
                    name: user?.name || 'anonymous',
                    body: newMessage,
                    conversationId
                });
                setNewMessage('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading('');
        }
    };

    if (!conversation) { return null; }
    return <KeyboardAvoidingView
        className='flex-1 justify-between'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <SafeAreaView className='flex-1'>
            {/* Header */}
            <View className=' flex-row bg-primary-dark justify-between items-center px-4 '>
                <Pressable onPress={router.back} className='' hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </Pressable>
                <View className='flex-1 py-2 pl-2'>
                    <Text className='text-slate-100 text-lg font-medium text-right'>
                        {conversation.name}
                    </Text>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                className='bg-white p-4'
                data={messages ?? []}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                    const isAuthor = item?.author === user?._id;
                    return isAuthor ? (
                        <View className={`flex-row my-1 ${isAuthor ? 'justify-end' : 'justify-start'}`}>
                            <View className={`max-w-[75%] p-2 rounded-lg shadow-sm bg-primary rounded-br-none`}>
                                <Text className={`${'text-gray-50'}`}>{item?.body}</Text>
                            </View>
                        </View>
                    ) : (
                        <View className={`flex-row my-1 justify-start`}>
                            <View
                                className={`max-w-[75%] p-2 rounded-lg shadow-sm bg-slate-600 border-gray-300 rounded-bl-none`}
                            >
                                <Text className={'text-white text-[8px]'}>{item?.name}</Text>
                                <Text className='text-gray-50'>{item?.body}</Text>
                            </View>
                        </View>
                    );
                }}
                keyExtractor={(item) => item._id}
            />

            {/* Input */}
            <View className='bg-slate-50 px-2 py-2'>
                <View className='flex-row items-center'>
                    <TextInput
                        className='flex-1 text-slate-800 border border-gray-400 rounded p-2 tracking-tighter'
                        placeholder="Type a message"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline={true}
                        style={{ minHeight: 40, maxHeight: 160, height: 'auto', overflowY: 'auto' }}
                        textAlignVertical="top"
                    />
                    <Pressable
                        className='rounded-full p-3 bg-primary ml-2'
                        onPress={sendMessage}
                        disabled={!!loading}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {loading ? (
                            <ActivityIndicator style={{ height: 12, width: 12 }} color={'white'} />
                        ) : (
                            <FontAwesome name="send" size={12} color={'white'} />
                        )}
                    </Pressable>
                </View>
            </View>


        </SafeAreaView>
    </KeyboardAvoidingView >;

}
