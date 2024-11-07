import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/components/screens/Chat';
import { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/hooks/useLocale';

export default function PersonalChat() {
    const router = useRouter();
    const { conversationId } = useLocalSearchParams() as { conversationId: Id<'conversations'>; };
    const { locale } = useLocale();

    return (
        <ChatScreen
            conversationId={conversationId}
            isBusinessOwner={false}
            onBackPress={router.canGoBack() ? router.back : () => router.replace(`/${locale}/conversations`)}
        />
    );
}
