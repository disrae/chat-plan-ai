import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Id } from 'convex/react';
import { ChatScreen } from '@/components/screens/Chat';

export default function PersonalChat() {
    const router = useRouter();
    const { conversationId } = useLocalSearchParams() as { conversationId: Id<'conversations'>; };

    const handleBackPress = () => {
        router.canGoBack() ? router.back() : router.replace('/conversations');
    };

    return (
        <ChatScreen
            conversationId={conversationId}
            isBusinessOwner={false}
            onBackPress={handleBackPress}
        />
    );
}
