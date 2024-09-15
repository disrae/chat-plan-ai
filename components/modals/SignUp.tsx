import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Popup } from '../utils/Popup';
import { colors } from '@/constants/Colors';
import { useAuthActions } from "@convex-dev/auth/react";

type Props = { onClose: () => void; };

export function SignUp({ onClose }: Props) {
    const { signIn } = useAuthActions();
    const [type, setType] = useState<'login' | 'signup'>('signup');
    const [accountType, setAccountType] = useState<'business' | 'personal'>('business');
    const [businessName, setBusinessName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const toggleAccountType = () => {
        setAccountType(accountType === 'business' ? 'personal' : 'business');
    };

    return (
        <Popup onClose={onClose}>
            <View className="p-6 max-w-lg rounded-lg">
                <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-bold">
                        {type === 'signup' ? 'Create an Account' : 'Sign In'}
                    </Text>
                </View>

                <Text className="text-gray-800 mb-6">
                    {type === 'signup'
                        ? 'Sign up to start planning projects with others.'
                        : 'Sign in to continue where you left off.'}
                </Text>

                {type === 'signup' && <View className="mb-4">
                    <Text className="text-lg mb-1">Account Type</Text>
                    <View className='flex-row gap-2'>
                        <Pressable
                            style={[
                                accountType === 'business'
                                    ? { backgroundColor: colors.primary.DEFAULT }
                                    : {
                                        backgroundColor: 'white',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 4, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 1,
                                        elevation: 5, // Android shadow
                                    },
                                { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
                            ]}
                            onPress={() => setAccountType('business')}>
                            <Text className={`text-md font-medium ${accountType === 'business' ? 'text-white' : ''}`}>Business</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                accountType === 'personal'
                                    ? { backgroundColor: colors.primary.DEFAULT }
                                    : {
                                        backgroundColor: 'white',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5, // Android shadow
                                    },
                                { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
                            ]}
                            onPress={() => setAccountType('personal')}>
                            <Text className={`text-md font-medium ${accountType === 'personal' ? 'text-white' : ''}`}>Personal</Text>
                        </Pressable>
                    </View>
                </View>}

                {accountType === 'business' && type === 'signup' && (
                    <View className="mb-4">
                        <Text className="text-lg mb-1">Business Name</Text>
                        <TextInput
                            value={businessName}
                            onChangeText={setBusinessName}
                            className="border rounded-md p-2"
                            placeholder="Enter your business name"
                        />
                    </View>
                )}

                <View className="mb-4">
                    <Text className="text-lg mb-1">Name</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        className="border rounded-md p-2"
                        placeholder="Enter your name"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-lg mb-1">Email</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        className="border rounded-md p-2"
                        placeholder="Enter your email"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-lg mb-1">Password</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        className="border rounded-md p-2"
                        placeholder="Enter your password"
                        secureTextEntry
                    />
                </View>

                <Pressable className="bg-primary py-3 rounded-md mb-4">
                    <Text className="text-white text-center text-lg font-medium ">
                        {type === 'signup' ? 'Sign Up' : 'Sign In'}
                    </Text>
                </Pressable>
                <Pressable
                    className={`border-primary border-2 py-3 rounded-md mb-4`}
                    onPress={() => setType(type === 'signup' ? 'login' : 'signup')}
                >
                    <Text className="text-primary text-center text-lg font-medium">
                        {type === 'signup' ? 'Switch to Sign In' : 'Switch to Sign Up'}
                    </Text>
                </Pressable>
            </View>
        </Popup>
    );
}
