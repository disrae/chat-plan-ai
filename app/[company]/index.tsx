import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, SafeAreaView, Pressable, Platform, Button, AppState, StatusBar } from 'react-native';
import { AntDesign, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { shadow } from '@/constants/styles';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/dist/react';
import { AddProject } from '@/components/popups/AddProject';
import { Id } from '@/convex/_generated/dataModel';
import { AddConversation } from '@/components/popups/AddConversation';
import Fuse from 'fuse.js';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

async function sendPushNotification(expoPushToken: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Danny',
        body: 'Yeah, 49 people is fine',
        data: { someData: 'some Data goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}
function handleRegistrationError(errorMessage: string) {
    return;
}

export type DashboardModals = {
    type: '' | 'addProject' | 'addConversation',
    payload?: { projectId?: Id<'projects'>; };
};
export default function CompanyDashboard() {
    const router = useRouter();
    const { company } = useLocalSearchParams();
    const { signOut } = useAuthActions();
    const dashboard = useQuery(api.users.getUserDashboardData);
    const user = useQuery(api.users.currentUser);
    const business = dashboard?.businesses?.[0];
    const [expandedProjects, setExpandedProjects] = useState<Array<Id<'projects'>>>([]);
    const [modal, setModal] = useState<DashboardModals>({ type: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProjects, setFilteredProjects] = useState(business?.projects || []);
    const [popup, setPopup] = useState<{ type: 'settings' | ''; }>({ type: '' });
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const updateUser = useMutation(api.users.updateUser);
    const fuse = new Fuse(business?.projects || [], { keys: ['name'], threshold: 0.3 });
    const insets = useSafeAreaInsets();

    async function registerForPushNotificationsAsync() {
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                handleRegistrationError('Permission not granted to get push token for push notification!');
                return;
            }
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                handleRegistrationError('Project ID not found');
            }
            try {
                const pushTokenString = (
                    await Notifications.getExpoPushTokenAsync({ projectId })
                ).data;
                return pushTokenString;
            } catch (e: unknown) {
                handleRegistrationError(`${e}`);
            }
        } else {
            return;
        }
    }

    useEffect(() => {
        if (Platform.OS !== 'web') {
            registerForPushNotificationsAsync()
                .then(token => {
                    if (token) {
                        updateUser({ pushToken: token })
                            .catch(error => console.error('Failed to update user push token:', error));
                    }
                })
                .catch((error: any) => {
                    console.error('Failed to get push token:', error);
                });

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                return;
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                const data = response.notification.request.content.data;
                if (data.conversationId) {
                    if (user?.accountType === 'business' && data.businessName && data.projectName) {
                        router.push(`/${data.businessName}/${data.projectName}/${data.conversationId}`);
                    } else {
                        router.push(`/conversations/${data.conversationId}`);
                    }
                }
            });

            return () => {
                notificationListener.current &&
                    Notifications.removeNotificationSubscription(notificationListener.current);
                responseListener.current &&
                    Notifications.removeNotificationSubscription(responseListener.current);
            };
        }
    }, [user]);

    useEffect(() => {
        if (dashboard?.user.accountType === 'personal') { router.replace('/conversations'); }
        if (user === null) { router.replace('/'); }
    }, [dashboard?.user, user]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const results = fuse.search(searchQuery);
            setFilteredProjects(results.map(result => result.item));
        } else {
            setFilteredProjects(business?.projects || []);
        }
    }, [searchQuery, business?.projects]);

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data.conversationId) {
                if (user?.accountType === 'business' && data.businessName && data.projectName) {
                    router.push(`/${data.businessName}/${data.projectName}/${data.conversationId}`);
                } else {
                    router.push(`/conversations/${data.conversationId}`);
                }
            }
        });

        return () => subscription.remove();
    }, [user]);

    const toggleProject = (projectId: Id<'projects'>) => {
        setExpandedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const renderProject = ({ item: project }) => {
        if (!project) return null;

        const isSelected = expandedProjects.includes(project._id);
        return (
            <View
                className={`border ${!isSelected ? 'border-primary bg-white shadow' : ""} rounded-lg p-2 py-2 my-2`}
                style={[!isSelected ? shadow : {}]}
            >
                <Pressable
                    className="flex-row items-center"
                    onPress={() => toggleProject(project._id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <FontAwesome
                        name={isSelected ? "chevron-down" : "chevron-right"}
                        size={16} style={{ paddingRight: 8 }} color={!isSelected ? colors.primary.DEFAULT : 'gray'}
                    />
                    <View className=''>
                        <Text className="text-sm font-medium">{project.name}</Text>
                    </View>
                </Pressable>

                {isSelected && (
                    <View className="pl-0 mt-2 space-y-4">
                        {/* Conversations List */}
                        {project.conversations.map((conversation) => {
                            if (!conversation) return null;
                            return (
                                <Pressable
                                    key={conversation?._id}
                                    className="flex-row items-center bg-slate-200 py-3 px-2 rounded-md shadow"
                                    onPress={() => {
                                        router.push(`/${company}/${project.name}/${conversation?._id}`);
                                    }}
                                >
                                    <AntDesign style={{ paddingRight: 8 }} name="message1" size={16} color={colors.primary.DEFAULT} />
                                    <Text className="text-xs">{conversation?.name}</Text>
                                </Pressable>
                            );
                        })}
                        <Pressable
                            onPress={() => setModal({ type: 'addConversation', payload: { projectId: project._id } })}
                            className="flex-row items-center bg-primary py-2 px-2 rounded-md shadow mt-2"
                        >
                            <Text className='text text-white'>+ New Conversation</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1">
            <StatusBar barStyle="light-content" backgroundColor={colors.primary.dark} />
            <View className="bg-primary-dark" style={{ height: insets.top }} />
            {modal.type === 'addProject' && <AddProject setModal={setModal} />}
            {modal.type === 'addConversation' && <AddConversation setModal={setModal} projectId={modal.payload?.projectId} />}
            <SafeAreaView className="flex-1" >
                <View className="flex-1 bg-white">
                    <View className="px-4 py-4 bg-primary-dark">
                        <View className='flex-row justify-between items-center mb-4 gap-4'>
                            <Text className="text-3xl font-bold text-white flex-shrink">{company}</Text>
                            <Pressable
                                onPress={() => setPopup({ type: popup.type === 'settings' ? '' : 'settings' })}
                                style={[popup.type === 'settings' ? {} : shadow]}
                                className={`${popup.type === 'settings' ? 'bg-slate-200' : 'bg-slate-100'} shadow px-2 py-2 rounded-full flex-shrink-0`}
                            >
                                <AntDesign name="setting" size={24} color="black" />
                            </Pressable>
                        </View>
                        <Text className="text-xl font-semibold text-white mt-2">Projects & Conversations</Text>
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
                                    <Text className="font-bold text-lg">My Account</Text>
                                </View>
                                <Pressable
                                    onPress={() => router.push(`/${company}/settings`)}
                                    className='flex-row items-center hover:bg-gray-100 p-3 border-b border-gray-300'
                                >
                                    <AntDesign name="setting" size={18} color="black" />
                                    <Text className="pl-3 text-base">Settings</Text>
                                </Pressable>
                                <Pressable onPress={signOut} className='flex-row items-center hover:bg-gray-100 p-3'>
                                    <SimpleLineIcons name="logout" size={18} color="black" />
                                    <Text className="pl-3 text-base">Log out</Text>
                                </Pressable>
                            </View>
                        </>
                    }

                    <View className="flex-1 mx-4 md:my-4 items-center gap-y-4">
                        <View className='flex-1 w-full max-w-2xl pt-4'>
                            {/* New Project Button */}
                            <Pressable
                                onPress={() => setModal({ type: 'addProject' })}
                                className="flex-row bg-primary py-2 px-2 rounded-lg items-center mb-6"
                            >
                                <Text className='text-white pr-1 -mt-[2px] text-xl font-medium '>+</Text>
                                <Text className="text-white font-medium ">New Project</Text>
                            </Pressable>

                            {/* Search Input */}
                            {!!business?.projects.length && (
                                <TextInput
                                    className="bg-white p-2 mb-4 border rounded-lg"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    inputMode='text'
                                />
                            )}

                            {/* Project List */}
                            <FlatList
                                data={filteredProjects}
                                className='mb-10 '
                                showsVerticalScrollIndicator={false}
                                keyExtractor={item => item?._id || ''}
                                renderItem={renderProject}
                                contentContainerStyle={{ paddingBottom: 10 }}
                            />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
