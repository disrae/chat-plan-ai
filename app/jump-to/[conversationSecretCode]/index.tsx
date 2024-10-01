import { api } from '@/convex/_generated/api';
import { AntDesign } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, View } from 'react-native';

export default function index() {
    const user = useQuery(api.users.currentUser);
    const { conversationSecretCode } = useLocalSearchParams() as { conversationSecretCode: string; };
    const conversation = useQuery(api.conversations.getConversationBySecret, { secret: conversationSecretCode });
    console.log(JSON.stringify({ conversation, user }, null, 2));

    // Check if user is authenticated
    //  If not user, do an anonymous sign in

    return (
        <SafeAreaView className='flex-1'>
            <Pressable
                onPress={router.back}
                className='p-4'
            >
                <AntDesign name="arrowleft" size={24} color="black" />
            </Pressable>
        </SafeAreaView>
    );
}

