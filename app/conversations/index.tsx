import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useQuery, useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/convex/_generated/api';

type PathParam = { conversationName: string; };

export default function NonBusinessDashboard() {
    const router = useRouter();
    // const { conversationName } = useLocalSearchParams() as PathParam;
    // const conversationId = useQuery(api.conversations.getIdFromName, { name: conversationName });
    // console.log({ conversationId });

    // Query to get the messages for the current conversation
    // const messages = useQuery(api.conversations.loadConversation, { conversationName });

    // Mutation to add a message
    const addMessage = useMutation(api.messages.addMessage);

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

    return (
        <SafeAreaView>
            <Text>Chat Dashboard</Text>
        </SafeAreaView>
    );
}
