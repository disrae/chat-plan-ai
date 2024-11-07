import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Popup } from '../utils/Popup';
import ConversationModals from '@/app/[locale]/[company]/[project]/[conversationId]';
import { Language, useLocale } from '@/hooks/useLocale';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        linkCopied: 'Magic link copied to your clipboard!',
        secretLink: 'This is a secret link, anyone with this link can join your chat.',
        gotIt: 'Got it'
    },
    'fr-ca': {
        linkCopied: 'Lien magique copié dans votre presse-papiers !',
        secretLink: "C'est un lien secret, toute personne ayant ce lien peut rejoindre votre chat.",
        gotIt: 'Compris'
    },
    'es-mx': {
        linkCopied: '¡Enlace mágico copiado a su portapapeles!',
        secretLink: 'Este es un enlace secreto, cualquier persona con este enlace puede unirse a su chat.',
        gotIt: 'Entendido'
    },
    'ro-ro': {
        linkCopied: 'Link magic copiat în clipboard!',
        secretLink: 'Acesta este un link secret, oricine are acest link se poate alătura chatului.',
        gotIt: 'Am înțeles'
    }
};

type Props = {
    setModal: React.Dispatch<React.SetStateAction<ConversationModals>>;
    shareLink?: string;
};

export function ShareInfo({ setModal, shareLink }: Props) {
    const { locale } = useLocale();
    const t = translations[locale] ?? translations['en-ca'];

    if (!shareLink) { return null; }
    return (
        <Popup onClose={() => setModal({ type: '' })}>
            <ScrollView className="p-6 max-w-lg rounded-lg bg-white shadow-lg">
                <View className="">

                    {/* Header Section */}
                    <View className="mb-4">
                        <Text className="text-gray-600">{t.linkCopied}</Text>
                        <Text className="text-gray-600">{shareLink}</Text>
                    </View>

                    {/* Info Section */}
                    <View className="mb-4 gap-2">
                        <Text className="text-gray-900">{t.secretLink}</Text>
                    </View>

                    <View>
                        <Pressable className='bg-primary py-3 rounded-md' onPress={() => setModal({ type: '' })}>
                            <Text className="text-white text-center text-lg font-medium">{t.gotIt}</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </Popup>
    );
}
