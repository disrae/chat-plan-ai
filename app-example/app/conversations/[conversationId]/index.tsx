import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation } from "convex/react";
import { api } from 'convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';

type PathParam = { conversationName: string; };

export default function Chat() {
    const router = useRouter();
    const { conversationName } = useLocalSearchParams() as PathParam;
    const conversationId = useQuery(api.conversations.getIdFromName, { name: conversationName });
    console.log({ conversationId });

    // Query to get the messages for the current conversation
    const messages = useQuery(api.conversations.loadConversation, { conversationName });

    // Mutation to add a message
    const addMessage = useMutation(api.messages.addMessage);

    // State to hold the new message body and author
    const [newMessage, setNewMessage] = useState('');
    const [author, setAuthor] = useState('');

    // Function to handle sending a new message
    const handleSendMessage = async () => {
        if (newMessage.trim() && author.trim()) {
            await addMessage({
                author: author,
                role: 'owner',
                body: newMessage,
                conversationId
            });

            // Clear the input fields after sending the message
            setNewMessage('');
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
            <View style={{ padding: 10 }}>
                <TextInput
                    placeholder="Your name"
                    value={author}
                    onChangeText={setAuthor}
                    style={{ borderBottomWidth: 1, padding: 8, marginBottom: 10 }}
                />
                <TextInput
                    placeholder="Type a message"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
                />
                <Button title="Send Message" onPress={handleSendMessage} />
            </View>
        </KeyboardAvoidingView>
    );
}
