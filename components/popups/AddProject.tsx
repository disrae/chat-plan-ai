import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Popup } from '../utils/Popup';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DashboardModals } from '@/app/[locale]/[company]';
import { Language, useLocale } from '@/hooks/useLocale';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        createProject: 'Create New Project',
        enterDetails: 'Enter the details of your new project',
        name: 'Name',
        projectName: 'Project name',
        businessError: "Uh oh! Couldn't find your business.",
        genericError: 'Something went wrong.',
        create: 'Create Project'
    },
    'fr-ca': {
        createProject: 'Créer un nouveau projet',
        enterDetails: 'Entrez les détails de votre nouveau projet',
        name: 'Nom',
        projectName: 'Nom du projet',
        businessError: "Oups! Impossible de trouver votre entreprise.",
        genericError: "Une erreur s'est produite.",
        create: 'Créer le projet'
    },
    'es-mx': {
        createProject: 'Crear nuevo proyecto',
        enterDetails: 'Ingrese los detalles de su nuevo proyecto',
        name: 'Nombre',
        projectName: 'Nombre del proyecto',
        businessError: "¡Ups! No pudimos encontrar su empresa.",
        genericError: 'Algo salió mal.',
        create: 'Crear proyecto'
    },
    'ro-ro': {
        createProject: 'Creează proiect nou',
        enterDetails: 'Introduceți detaliile noului proiect',
        name: 'Nume',
        projectName: 'Numele proiectului',
        businessError: "Ups! Nu am putut găsi compania dvs.",
        genericError: 'Ceva nu a mers bine.',
        create: 'Creează proiect'
    }
};

type Props = {
    setModal: React.Dispatch<React.SetStateAction<DashboardModals>>;
};

export function AddProject({ setModal }: Props) {
    const [loading, setLoading] = useState<'creating-project' | ''>('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const addProject = useMutation(api.projects.addProject);
    const dashboard = useQuery(api.users.getUserDashboardData);
    const { locale } = useLocale();
    const t = translations[locale] ?? translations['en-ca'];

    const updateError = (error: string) => {
        setError(error);
        setTimeout(() => setError(''), 10000);
    };

    return (
        <Popup onClose={() => setModal({ type: '' })}>
            <ScrollView className="p-6 max-w-lg rounded-lg bg-white shadow-lg">
                <View className="">

                    {/* Header Section */}
                    <View className="mb-4">
                        <Text className="text-2xl font-bold">{t.createProject}</Text>
                        <View className='h-2' />
                        <Text className="text-gray-600">{t.enterDetails}</Text>
                    </View>

                    {/* Name Input */}
                    <View className="mb-4">
                        <Text className="font-semibold text-gray-800 ">{t.name}</Text>
                        <View className='h-2' />
                        <TextInput
                            className="flex-1 border border-gray-300 rounded-md p-3 text-gray-800 focus:border-primary focus:outline-primary"
                            placeholder={t.projectName}
                            value={name}
                            onChangeText={setName}
                        />
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
                            setLoading('creating-project');
                            try {
                                const project = await addProject({ name, businessId: dashboard.businesses[0]._id });
                                setModal({ type: '' });
                            } catch (error) {
                                console.error(error);
                                updateError(t.genericError);
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
