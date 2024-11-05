import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Id } from 'convex/react';
import { ChatScreen } from '@/components/screens/Chat';

export default function BusinessChat() {
    const router = useRouter();
    const { conversationId } = useLocalSearchParams() as { conversationId: Id<'conversations'>; };

    return (
        <ChatScreen
            conversationId={conversationId}
            isBusinessOwner={true}
            onBackPress={router.back}
        />
    );
}
