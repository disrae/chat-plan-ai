import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Popup } from '../utils/Popup';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DashboardModals } from '@/app/[locale]/[company]';
import { Id } from '@/convex/_generated/dataModel';
import { Language, useLocale } from '@/hooks/useLocale';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        createConversation: 'Create New Conversation',
        name: 'Name',
        namePlaceholder: 'General Planning',
        businessError: "Uh oh! Couldn't find your business.",
        nameRequired: 'The conversation name is required',
        projectIdError: 'Contact the developer, no projectId found',
        create: 'Create'
    },
    'fr-ca': {
        createConversation: 'Créer une nouvelle conversation',
        name: 'Nom',
        namePlaceholder: 'Planification générale',
        businessError: "Oups! Impossible de trouver votre entreprise.",
        nameRequired: 'Le nom de la conversation est requis',
        projectIdError: 'Contactez le développeur, aucun projectId trouvé',
        create: 'Créer'
    },
    'es-mx': {
        createConversation: 'Crear nueva conversación',
        name: 'Nombre',
        namePlaceholder: 'Planificación general',
        businessError: "¡Ups! No pudimos encontrar su empresa.",
        nameRequired: 'El nombre de la conversación es requerido',
        projectIdError: 'Contacte al desarrollador, no se encontró projectId',
        create: 'Crear'
    },
    'ro-ro': {
        createConversation: 'Creează conversație nouă',
        name: 'Nume',
        namePlaceholder: 'Planificare generală',
        businessError: "Ups! Nu am putut găsi compania dvs.",
        nameRequired: 'Numele conversației este obligatoriu',
        projectIdError: 'Contactați dezvoltatorul, nu s-a găsit projectId',
        create: 'Creează'
    }
};

type Props = {
    setModal: React.Dispatch<React.SetStateAction<DashboardModals>>;
    projectId?: Id<'projects'>;
};

export function AddConversation({ setModal, projectId }: Props) {
    const [loading, setLoading] = useState<'creating-conversation' | ''>('');
    const [name, setName] = useState('');
    const [emails, setEmails] = useState<string>();
    const [error, setError] = useState('');
    const addConversation = useMutation(api.conversations.addConversation);
    const dashboard = useQuery(api.users.getUserDashboardData);
    const { locale } = useLocale();
    const t = translations[locale] ?? translations['en-ca'];

    const updateError = (error: string) => {
        setError(error);
        setTimeout(() => setError(''), 8000);
    };

    return (
        <Popup onClose={() => setModal({ type: '' })}>
            <ScrollView className="p-6 max-w-lg rounded-lg bg-white shadow-lg">
                <View className="">

                    {/* Header Section */}
                    <View className="mb-4">
                        <Text className="text-2xl font-bold">{t.createConversation}</Text>
                    </View>

                    {/* Name Input */}
                    <View className="">
                        <Text className="font-semibold text-gray-800 ">{t.name}</Text>
                        <View className='h-2' />
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-md p-3 text-gray-800 focus:border-primary focus:outline-primary"
                            placeholder={t.namePlaceholder}
                            value={name}
                            onChangeText={setName}
                        />
                        <View className='h-4' />
                    </View>

                    {error && <View className='h-12 justify-center items-center'>
                        <Text className="text-red-500 text-center">{JSON.stringify(error, null, 2)}</Text>
                    </View>}

                    {/* Submit Button */}
                    <Pressable
                        className={`bg-primary py-3 rounded-md `}
                        onPress={async () => {
                            if (loading) { return; }
                            if (!dashboard?.businesses?.[0]?._id) {
                                updateError(t.businessError);
                                return;
                            }
                            setLoading('creating-conversation');
                            try {
                                if (!name) { throw new Error(t.nameRequired); }
                                if (!projectId) { throw new Error(t.projectIdError); }
                                await addConversation({ name, projectId, business: dashboard.businesses[0]._id });
                                setModal({ type: '' });
                            } catch (error: any) {
                                console.error(error);
                                updateError(error.message);
                            } finally {
                                setLoading('');
                            }
                        }}
                        disabled={!!loading}
                    >
                        {loading ? (
                            <ActivityIndicator style={{ height: 28 }} color="#fff" />
                        ) : (
                            <Text className="text-white text-center text-lg font-medium">{t.create}</Text>
                        )}
                    </Pressable>

                </View>
            </ScrollView>
        </Popup>
    );
}
