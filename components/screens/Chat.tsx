import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, StatusBar, SafeAreaView, ActivityIndicator, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, EvilIcons, FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useQuery, useMutation, Id, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ShareInfo } from '../popups/ShareInfo';

type ChatScreenProps = {
    conversationId: Id<'conversations'>;
    isBusinessOwner: boolean;
    onBackPress: () => void;
};

export function ChatScreen({ conversationId, isBusinessOwner, onBackPress }: ChatScreenProps) {
    const [newMessage, setNewMessage] = useState('');
    const user = useQuery(api.users.currentUser);
    const conversation = useQuery(api.conversations.getConversationById, { conversationId });
    const isOwner = useQuery(api.conversations.isOwner, { conversationId });
    const messages = useQuery(api.messages.list, { conversationId });
    const send = useMutation(api.messages.send);
    const [loading, setLoading] = useState<'sending' | ''>('');
    const [modal, setModal] = useState<{ type: 'share-info' | ''; payload?: { shareLink: string; }; }>({ type: '' });
    const flatListRef = useRef<FlatList>(null);
    const generateSummary = useAction(api.openai.generateSummary);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        if (flatListRef.current && messages) {
            flatListRef.current.scrollToEnd({ animated: false });
        }
    }, [messages]);

    const sendMessage = async () => {
        try {
            setLoading('sending');
            if (newMessage.trim() && conversationId.trim()) {
                await send({
                    name: user?.name || 'anonymous',
                    body: newMessage,
                    conversationId
                });
                setNewMessage('');
                if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading('');
        }
    };

    const copyToClipboard = async () => {
        try {
            const url = `https://chatplanai.com/jump-to/${conversation?.secret}`;
            await Clipboard.setStringAsync(url);
            setModal({ type: 'share-info', payload: { shareLink: url } });
        } catch (error) {
            console.error("Failed to copy URL: ", error);
        }
    };


    const handleGenerateSummary = async () => {
        console.log('generating summary');
        setIsSummarizing(true);
        try {
            await generateSummary({ conversationId });
        } catch (error) {
            console.error("Failed to generate summary:", error);
        } finally {
            setIsSummarizing(false);
        }
    };

    if (!conversation) { return null; }

    return (
        <View className='flex-1 bg-primary-dark'>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                className='flex-1 justify-between'
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {modal.type === 'share-info' && <ShareInfo setModal={setModal} shareLink={modal.payload?.shareLink} />}
                <SafeAreaView className='flex-1'>
                    {/* Header */}
                    <View className='bg-primary-dark'>
                        <View className='flex-row justify-between items-center px-4'>
                            <Pressable onPress={onBackPress} className='' hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <AntDesign name="arrowleft" size={24} color="white" />
                            </Pressable>
                            <View className='flex-1 py-2 pl-2'>
                                <Text className='text-slate-100 text-lg font-medium text-right'>
                                    {conversation.businessName}
                                </Text>
                                <Text className='text-slate-100 font-medium text-right'>
                                    {conversation.projectName}
                                </Text>
                                <Text className='text-slate-100 text-right pt-1'>
                                    {conversation.name}
                                </Text>
                            </View>
                        </View>
                        {isBusinessOwner && (
                            <View className='flex-row items-center justify-end pb-4 bg-primary-dark'>
                                <Pressable
                                    className='flex-row items-center px-2 bg-slate-200 py-2 mr-2 rounded'
                                    onPress={handleGenerateSummary}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <FontAwesome name="file-text-o" size={16} color="black" />
                                    <Text className='text font-medium text-right ml-1'>
                                        {isSummarizing ? 'Generating...' : 'Generate Summary'}
                                    </Text>
                                </Pressable>
                                <View className='w-2' />
                                <Pressable
                                    className='flex-row items-center px-2 bg-slate-200 py-2 mr-4 rounded'
                                    onPress={copyToClipboard}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <EvilIcons name="link" size={20} color="black" />
                                    <Text className='text font-medium text-right ml-1'>
                                        Share Chat
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Messages */}
                    <FlatList
                        ref={flatListRef}
                        className='bg-white px-4'
                        data={messages ?? []}
                        contentContainerStyle={{ marginBottom: 20 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        renderItem={({ item }) => {
                            const isAuthor = item?.author === user?._id;
                            return (
                                <View className={`flex-row my-1 ${isAuthor ? 'justify-end' : 'justify-start'}`}>
                                    <View className={`max-w-[75%] p-2 rounded-lg shadow-sm ${isAuthor ? 'bg-primary rounded-br-none' : 'bg-slate-600 border-gray-300 rounded-bl-none'}`}>
                                        {!isAuthor && <Text className='text-white text-[8px]'>{item?.name}</Text>}
                                        <Text className='text-gray-50'>{item?.body}</Text>
                                    </View>
                                </View>
                            );
                        }}
                        keyExtractor={(item) => item._id}
                    />

                    {/* Input */}
                    <View className='bg-slate-50 px-2 py-2'>
                        <View className='flex-row items-center'>
                            <TextInput
                                className='flex-1 text-slate-800 border border-gray-400 rounded p-2 tracking-tighter'
                                placeholder="Type a message"
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline={true}
                                style={{ minHeight: 40, maxHeight: 160, height: 'auto' }}
                                textAlignVertical="top"
                            />
                            <Pressable
                                className='rounded-full p-3 bg-primary ml-2'
                                onPress={sendMessage}
                                disabled={!!loading}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                {loading ? (
                                    <ActivityIndicator style={{ height: 12, width: 12 }} color={'white'} />
                                ) : (
                                    <FontAwesome name="send" size={12} color={'white'} />
                                )}
                            </Pressable>
                        </View>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </View>
    );
}
