import React, { useState } from 'react';
import { colors } from '@/constants/Colors';
import { View, Text, StatusBar, SafeAreaView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MobileEditor } from '@/components/screens/Editors/MobileEditor';
import { Id } from '@/convex/_generated/dataModel';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { RegeneratePopup, SummaryOptions } from '@/components/screens/Summary/RegeneratePopup';

export default function Summary() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { conversationId } = useLocalSearchParams() as { conversationId: Id<'conversations'>; };
    const generateSummary = useAction(api.ai.generateSummary);
    const [showRegeneratePopup, setShowRegeneratePopup] = useState(false);
    const [loading, setLoading] = useState<'' | 'Generating summary...'>('');

    const onBackPress = () => {
        router.back();
    };

    const handleRegenerate = async (options: SummaryOptions) => {
        try {
            setLoading('Generating summary...');
            await generateSummary({
                conversationId,
                options: options
            });
        } catch (error) {
            console.error('Failed to regenerate summary:', error);
        } finally {
            setLoading('');
        }
    };

    return (
        <View className='flex-1'>
            {showRegeneratePopup && (<RegeneratePopup
                loading={loading}
                onClose={() => setShowRegeneratePopup(false)}
                onSubmit={(options) => {
                    handleRegenerate(options);
                    setShowRegeneratePopup(false);
                }}
            />
            )}
            <StatusBar barStyle="light-content" />
            <View style={{ height: insets.top, backgroundColor: colors.primary.dark }} />
            <SafeAreaView className='flex-1'>
                {/* Header */}
                <View className='bg-primary-dark'>
                    <View className='flex-row items-center px-4 py-2'>
                        <Pressable
                            onPress={onBackPress}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <AntDesign name="arrowleft" size={24} color="white" />
                        </Pressable>

                        <Text className='flex-1 text-slate-100 text-xl font-medium text-center'>
                            Summary
                        </Text>

                        <Pressable
                            className='flex-row items-center px-3 py-2 bg-slate-200 rounded'
                            onPress={() => setShowRegeneratePopup(true)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <FontAwesome name="refresh" size={16} color="black" />
                            {!loading && (
                                <Text className='font-medium ml-2'>
                                    Regenerate
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* Editor */}
                <MobileEditor conversationId={conversationId} />
            </SafeAreaView>
        </View>
    );
}
