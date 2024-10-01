import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

/**
 */

type PathParam = { conversationId: Id<'conversations'>; };

export default function Chat() {
    const router = useRouter();
    const { conversationId } = useLocalSearchParams() as PathParam;
    const messages = useQuery(api.messages.list, { conversationId });
    const sendMessage = useMutation(api.messages.send);

    const [newMessage, setNewMessage] = useState('');
    const [author, setAuthor] = useState('');

    const handleSendMessage = async () => {
        if (newMessage.trim() && author.trim()) {
            try {
                await sendMessage({
                    body: newMessage,
                    conversationId
                });
                setNewMessage('');
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Render each message in the list
    const renderMessage = ({ item }: { item: any; }) => (
        <View style={{ padding: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.author}:</Text>
            <Text>{item.body}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'space-between' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Chat Dashboard: {conversationName}</Text>

                {/* List of Messages */}
                <FlatList
                    data={messages ?? []} // Provide messages or an empty array if undefined
                    renderItem={renderMessage}
                    keyExtractor={(item) => item._id}
                />
            </View>

            {/* Input for new message */}
            <View className=''>
                {/* <TextInput
                    placeholder="Your name"
                    value={author}
                    onChangeText={setAuthor}
                    style={{ borderBottomWidth: 1, padding: 8, marginBottom: 10 }}
                /> */}
                <TextInput
                    placeholder="Type a message"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    // style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}dasdasd
                    className='border focus:outline-primary rounded-md p-2 text-black'
                />
                {/* <Button title="Send Message" onPress={handleSendMessage} /> */}
            </View>
        </KeyboardAvoidingView>
    );
}
