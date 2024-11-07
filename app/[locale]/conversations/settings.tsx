import { Header } from '@/components/navigation/Header';
import { colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import { useLocale, Language } from '@/hooks/useLocale';
import { useStore } from '@/hooks/useStore';
import { AntDesign } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, SafeAreaView, ScrollView, Pressable, ActivityIndicator, StatusBar } from 'react-native';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        accountSettings: 'Account Settings',
        profile: 'Profile',
        notifications: 'Notifications',
        profileInformation: 'Profile Information',
        updateAccountDetails: 'Update your account details here.',
        fetchingUser: 'Fetching user...',
        name: 'Name',
        email: 'Email',
        notificationsPreferences: 'Manage your notifications preferences here.',
        updateProfile: 'Update Profile',
        profileUpdateSuccess: 'Profile updated successfully!',
        profileUpdateError: 'Failed to update profile. Please try again.'
    },
    'fr-ca': {
        accountSettings: 'Paramètres du compte',
        profile: 'Profil',
        notifications: 'Notifications',
        profileInformation: 'Informations du profil',
        updateAccountDetails: 'Mettez à jour vos informations ici.',
        fetchingUser: 'Chargement du profil...',
        name: 'Nom',
        email: 'Courriel',
        notificationsPreferences: 'Gérez vos préférences de notifications ici.',
        updateProfile: 'Mettre à jour le profil',
        profileUpdateSuccess: 'Profil mis à jour avec succès!',
        profileUpdateError: 'Échec de la mise à jour du profil. Veuillez réessayer.'
    },
    'es-mx': {
        accountSettings: 'Configuración de la cuenta',
        profile: 'Perfil',
        notifications: 'Notificaciones',
        profileInformation: 'Información del perfil',
        updateAccountDetails: 'Actualice sus datos aquí.',
        fetchingUser: 'Cargando usuario...',
        name: 'Nombre',
        email: 'Correo electrónico',
        notificationsPreferences: 'Administre sus preferencias de notificaciones aquí.',
        updateProfile: 'Actualizar perfil',
        profileUpdateSuccess: '¡Perfil actualizado exitosamente!',
        profileUpdateError: 'Error al actualizar el perfil. Por favor intente de nuevo.'
    },
    'ro-ro': {
        accountSettings: 'Setări cont',
        profile: 'Profil',
        notifications: 'Notificări',
        profileInformation: 'Informații profil',
        updateAccountDetails: 'Actualizați-vă detaliile contului aici.',
        fetchingUser: 'Se încarcă utilizatorul...',
        name: 'Nume',
        email: 'Email',
        notificationsPreferences: 'Gestionați preferințele de notificări aici.',
        updateProfile: 'Actualizare profil',
        profileUpdateSuccess: 'Profil actualizat cu succes!',
        profileUpdateError: 'Actualizarea profilului a eșuat. Vă rugăm să încercați din nou.'
    }
};

export default function AccountSettings() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const user = useQuery(api.users.currentUser);
    const [tab, setTab] = useState<'profile' | 'notifications'>('profile');
    const [isUpdating, setIsUpdating] = useState(false);
    const { successMessage, errorMessage, setSuccessMessage, setErrorMessage, clearMessages } = useStore();
    const updateUser = useMutation(api.users.updateUser);
    const { locale } = useLocale();
    const t = translations[locale] ?? translations['en-ca'];
    let timer: NodeJS.Timeout | null = null;

    const handleBack = () => {
        if (!user) return;
        if (router.canGoBack()) return router.back();
        router.replace(`/${locale}/conversations`);
    };

    useEffect(() => {
        if (user === null) router.replace('/');
        if (!user) return;
        setEmail(user.email || '');
        setName(user.name || '');
    }, [user]);

    useEffect(() => {
        if (successMessage || errorMessage) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                clearMessages();
            }, 4000);
            return () => {
                if (timer) clearTimeout(timer);
            };
        }
    }, [successMessage, errorMessage, clearMessages]);

    const handleUpdateProfile = async () => {
        console.log('triggered');
        if (!user) return;
        setIsUpdating(true);
        try {
            const result = await updateUser({ name });
            if (result.success) {
                setSuccessMessage(t.profileUpdateSuccess);
            }
        } catch (error: any) {
            console.log(error);
            console.error('Failed to update user:', error);
            setErrorMessage(error.message || t.profileUpdateError);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View className='flex-1'>
            <StatusBar barStyle="light-content" />
            <SafeAreaView className='bg-primary-dark'>
                {/* Header */}
                <View className='flex-row justify-between items-center'>
                    <Pressable onPress={handleBack}
                        className='left-4 p-2'
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                        <AntDesign name="arrowleft" size={36} color="white" />
                    </Pressable>
                    <Text className="text-2xl font-medium text-white text-center flex-1">{t.accountSettings}</Text>
                    <View className='right-4 w-8' />
                </View>
            </SafeAreaView>
            <SafeAreaView className='flex-1 items-center bg-gray-50'>
                <ScrollView className='w-full max-w-2xl px-'>
                    {/* Tabs */}
                    <View className="flex-row">
                        <Pressable
                            className={`py-4 px-4 rounded-tl-lg ${tab === 'profile' ? 'bg-white' : 'bg-gray-200'}`}
                            onPress={() => setTab('profile')}
                        >
                            <Text
                                className={`${tab === 'profile' ? 'text-black' : 'text-gray-500'} font-bold text-base`}>
                                {t.profile}
                            </Text>
                        </Pressable>
                        <Pressable
                            className={`py-4 px-4 rounded-tr-lg ${tab === 'notifications' ? 'bg-white' : 'bg-gray-200'}`}
                            onPress={() => setTab('notifications')}
                        >
                            <Text className={`${tab === 'notifications' ? 'text-black' : 'text-gray-500'} font-bold text-base`}>
                                {t.notifications}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Profile */}
                    {tab === 'profile' &&
                        <View className="bg-white rounded-lg rounded-tl-none p-4 ">
                            {/* Section Title */}
                            <Text className="text-lg font-bold mb-2">{t.profileInformation}</Text>
                            <Text className="text-sm text-gray-600 mb-4">{t.updateAccountDetails}</Text>
                            {!user && <View className='flex-1 py-1 items-center justify-center animate-pulse'>
                                <Text className='text-base font-bold text-center'>{t.fetchingUser}</Text>
                            </View>}

                            {/* Input Fields */}
                            <Text>{t.name}</Text>
                            <TextInput
                                className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-white"
                                value={name}
                                onChangeText={setName}
                                placeholder={t.name}
                            />
                            <Text>{t.email}</Text>
                            <TextInput
                                className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-gray-100"
                                value={email}
                                editable={false}
                                placeholder={t.email}
                            />
                        </View>}
                    {/* Notifications */}
                    {tab === 'notifications' &&
                        <View className="bg-white rounded-lg p-4 ">
                            {/* Section Title */}
                            <Text className="text-lg font-bold mb-2">{t.notifications}</Text>
                            <Text className="text-sm text-gray-600 mb-4">{t.notificationsPreferences}</Text>
                        </View>}

                    {/* Success Message */}
                    <View className="h-12 justify-center items-center">
                        {!!successMessage && (
                            <Text className="text-center text-green-700">
                                {successMessage}
                            </Text>
                        )}
                        {!!errorMessage && (
                            <Text className="text-center text-red-500">
                                {errorMessage}
                            </Text>
                        )}
                    </View>

                    {/* Update Button */}
                    <Pressable
                        className={`bg-primary py-3 rounded-md items-center mx-4 ${isUpdating ? 'opacity-50' : ''}`}
                        onPress={handleUpdateProfile}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-base font-bold">{t.updateProfile}</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};
