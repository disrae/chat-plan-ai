import React from 'react';
import { colors } from '@/constants/Colors';
import { View, Text, StatusBar, SafeAreaView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebEditor } from '@/components/screens/Editors/WebEditor';
import { Id } from '@/convex/_generated/dataModel';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function Summary() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { conversationId } = useLocalSearchParams();
    const generateSummary = useAction(api.ai.generateSummary);

    const handleRegenerate = async () => {
        try {
            await generateSummary({
                conversationId: conversationId as Id<'conversations'>,
                customerPrompt: ""
            });
        } catch (error) {
            console.error('Failed to regenerate summary:', error);
        }
    };

    return (
        <View className='flex-1'>
            <StatusBar barStyle="light-content" />
            <View style={{ height: insets.top, backgroundColor: colors.primary.dark }}></View>
            <SafeAreaView className='flex-1'>

                {/* Header */}
                <View className='bg-primary-dark'>
                    <View className='flex-row justify-between items-center px-4'>
                        <View className='py-2'>
                            <Text className='text-slate-100 text-xl font-medium'>
                                Summary
                            </Text>
                        </View>
                        <Pressable
                            onPress={handleRegenerate}
                            className='bg-primary-light px-3 py-1 rounded-md'>
                            <Text className='text-slate-100'>Regenerate</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Editor */}
                <WebEditor conversationId={conversationId as Id<'conversations'>} />

            </SafeAreaView>
        </View>
    );
}
