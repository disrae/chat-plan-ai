import { Header } from '@/components/navigation/Header';
import { colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import { useStore } from '@/hooks/useStore';
import { AntDesign } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, SafeAreaView, ScrollView, Pressable, ActivityIndicator, StatusBar } from 'react-native';
import { Language, useLocale } from '@/hooks/useLocale';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        accountSettings: 'Account Settings',
        profile: 'Profile',
        projects: 'Projects',
        notifications: 'Notifications',
        profileInfo: 'Profile Information',
        updateDetails: 'Update your account details here.',
        name: 'Name',
        company: 'Company',
        email: 'Email',
        fetchingUser: 'Fetching user...',
        updateProfile: 'Update Profile',
        notifPreferences: 'Manage your notifications preferences here.',
        profileUpdated: 'Profile updated successfully!',
        projectsInfo: 'Projects Information',
        manageProjects: 'Manage your projects here.'
    },
    'fr-ca': {
        accountSettings: 'Paramètres du compte',
        profile: 'Profil',
        projects: 'Projets',
        notifications: 'Notifications',
        profileInfo: 'Informations du profil',
        updateDetails: 'Mettez à jour vos informations ici.',
        name: 'Nom',
        company: 'Entreprise',
        email: 'Courriel',
        fetchingUser: 'Chargement...',
        updateProfile: 'Mettre à jour',
        notifPreferences: 'Gérez vos préférences de notifications ici.',
        profileUpdated: 'Profil mis à jour avec succès!',
        projectsInfo: 'Informations des projets',
        manageProjects: 'Gérez vos projets ici.'
    },
    'es-mx': {
        accountSettings: 'Configuración de la cuenta',
        profile: 'Perfil',
        projects: 'Proyectos',
        notifications: 'Notificaciones',
        profileInfo: 'Información del perfil',
        updateDetails: 'Actualice sus datos aquí.',
        name: 'Nombre',
        company: 'Empresa',
        email: 'Correo',
        fetchingUser: 'Cargando usuario...',
        updateProfile: 'Actualizar perfil',
        notifPreferences: 'Administre sus preferencias de notificaciones aquí.',
        profileUpdated: '¡Perfil actualizado exitosamente!',
        projectsInfo: 'Información de proyectos',
        manageProjects: 'Administre sus proyectos aquí.'
    },
    'ro-ro': {
        accountSettings: 'Setări cont',
        profile: 'Profil',
        projects: 'Proiecte',
        notifications: 'Notificări',
        profileInfo: 'Informații profil',
        updateDetails: 'Actualizați detaliile contului aici.',
        name: 'Nume',
        company: 'Companie',
        email: 'Email',
        fetchingUser: 'Se încarcă utilizatorul...',
        updateProfile: 'Actualizare profil',
        notifPreferences: 'Gestionați preferințele de notificări aici.',
        profileUpdated: 'Profil actualizat cu succes!',
        projectsInfo: 'Informații proiecte',
        manageProjects: 'Gestionați proiectele aici.'
    }
};

export default function AccountSettings() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
    const user = useQuery(api.users.currentUser);
    const [tab, setTab] = useState<'profile' | 'projects' | 'notifications'>('profile');
    const [isUpdating, setIsUpdating] = useState(false);
    const dashboard = useQuery(api.users.getUserDashboardData);
    const business = dashboard?.businesses?.[0];
    const { successMessage, errorMessage, setSuccessMessage, setErrorMessage, clearMessages } = useStore();
    const updateUser = useMutation(api.users.updateUser);
    let timer: NodeJS.Timeout | null = null;
    const { locale } = useLocale();
    const t = translations[locale] ?? translations['en-ca'];

    console.log(JSON.stringify(business, null, 2));
    const handleBack = () => {
        if (!user) return;
        if (router.canGoBack()) return router.back();
        if (user.accountType === 'personal') return router.replace('/conversations');
        if (user.accountType === 'business') return router.replace(`/${user.businessName}`);
    };

    useEffect(() => {
        if (user === null) router.replace('/');
        if (!user) return;
        setEmail(user.email || '');
        setBusinessName(user.businessName || '');
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
        if (!user) return;
        setIsUpdating(true);
        try {
            const result = await updateUser({ name, businessName });
            if (result.success) {
                setSuccessMessage('Profile updated successfully!');
                if (user.businessName !== businessName) {
                    router.push(`/${businessName}/settings`);
                }
            }
        } catch (error: any) {
            console.log(error);
            console.error('Failed to update user:', error);
            setErrorMessage(error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View className='flex-1 bg-primary-dark'>
            <View className='bg-primary-dark'>
                <SafeAreaView className='bg-primary-dark'>
                    {/* Header */}
                    <View className='flex-row justify-between items-center'>
                        <Pressable onPress={handleBack}
                            className='left-4 p-2'
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                            <AntDesign name="arrowleft" size={32} color="white" />
                        </Pressable>
                        <Text className="text-2xl font-medium text-white text-center flex-1">{t.accountSettings}</Text>
                        <View className='right-4 w-8' />
                    </View>
                </SafeAreaView>
            </View>
            <SafeAreaView className='flex-1 items-center bg-gray-50'>
                <ScrollView className='w-full max-w-2xl px-'>
                    {/* Tabs */}
                    <View className="flex-row">
                        {['profile', 'projects', 'notifications'].map((tabName, index) => (
                            <Pressable
                                key={tabName}
                                className={`py-4 px-6 ${index === 0 ? 'rounded-tl-lg' : index === 2 ? 'rounded-tr-lg' : ''} 
                                ${tab === tabName ? 'bg-white border-t border-l border-r border-gray-200 border-b-0' : 'bg-gray-100 border-b border-gray-200'}
                                hover:bg-opacity-90 active:bg-opacity-80 transition-all duration-200
                                ${tab !== tabName && 'hover:bg-gray-200'}`}
                                onPress={() => setTab(tabName as 'profile' | 'projects' | 'notifications')}
                            >
                                <View className="flex-row items-center space-x-2">
                                    {tabName === 'profile' && <AntDesign name="user" size={16} color={tab === tabName ? '#000' : '#6B7280'} />}
                                    {tabName === 'projects' && <AntDesign name="folder1" size={16} color={tab === tabName ? '#000' : '#6B7280'} />}
                                    {tabName === 'notifications' && <AntDesign name="bells" size={16} color={tab === tabName ? '#000' : '#6B7280'} />}
                                    <Text
                                        className={`${tab === tabName ? 'text-black' : 'text-gray-500'} font-bold text-base
                                        group-hover:opacity-90 transition-opacity duration-200`}>
                                        {t[tabName]}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>

                    {/* Profile */}
                    {tab === 'profile' &&
                        <View className="bg-white rounded-b-lg rounded-tr-lg p-4 border-gray-200 border-l border-r border-b">
                            {/* Section Title */}
                            <Text className="text-lg font-bold mb-2">{t.profileInfo}</Text>
                            <Text className="text-sm text-gray-600 mb-4">{t.updateDetails}</Text>
                            {!user && <View className='flex-1 py-1 items-center justify-center animate-pulse'>
                                <Text className='text-base font-bold text-center'>{t.fetchingUser}</Text>
                            </View>}

                            {/* Input Fields */}
                            <Text>{t.name}</Text>
                            <TextInput
                                className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-white"
                                value={name}
                                onChangeText={setName}
                                placeholder="Name"
                            />
                            <Text>{t.company}</Text>
                            <TextInput
                                className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-white"
                                value={businessName}
                                onChangeText={setBusinessName}
                                placeholder="Company"
                            />
                            <Text>{t.email}</Text>
                            <TextInput
                                className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-gray-100"
                                value={email}
                                editable={false}
                                placeholder="Email"
                            />
                        </View>}

                    {/* Projects */}
                    {tab === 'projects' &&
                        <View className="bg-white rounded-b-lg rounded-tr-lg p-4 border-gray-200 border-l border-r border-b">
                            {/* Section Title */}
                            <Text className="text-lg font-bold mb-2">{t.projectsInfo}</Text>
                            <Text className="text-sm text-gray-600 mb-4">{t.manageProjects}</Text>
                        </View>}

                    {/* Notifications */}
                    {tab === 'notifications' &&
                        <View className="bg-white rounded-b-lg p-4 border-gray-200 border-l border-r border-b">
                            {/* Section Title */}
                            <Text className="text-lg font-bold mb-2">{t.notifications}</Text>
                            <Text className="text-sm text-gray-600 mb-4">{t.notifPreferences}</Text>
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
