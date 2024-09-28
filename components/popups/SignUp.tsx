import React, { Dispatch, useCallback, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Popup } from '../utils/Popup';
import { colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { shadow } from '@/constants/styles';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { HomeScreenModals } from '@/app';
import { useAuthActions } from '@convex-dev/auth/react';
import { ConvexError } from 'convex/values';

const testEmail = `danny.israel@gmail.com`;

type Props = {
    setModal: Dispatch<React.SetStateAction<HomeScreenModals>>;
    initialFlow?: 'signUp' | 'signIn';
};

export function SignUp({
    setModal,
    initialFlow = 'signUp'
}: Props) {
    const router = useRouter();
    const { signIn } = useAuthActions();
    const [loading, setLoading] = useState<'signUp' | 'signIn' | 'verifying' | ''>('');
    const [accountType, setAccountType] = useState<'business' | 'personal'>('business');
    const [businessName, setBusinessName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('' || testEmail);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const user = useQuery(api.users.currentUser);
    const [flow, setFlow] = useState(initialFlow);

    const updateError = (error: string) => {
        setError(error);
        setTimeout(() => setError(''), 10000);
    };

    const handleSignUp = async () => {
        setLoading('signUp');
        try {
            await signIn("password", { email, password, flow, name, accountType, conversationIds: [], businessName });
            setEmailSent(true);
        } catch (error) {
            const errorMessage =
                error instanceof ConvexError
                    ? (error.data as { message: string; }).message
                    : "Unexpected error occurred";
            console.log({ errorMessage });
            updateError(errorMessage);
        } finally {
            setLoading('');
        }
    };

    const handleVerifyEmail = async () => {
        try {
            setLoading('verifying');
            await signIn("password", { email, code: verificationCode, password, flow: "email-verification" });
            router.push(accountType === 'business' ? `/${businessName}` : '/conversations');
        } catch (error) {
            console.error(error);
            const errorMessage =
                error instanceof ConvexError
                    ? (error.data as { message: string; }).message
                    : "Unexpected error occurred";
            updateError(errorMessage);
            setEmailSent(false);
        }
        setLoading('');
    };

    const handleSignIn = async () => {
        setLoading('signIn');
        try {
            await signIn("password", { email, password, flow });
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
        }
        setLoading('');
    };

    return (
        <Popup onClose={() => setModal('')}>
            <ScrollView className="p-6 max-w-lg rounded-lg">
                <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-bold">{flow === 'signUp' ? 'Sign Up' : 'Sign In'}
                    </Text>
                </View>

                {emailSent
                    ?
                    <View className="">
                        <View className='py-4 gap-1'>
                            <Text className="">A verification code was sent to your email.</Text>
                            <Text className="">Please enter the code below:</Text>
                        </View>
                        <TextInput
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            className="border focus:outline-primary rounded-md p-2"
                            placeholder="Check your email for a verification code"
                        />

                        <Pressable onPress={handleVerifyEmail} className='bg-primary py-2 rounded-md my-4'>
                            <Text className='text-white text-center text-lg font-medium'>Verify Email</Text>
                        </Pressable>
                    </View>
                    : <>
                        {flow === 'signUp' &&
                            <View>
                                <View className="mb-4">
                                    <Text className="text-lg mb-1">Account Type</Text>
                                    <View className="flex-row gap-2">
                                        <Pressable
                                            style={[
                                                accountType === 'business'
                                                    ? { backgroundColor: colors.primary.DEFAULT }
                                                    : shadow,
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
                                                    : shadow,
                                                { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
                                            ]}
                                            onPress={() => setAccountType('personal')}
                                        >
                                            <Text className={`text-md font-medium ${accountType === 'personal' ? 'text-white' : ''}`}>Personal</Text>
                                        </Pressable>
                                    </View>
                                </View>

                                {accountType === 'business' && (
                                    <View className="mb-4">
                                        <Text className="text-lg mb-1">Business Name</Text>
                                        <TextInput
                                            value={businessName}
                                            onChangeText={setBusinessName}
                                            className="border focus:outline-primary rounded-md p-2"
                                            placeholder="Enter your business name"
                                        />
                                    </View>
                                )}

                                <View className="mb-4">
                                    <Text className="text-lg mb-1">Name</Text>
                                    <TextInput
                                        value={name}
                                        onChangeText={setName}
                                        className="border focus:outline-primary rounded-md p-2"
                                        placeholder="Enter your name"
                                    />
                                </View>
                            </View>}

                        <View className="mb-4">
                            <Text className="text-lg mb-1">Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                className="border focus:outline-primary rounded-md p-2"
                                placeholder="Enter your email"
                            />
                        </View>

                        <View className="">
                            <Text className="text-lg mb-1">Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                className="border focus:outline-primary rounded-md p-2"
                                placeholder="Enter your password"
                                secureTextEntry
                            />
                        </View>

                        {error
                            ? <View className='h-12 justify-center items-center'>
                                <Text className="text-red-500 text-center">{JSON.stringify(error)}</Text>
                            </View>
                            : <View className='h-12' />}

                        <Pressable
                            className="bg-primary py-3 rounded-md mb-4"
                            onPress={() => flow === 'signUp' ? handleSignUp() : handleSignIn()}
                            disabled={!!loading}
                        >
                            {loading ? (
                                <ActivityIndicator style={{ height: 28 }} color="#fff" />
                            ) : (
                                <Text className="text-white text-center text-lg font-medium">{flow === 'signUp' ? 'Sign Up' : 'Sign In'}</Text>
                            )}
                        </Pressable>
                        <Pressable
                            onPress={() => setFlow(flow === 'signUp' ? 'signIn' : 'signUp')}
                            className='items-center justify-center py-3 rounded-md  bg-slate-200'
                        >
                            <Text className='text-primary font-medium'>{flow === 'signUp'
                                ? 'Already have an account? Sign In'
                                : 'Don\'t have an account? Sign Up'}
                            </Text>
                        </Pressable>

                    </>}
            </ScrollView>
        </Popup >
    );
}