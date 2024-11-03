import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Platform } from 'react-native';
import { colors } from '@/constants/Colors';
import { Popup } from '@/components/utils/Popup';
import Checkbox from 'expo-checkbox';

export interface SummaryOptions {
    preserveDocument: boolean;
    includeChat: boolean;
    customPrompt?: string;
}

interface RegeneratePopupProps {
    onClose: () => void;
    onSubmit: (options: SummaryOptions) => void;
    loading: string;
}

export const RegeneratePopup = ({ onClose, onSubmit, loading }: RegeneratePopupProps) => {
    const [includeDocument, setIncludeDocument] = useState(true);
    const [includeChat, setIncludeChat] = useState(true);
    const [customPrompt, setCustomPrompt] = useState('');

    // Add hover classes only for web
    const hoverClass = Platform.OS === 'web' ? 'hover:opacity-80' : '';

    return (
        <Popup onClose={onClose}>
            <View className="p-6">
                <Text className="text-xl font-bold tracking-tighter mb-4">Regenerate Summary</Text>
                <View className="gap-4">
                    <Pressable
                        className={`flex-row items-center p-4 rounded-lg ${hoverClass} ${includeDocument ? 'bg-gray-200' : 'bg-gray-100'}`}
                        onPress={() => setIncludeDocument(!includeDocument)}
                        disabled={!!loading}>
                        <Checkbox
                            value={includeDocument}
                            onValueChange={setIncludeDocument}
                            color={includeDocument ? colors.primary.DEFAULT : undefined}
                            className="mx-4"
                            disabled={!!loading}
                        />
                        <View className='flex flex-1'>
                            <Text className="flex-shrink-1 font-semibold pb-2">Include current summary?</Text>
                            <Text className="flex-shrink-1 font-light">The AI will start with your existing document rather than starting from scratch. You can add a prompt to guide how the AI should modify or enhance the current content.</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        className={`flex-row items-center mb-4 p-4 rounded-lg ${hoverClass} ${includeChat ? 'bg-gray-200' : 'bg-gray-100'}`}
                        onPress={() => setIncludeChat(!includeChat)}
                        disabled={!!loading}>
                        <Checkbox
                            value={includeChat}
                            onValueChange={setIncludeChat}
                            color={includeChat ? colors.primary.DEFAULT : undefined}
                            className="mx-4"
                            disabled={!!loading}
                        />
                        <View className='flex flex-1'>
                            <Text className="flex-shrink-1 font-semibold pb-2">Include chat</Text>
                            <Text className="flex-shrink-1 font-light">The AI will use the chat messages to update the document with new information.</Text>
                        </View>
                    </Pressable>
                </View>

                <View className="mb-4">
                    <Text className="mb-2 font-semibold">Custom Prompt (optional)</Text>
                    <TextInput
                        className="border rounded p-2 bg-background focus:border-primary focus:outline-primary"
                        value={customPrompt}
                        onChangeText={setCustomPrompt}
                        multiline
                        placeholder="E.g., Remove the part about xyz. Include sections Itemized Price, Dates, Third Party Providers."
                        placeholderTextColor="#aaa"
                        editable={!loading}
                    />
                </View>

                <View className="flex-row justify-end gap-2">
                    <Pressable
                        className="bg-primary px-4 py-2 rounded"
                        onPress={() => onSubmit({
                            preserveDocument: includeDocument,
                            includeChat: includeChat,
                            customPrompt: customPrompt
                        })}
                        disabled={!!loading}>
                        <Text className="text-white font-semibold">Generate</Text>
                    </Pressable>
                </View>
            </View>
        </Popup>
    );
}; 