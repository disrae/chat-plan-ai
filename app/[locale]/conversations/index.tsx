import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, SafeAreaView, Pressable, Platform, StatusBar } from 'react-native';
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons'; // For icons, you can replace these if needed
import { shadow } from '@/constants/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/dist/react';
import { Id } from '@/convex/_generated/dataModel';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import Fuse from 'fuse.js';
import { Language, useLocale } from '@/hooks/useLocale';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        welcome: 'Welcome',
        projectsDescription: "Here you'll find the projects that business owners have invited you to plan with them.",
        personalAccountNote: "Note: With a personal account, you can join conversations, but you can't create them.",
        myAccount: 'My Account',
        settings: 'Settings',
        logout: 'Log out',
        searchConversations: 'Search conversations...',
        noConversations: "Oh no! Looks like you don't have any conversations!",
        pushTokenError: 'Failed to get push token for push notification!',
        projectIdError: 'Project ID not found',
        pushTokenUpdateError: 'Failed to update user push token:'
    },
    'fr-ca': {
        welcome: 'Bienvenue',
        projectsDescription: 'Ici, vous trouverez les projets auxquels les propriétaires d\'entreprise vous ont invité à planifier.',
        personalAccountNote: 'Note : Avec un compte personnel, vous pouvez rejoindre des conversations, mais vous ne pouvez pas en créer.',
        myAccount: 'Mon compte',
        settings: 'Paramètres',
        logout: 'Déconnexion',
        searchConversations: 'Rechercher des conversations...',
        noConversations: 'Oh non! Il semble que vous n\'ayez aucune conversation!',
        pushTokenError: 'Impossible d\'obtenir le jeton pour les notifications push!',
        projectIdError: 'ID du projet non trouvé',
        pushTokenUpdateError: 'Échec de la mise à jour du jeton push:'
    },
    'es-mx': {
        welcome: 'Bienvenido',
        projectsDescription: 'Aquí encontrarás los proyectos a los que los propietarios de negocios te han invitado a planificar.',
        personalAccountNote: 'Nota: Con una cuenta personal, puedes unirte a conversaciones, pero no puedes crearlas.',
        myAccount: 'Mi cuenta',
        settings: 'Configuración',
        logout: 'Cerrar sesión',
        searchConversations: 'Buscar conversaciones...',
        noConversations: '¡Oh no! ¡Parece que no tienes conversaciones!',
        pushTokenError: '¡No se pudo obtener el token para notificaciones push!',
        projectIdError: 'ID del proyecto no encontrado',
        pushTokenUpdateError: 'Error al actualizar el token push:'
    },
    'ro-ro': {
        welcome: 'Bun venit',
        projectsDescription: 'Aici veți găsi proiectele la care proprietarii de afaceri v-au invitat să planificați împreună.',
        personalAccountNote: 'Notă: Cu un cont personal, puteți să vă alăturați conversațiilor, dar nu puteți să le creați.',
        myAccount: 'Contul meu',
        settings: 'Setări',
        logout: 'Deconectare',
        searchConversations: 'Căutați conversații...',
        noConversations: 'Oh nu! Se pare că nu aveți nicio conversație!',
        pushTokenError: 'Nu s-a putut obține token-ul pentru notificări push!',
        projectIdError: 'ID-ul proiectului nu a fost găsit',
        pushTokenUpdateError: 'Nu s-a putut actualiza token-ul push:'
    }
};

export type DashboardModals = {
    type: '' | 'addProject' | 'addConversation',
    payload?: { projectId?: Id<'projects'>; };
};

export default function Conversations() {
    const router = useRouter();
    const { company } = useLocalSearchParams();
    const { signOut } = useAuthActions();
    const dashboard = useQuery(api.users.getUserDashboardData);
    const user = useQuery(api.users.currentUser);
    const [modal, setModal] = useState<DashboardModals>({ type: '' });
    const updateUser = useMutation(api.users.updateUser);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredConversations, setFilteredConversations] = useState(dashboard?.conversations || []);
    const [popup, setPopup] = useState<{ type: 'settings' | ''; }>({ type: '' });
    const insets = useSafeAreaInsets();
    const { locale } = useLocale();
    const t = translations[locale] ?? translations['en-ca'];

    useEffect(() => {
        if (user === null) {
            router.replace('/');
        } else if (user && Platform.OS !== 'web') {
            registerForPushNotificationsAsync().then(token => updateUserPushToken(token));

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                // console.log(notification);
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                const conversationId = response.notification.request.content.data?.conversationId;
                if (conversationId) {
                    router.push(`/conversations/${conversationId}`);
                }
            });
        }

        return () => {
            if (Platform.OS !== 'web') {
                Notifications.removeNotificationSubscription(notificationListener.current!);
                Notifications.removeNotificationSubscription(responseListener.current!);
            }
        };
    }, [user]);

    useEffect(() => {
        if (dashboard?.conversations) {
            const fuse = new Fuse(dashboard.conversations, {
                keys: ['projectName', 'businessName', 'ownerName'],
                threshold: 0.3,
            });

            if (searchQuery) {
                const result = fuse.search(searchQuery);
                setFilteredConversations(result.map(item => item.item));
            } else {
                setFilteredConversations(dashboard.conversations);
            }
        }
    }, [searchQuery, dashboard?.conversations]);

    const updateUserPushToken = async (token: string | undefined) => {
        if (token) {
            try {
                await updateUser({ pushToken: token });
            } catch (error) {
                console.error(t.pushTokenUpdateError, error);
            }
        }
    };

    async function registerForPushNotificationsAsync() {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert(t.pushTokenError);
                return;
            }
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                alert(t.projectIdError);
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    }

    return (
        <View className="flex-1">
            <StatusBar barStyle="light-content" backgroundColor={colors.primary.dark} />
            <View className="bg-primary-dark" style={{ height: insets.top }} />
            <SafeAreaView className="flex-1">
                <View className="flex-1 bg-white">
                    <View className="px-4 py-4 bg-primary-dark">
                        <View className='flex-row justify-between items-start mb-4'>
                            <View className="flex-col flex-1 mr-2">
                                <Text className="text-3xl font-bold text-white">{t.welcome}, {user?.name}</Text>
                                <Text className="text-lg text-slate-200 mt-2">{t.projectsDescription}</Text>
                            </View>
                            {/* Settings Button */}
                            <Pressable
                                onPress={() => setPopup({ type: popup.type === 'settings' ? '' : 'settings' })}
                                style={[popup.type === 'settings' ? {} : shadow]}
                                className={`${popup.type === 'settings' ? 'bg-slate-200' : 'bg-slate-100'} shadow px-2 py-2 rounded-full`}
                            >
                                <AntDesign name="setting" size={24} color="black" />
                            </Pressable>
                        </View>
                        <Text className="text-sm text-slate-200 mt-1">{t.personalAccountNote}</Text>
                    </View>
                    {popup.type === 'settings' &&
                        <>
                            <Pressable
                                className="absolute -top-80 -left-80 -right-80 bottom-80 inset-0 z-10 "
                                style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                                onPress={() => setPopup({ type: '' })}
                            />
                            <View className='absolute right-8 top-10 bg-gray-50 rounded shadow z-20'>
                                <View className='p-3 border-b border-gray-400 rounded-t'>
                                    <Text className="font-bold text-lg">{t.myAccount}</Text>
                                </View>
                                <Pressable
                                    onPress={() => router.push('/conversations/settings')}
                                    className='flex-row items-center hover:bg-gray-100 p-3 border-b border-gray-300'
                                >
                                    <AntDesign name="setting" size={18} color="black" />
                                    <Text className="pl-3 text-base">{t.settings}</Text>
                                </Pressable>
                                <Pressable onPress={signOut} className='flex-row items-center hover:bg-gray-100 p-3'>
                                    <SimpleLineIcons name="logout" size={18} color="black" />
                                    <Text className="pl-3 text-base">{t.logout}</Text>
                                </Pressable>
                            </View>
                        </>
                    }
                    <ScrollView className="flex-1 px-4">
                        {/* Search Input */}
                        <TextInput
                            className="bg-white p-2 my-4 border rounded-lg"
                            placeholder={t.searchConversations}
                            inputMode='search'
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {/* Conversation List */}
                        <View className="space-y-4 pt-4">
                            {filteredConversations.length > 0 ? (
                                filteredConversations.map((conversation) => {
                                    if (!conversation) { return null; }
                                    return (
                                        <Pressable
                                            key={conversation?._id}
                                            className="flex-row items-center bg-slate-200 py-3 px-2 rounded-md shadow"
                                            onPress={() => {
                                                router.push(`/${locale}/conversations/${conversation?._id}`);
                                            }}
                                        >
                                            <AntDesign style={{ paddingRight: 8 }} name="message1" size={16} color={colors.primary.DEFAULT} />
                                            <View>
                                                <Text className="text-lg font-medium">{conversation?.projectName}</Text>
                                                <Text className="font-medium">{conversation?.businessName}</Text>
                                                <Text>{conversation?.ownerName}</Text>
                                            </View>
                                        </Pressable>
                                    );
                                })
                            ) : (
                                <Text className="text-2xl text-slate-400 text-center">{t.noConversations}</Text>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
};
