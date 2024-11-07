import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ChatScreen } from '@/components/screens/Chat';
import { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/hooks/useLocale';

export default function BusinessChat() {
    const router = useRouter();
    const { conversationId, company } = useLocalSearchParams() as { conversationId: Id<'conversations'>; company: string; };
    const { locale } = useLocale();

    return (
        <ChatScreen
            conversationId={conversationId}
            isBusinessOwner={true}
            onBackPress={router.canGoBack() ? router.back : () => router.replace(`/${locale}/${company}`)}
        />
    );
}
