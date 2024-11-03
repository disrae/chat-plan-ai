import React, { useState } from 'react';
import { colors } from '@/constants/Colors';
import { View, Text, StatusBar, SafeAreaView, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebEditor } from '@/components/screens/Editors/WebEditor';
import { Id } from '@/convex/_generated/dataModel';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { RegeneratePopup, SummaryOptions } from '@/components/screens/Summary/RegeneratePopup';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

export default function Summary() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { conversationId } = useLocalSearchParams();
    const generateSummary = useAction(api.ai.generateSummary);
    const [showRegeneratePopup, setShowRegeneratePopup] = useState(false);
    const [loading, setLoading] = useState<'' | 'Generating summary...'>('');

    const handleRegenerate = async (options: SummaryOptions) => {
        try {
            setLoading('Generating summary...');
            await generateSummary({
                conversationId: conversationId as Id<'conversations'>,
                options: options
            });
        } catch (error) {
            console.error('Failed to regenerate summary:', error);
        } finally {
            setLoading('');
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View className='flex-1'>
            {showRegeneratePopup && (
                <RegeneratePopup
                    loading={loading}
                    onClose={() => setShowRegeneratePopup(false)}
                    onSubmit={(options) => {
                        handleRegenerate(options);
                        setShowRegeneratePopup(false);
                    }}
                />
            )}
            <StatusBar barStyle="light-content" />
            <View style={{ height: insets.top, backgroundColor: colors.primary.dark }}></View>
            <SafeAreaView className='flex-1'>
                {/* Header */}
                <View className='bg-primary-dark flex-row justify-between items-center px-4 py-2 pb-4'>
                    <Pressable
                        onPress={handleBack}
                        style={{ padding: 8 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <AntDesign name="arrowleft" size={32} color="white" />
                    </Pressable>

                    <View className='flex-col'>
                        <Text className='text-slate-100 text-xl font-medium text-right mb-2'>Summary</Text>
                        <Pressable
                            className='flex-row items-center px-3 py-2 bg-slate-200 rounded'
                            onPress={() => setShowRegeneratePopup(true)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <FontAwesome name="refresh" size={16} color="black" />
                            <Text className='font-medium ml-2'>
                                {loading ? 'Generating...' : 'Regenerate'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Editor */}
                <WebEditor conversationId={conversationId as Id<'conversations'>} />

            </SafeAreaView>
        </View>
    );
}
