import { Header } from '@/components/navigation/Header';
import { colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import { useStore } from '@/hooks/useStore';
import { AntDesign } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, SafeAreaView, ScrollView, Pressable, ActivityIndicator } from 'react-native';

export default function AccountSettings() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [businessName, setBusinessName] = useState('');
    const user = useQuery(api.users.currentUser);
    const [tab, setTab] = useState<'profile' | 'notifications'>('profile');
    const [isUpdating, setIsUpdating] = useState(false);
    const { successMessage, errorMessage, setSuccessMessage, setErrorMessage, clearMessages } = useStore();
    const updateUser = useMutation(api.users.updateUser);
    let timer: NodeJS.Timeout | null = null;

    console.log(JSON.stringify({ successMessage, errorMessage }, null, 2));

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
        console.log('triggered');
        if (!user) return;
        setIsUpdating(true);
        try {
            const result = await updateUser({ name, email, businessName });
            if (result.success) {
                setSuccessMessage('Profile updated successfully!');
                if (user.businessName !== businessName) {
                    router.replace(`/${businessName}/settings`);
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
        <SafeAreaView className='flex-1 items-center'>
            {/* Header */}
            <View className='flex flex-row justify-center items-center bg-primary-dark px-4 w-full max-w-3xl md:py-2'>
                <Pressable onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </Pressable>
                <View className='flex-1 py-2 pl-2'>
                    <Text className='text-slate-100 text-lg font-medium text-center'>Account Settings</Text>
                </View>
            </View>
            <ScrollView className='w-full max-w-2xl px-'>
                {/* Tabs */}
                <View className="flex-row">
                    <Pressable
                        className={`py-4 px-4 rounded-tl-lg ${tab === 'profile' ? 'bg-gray-100' : ''}`}
                        onPress={() => setTab('profile')}
                    >
                        <Text
                            className={`${tab === 'profile' ? 'text-black' : 'text-gray-500'} font-bold text-base`}>
                            Profile
                        </Text>
                    </Pressable>
                    <Pressable
                        className={`py-4 px-4 rounded-tr-lg ${tab === 'notifications' ? 'bg-gray-100' : ''}`}
                        onPress={() => setTab('notifications')}
                    >
                        <Text className={`${tab === 'notifications' ? 'text-black' : 'text-gray-500'} font-bold text-base`}>
                            Notifications
                        </Text>
                    </Pressable>
                </View>

                {/* Profile */}
                {tab === 'profile' &&
                    <View className="bg-gray-100 rounded-lg rounded-tl-none p-4 ">
                        {/* Section Title */}
                        <Text className="text-lg font-bold mb-2">Profile Information</Text>
                        <Text className="text-sm text-gray-600 mb-4">Update your account details here.</Text>
                        {!user && <View className='flex-1 py-1 items-center justify-center animate-pulse'>
                            <Text className='text-base font-bold text-center'>Fetching user...</Text>
                        </View>}

                        {/* Input Fields */}
                        <Text>Name</Text>
                        <TextInput
                            className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-white"
                            value={name}
                            onChangeText={setName}
                            placeholder="Name"
                        />
                        <Text>Email</Text>
                        <TextInput
                            className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-white"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            inputMode='email'
                        />
                        <Text>Company</Text>
                        <TextInput
                            className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-white"
                            value={businessName}
                            onChangeText={setBusinessName}
                            placeholder="Company"
                        />
                    </View>}
                {/* Notifications */}
                {tab === 'notifications' &&
                    <View className="bg-gray-100 rounded-lg p-4 ">
                        {/* Section Title */}
                        <Text className="text-lg font-bold mb-2">Notifications</Text>
                        <Text className="text-sm text-gray-600 mb-4">Manage your notifications preferences here.</Text>
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
                        <Text className="text-white text-base font-bold">Update Profile</Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView >
    );
};
