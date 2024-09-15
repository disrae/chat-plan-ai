import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Popup } from '../utils/Popup';
import { colors } from '@/constants/Colors';
import { useAuthActions } from "@convex-dev/auth/react";

type Props = { onClose: () => void; };

export function SignUp({ onClose }: Props) {
    const { signIn } = useAuthActions();
    const [type, setType] = useState<'signIn' | 'signUp'>('signUp');
    const [accountType, setAccountType] = useState<'business' | 'personal'>('business');
    const [businessName, setBusinessName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Single field to track which input is focused
    const [focusedField, setFocusedField] = useState<'business-name' | 'name' | 'email' | 'password' | null>(null);

    const toggleAccountType = () => {
        setAccountType(accountType === 'business' ? 'personal' : 'business');
    };

    const login = async () => {
        signIn("password", { email, password, flow: type });
        onClose();
    };

    const signUp = async () => {
        await signIn({ email, password });
        onClose();
    };

    return (
        <Popup onClose={onClose}>
            <View className="p-6 max-w-lg rounded-lg">
                <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-bold">
                        {type === 'signUp' ? 'Create an Account' : 'Sign In'}
                    </Text>
                </View>

                <Text className="text-gray-800 mb-6">
                    {type === 'signUp'
                        ? 'Sign up to start planning projects with others.'
                        : 'Sign in to continue where you left off.'}
                </Text>

                {type === 'signUp' && (
                    <View className="mb-4">
                        <Text className="text-lg mb-1">Account Type</Text>
                        <View className="flex-row gap-2">
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
                                            elevation: 5,
                                        },
                                    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
                                ]}
                                onPress={() => setAccountType('business')}
                            >
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
                                            elevation: 5,
                                        },
                                    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
                                ]}
                                onPress={() => setAccountType('personal')}
                            >
                                <Text className={`text-md font-medium ${accountType === 'personal' ? 'text-white' : ''}`}>Personal</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {accountType === 'business' && type === 'signUp' && (
                    <View className="mb-4">
                        <Text className="text-lg mb-1">Business Name</Text>
                        <TextInput
                            value={businessName}
                            onChangeText={setBusinessName}
                            onFocus={() => setFocusedField('business-name')}
                            onBlur={() => setFocusedField(null)}
                            className={`border focus:outline-primary rounded-md p-2 ${focusedField === 'business-name' ? 'outline-2 outline-primary' : 'border-gray-300'}`}
                            placeholder="Enter your business name"
                            style={{ borderColor: focusedField === 'business-name' ? colors.primary.DEFAULT : 'gray' }}
                        />
                    </View>
                )}

                {type === 'signUp' && (
                    <View className="mb-4">
                        <Text className="text-lg mb-1">Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            className={`border focus:outline-primary rounded-md p-2 ${focusedField === 'name' ? 'outline-2 outline-primary' : 'border-gray-300'}`}
                            placeholder="Enter your name"
                            style={{ borderColor: focusedField === 'name' ? colors.primary.DEFAULT : 'gray' }}
                        />
                    </View>
                )}

                <View className="mb-4">
                    <Text className="text-lg mb-1">Email</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`border focus:outline-primary rounded-md p-2 ${focusedField === 'email' ? 'outline-2 outline-primary' : 'border-gray-300'}`}
                        placeholder="Enter your email"
                        style={{ borderColor: focusedField === 'email' ? colors.primary.DEFAULT : 'gray' }}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-lg mb-1">Password</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`border focus:outline-primary rounded-md p-2 ${focusedField === 'password' ? 'outline-2 outline-primary' : 'border-gray-300'}`}
                        placeholder="Enter your password"
                        secureTextEntry
                        style={{ borderColor: focusedField === 'password' ? colors.primary.DEFAULT : 'gray' }}
                    />
                </View>

                <Pressable
                    className="bg-primary py-3 rounded-md mb-4"
                    onPress={() => (type === 'signIn' ? login() : signUp())}
                >
                    <Text className="text-white text-center text-lg font-medium ">
                        {type === 'signUp' ? 'Sign Up' : 'Sign In'}
                    </Text>
                </Pressable>

                <Pressable
                    className={`border-primary py-3 rounded-md mb-4`}
                    onPress={() => setType(type === 'signUp' ? 'signIn' : 'signUp')}
                >
                    <Text className="text-primary text-center text-lg font-medium">
                        {type === 'signUp' ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
                    </Text>
                </Pressable>
            </View>
        </Popup>
    );
}
