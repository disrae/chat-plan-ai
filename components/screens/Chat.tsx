import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, StatusBar, SafeAreaView, ActivityIndicator, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, EvilIcons, FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ShareInfo } from '../popups/ShareInfo';
import { Popup } from '../utils/Popup';
import { colors } from '@/constants/Colors';
import { Language, useLocale } from '@/hooks/useLocale';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        generateSummary: 'Generate Summary',
        generating: 'Generating...',
        shareChat: 'Share Chat',
        summaryTitle: 'Generate Summary',
        summaryPrompt: 'Would you like to provide a prompt for the summary? (Optional)',
        summaryPlaceholder: 'E.g., Focus on project timeline and key deliverables...',
        cancel: 'Cancel',
        generate: 'Generate',
        typeMessage: 'Type a message'
    },
    'fr-ca': {
        generateSummary: 'Générer un résumé',
        generating: 'Génération...',
        shareChat: 'Partager la conversation',
        summaryTitle: 'Générer un résumé',
        summaryPrompt: 'Voulez-vous fournir des instructions pour le résumé? (Optionnel)',
        summaryPlaceholder: 'Ex: Se concentrer sur le calendrier du projet et les livrables clés...',
        cancel: 'Annuler',
        generate: 'Générer',
        typeMessage: 'Tapez un message'
    },
    'es-mx': {
        generateSummary: 'Generar resumen',
        generating: 'Generando...',
        shareChat: 'Compartir chat',
        summaryTitle: 'Generar resumen',
        summaryPrompt: '¿Desea proporcionar instrucciones para el resumen? (Opcional)',
        summaryPlaceholder: 'Ej: Centrarse en el cronograma del proyecto y los entregables clave...',
        cancel: 'Cancelar',
        generate: 'Generar',
        typeMessage: 'Escribe un mensaje'
    },
    'ro-ro': {
        generateSummary: 'Generează rezumat',
        generating: 'Se generează...',
        shareChat: 'Partajează conversația',
        summaryTitle: 'Generează rezumat',
        summaryPrompt: 'Doriți să oferiți instrucțiuni pentru rezumat? (Opțional)',
        summaryPlaceholder: 'Ex: Concentrați-vă pe cronologia proiectului și livrabilele cheie...',
        cancel: 'Anulează',
        generate: 'Generează',
        typeMessage: 'Scrie un mesaj'
    }
};

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
    const [modal, setModal] = useState<{
        type: 'share-info' | 'generate-summary' | '';
        payload?: {
            shareLink?: string;
            customerPrompt?: string;
        };
    }>({ type: '' });
    const flatListRef = useRef<FlatList>(null);
    const generateSummary = useAction(api.ai.generateSummary);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const router = useRouter();
    const { locale } = useLocale();
    const t = translations[locale] ?? translations['en-ca'];

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
            const url = `https://chatplanai.com/${locale}/jump-to/${conversation?.secret}`;
            await Clipboard.setStringAsync(url);
            setModal({ type: 'share-info', payload: { shareLink: url } });
        } catch (error) {
            console.error("Failed to copy URL: ", error);
        }
    };

    const handleGenerateSummary = async (customerPrompt?: string) => {
        setModal({ type: '' });
        setIsSummarizing(true);
        try {
            await generateSummary({
                conversationId,
                options: {
                    preserveDocument: false,
                    includeChat: true,
                    customPrompt: customerPrompt || undefined
                }
            });
            if (isBusinessOwner && conversation) {
                router.push(`/${conversation.businessName}/${conversation.projectName}/${conversationId}/summary`);
            } else {
                router.push(`/conversations/${conversationId}/summary`);
            }
        } catch (error) {
            console.error("Failed to generate summary:", error);
        } finally {
            setIsSummarizing(false);
            setModal({ type: '' });
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
                {modal.type === 'generate-summary' && (
                    <Popup onClose={() => setModal({ type: '' })}>
                        <View className="p-6">
                            <Text className="text-xl font-bold mb-4">{t.summaryTitle}</Text>
                            <Text className="text-gray-600 mb-4">
                                {t.summaryPrompt}
                            </Text>
                            <TextInput
                                className="border border-gray-300 rounded p-2 mb-4 min-h-[100px]"
                                multiline
                                placeholder={t.summaryPlaceholder}
                                placeholderTextColor="#aaa"
                                onChangeText={(text) => setModal(prev => ({
                                    ...prev,
                                    payload: { ...prev.payload, customerPrompt: text }
                                }))}
                                value={modal.payload?.customerPrompt}
                            />
                            <View className="flex-row justify-end gap-2">
                                <Pressable
                                    className="px-4 py-2 rounded"
                                    onPress={() => setModal({ type: '' })}>
                                    <Text>{t.cancel}</Text>
                                </Pressable>
                                <Pressable
                                    className="bg-primary px-4 py-2 rounded"
                                    onPress={() => handleGenerateSummary(modal.payload?.customerPrompt)}>
                                    <Text className="text-white">{t.generate}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Popup>
                )}
                <SafeAreaView className='flex-1'>
                    {/* Header */}
                    <View className='bg-primary-dark'>
                        <View className='flex-row justify-between items-center px-4'>
                            <Pressable onPress={onBackPress} className='' hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <AntDesign name="arrowleft" style={{ padding: 8 }} size={32} color="white" />
                            </Pressable>
                            <View className='flex-1 py-2 pb-4 pl-2'>
                                <Text className='text-slate-100 text-lg font-medium text-right'>
                                    {conversation.businessName}
                                </Text>
                                <Text className='text-slate-100 font-medium text-right'>
                                    {conversation.projectName}
                                </Text>
                                <Text className='text-slate-100 text-right pt-1'>
                                    {conversation.name}
                                </Text>
                                {isBusinessOwner && (
                                    <View className='flex-row items-center justify-end pt-4 bg-primary-dark'>
                                        <Pressable
                                            className='flex-row items-center px-2 bg-slate-200 py-2 mr-2 rounded'
                                            onPress={() => setModal({ type: 'generate-summary' })}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            <FontAwesome name="file-text-o" size={16} color="black" />
                                            <Text className='text font-medium text-right ml-1'>
                                                {isSummarizing ? t.generating : t.generateSummary}
                                            </Text>
                                        </Pressable>
                                        <View className='w-2' />
                                        <Pressable
                                            className='flex-row items-center px-2 bg-slate-200 py-2 rounded'
                                            onPress={copyToClipboard}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            <EvilIcons name="link" size={20} color="black" />
                                            <Text className='text font-medium text-right ml-1'>
                                                {t.shareChat}
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Messages */}
                    <View className="flex-1 bg-white">
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
                        {isSummarizing && (
                            <View className="absolute inset-0 justify-center items-center bg-white/50">
                                <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                            </View>
                        )}
                    </View>

                    {/* Input */}
                    <View className='bg-slate-50 px-2 py-2'>
                        <View className='flex-row items-center'>
                            <TextInput
                                className='flex-1 text-slate-800 border border-gray-400 rounded p-2 tracking-tighter focus:border-primary focus:outline-primary'
                                placeholder={t.typeMessage}
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
