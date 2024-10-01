import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Pressable } from 'react-native';
import { useQuery, useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { colors } from '@/constants/Colors';

// type PathParam = { conversationName: string; };

export default function Chat() {
    const router = useRouter();
    const { conversationId } = useLocalSearchParams() as unknown as { conversationId: Id<'conversations'>; };
    const conversation = useQuery(api.conversations.getConversationById, { conversationId });
    const messages = useQuery(api.messages.list, { conversationId });
    const send = useMutation(api.messages.send);
    const sendMessage = async () => {
        if (newMessage.trim() && author.trim()) {
            await send({
                body: newMessage,
                conversationId
            });
            setNewMessage('');
        }
    };

    // State to hold the new message body and author
    const [newMessage, setNewMessage] = useState('');
    const [author, setAuthor] = useState('');

    // Function to handle sending a new message
    // const handleSendMessage = async () => {
    //     if (newMessage.trim() && author.trim()) {
    //         await addMessage({
    //             author: author,
    //             role: 'owner',
    //             body: newMessage,
    //             conversationId
    //         });

    //         // Clear the input fields after sending the message
    //         setNewMessage('');
    //     }
    // };

    // Render each message in the list
    const renderMessage = ({ item }: { item: any; }) => (
        <View style={{ padding: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.author}:</Text>
            <Text>{item.body}</Text>
        </View>
    );
    if (!conversation) { return null; }
    return <KeyboardAvoidingView
        className='flex-1 justify-between'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <SafeAreaView className='flex-1'>
            <View className=' bg-primary'>
                <Text className='text-slate-100 text-2xl font-bold px-4 py-2'>
                    {conversation.name}
                </Text>
            </View>

            {/* List of Messages */}
            <View className='flex-1 bg-white'>
                <FlatList
                    className=''
                    data={messages ?? []}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item._id}
                />
            </View>

            {/* Input for new message */}
            <View className=' bg-slate-50 px-2 py-2'>
                {/* <TextInput
                    placeholder="Your name"
                    value={author}
                    onChangeText={setAuthor}
                    style={{ borderBottomWidth: 1, padding: 8, marginBottom: 10 }}
                /> */}
                <View className='flex-row items-center'>
                    <TextInput
                        className='flex-1 text-slate-800 border border-gray-400 rounded p-2 tracking-tighter h-8'
                        placeholder="Type a message"
                        value={newMessage}
                        onChangeText={setNewMessage}
                    />
                    <Pressable
                        className='rounded p-1 ml-2 h-8'
                        onPress={sendMessage}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <FontAwesome name="send" size={24} color={colors.primary.DEFAULT} />
                    </Pressable>
                </View>
                {/* <Button title="Send Message" onPress={handleSendMessage} /> */}
            </View>
        </SafeAreaView>
    </KeyboardAvoidingView>;

}
