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

const testEmail = `danny.israel+${Date.now()}@gmail.com`;

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
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState<'business' | 'personal'>('business');
    const [businessName, setBusinessName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('' || testEmail);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    // const createUser = useMutation(api.users.createUser);
    const user = useQuery(api.users.currentUser);
    const [flow, setFlow] = useState(initialFlow);

    // const updateError = (error: string) => {
    //     setErrors(error);
    //     setInterval(() => setErrors(''), 10000);
    // };

    const handleSignUp = async () => {
        setLoading(true);
        try {
            await signIn("password", { email, password, flow, name, accountType, conversationIds: [], businessName });
        } catch (error) {
            const errorMessage =
                // Check whether the error is an application error
                error instanceof ConvexError
                    ? // Access data and cast it to the type we expect
                    (error.data as { message: string; }).message
                    : // Must be some developer error,
                    // and prod deployments will not
                    // reveal any more information about it
                    // to the client
                    "Unexpected error occurred";
            console.log({ errorMessage });
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        // if (!isLoadedSignUp) return;

        // try {
        //     const completeSignUp = await signUp.attemptEmailAddressVerification({
        //         code: verificationCode,
        //     });

        //     if (completeSignUp.status === 'complete') {
        //         await setActiveSignUp({ session: completeSignUp.createdSessionId });
        //         accountType === 'business' ? router.push(`/${businessName}`) : router.push('/conversations');
        //     } else {
        //         console.error(JSON.stringify(completeSignUp, null, 2));
        //     }
        // } catch (err: any) {
        //     // See https://clerk.com/docs/custom-flows/error-handling
        //     // for more info on error handling
        //     if (isClerkAPIResponseError(err)) setErrors(err.errors);
        //     console.error(JSON.stringify(err, null, 2));
        // }
    };

    // const handleSignIn = useCallback(async () => {
    //     if (!isLoadedSignIn) { return; }
    //     try {
    //         const signInAttempt = await signIn.create({ identifier: email, password });

    //         if (signInAttempt.status === 'complete') {
    //             await setActiveSignIn({ session: signInAttempt.createdSessionId });
    //             router.replace('/');
    //         } else {
    //             console.error(JSON.stringify(signInAttempt, null, 2));
    //         }
    //     } catch (err: any) {
    //         console.error(JSON.stringify(err, null, 2));
    //     }
    // }, [isLoadedSignIn, email, password]);

    return (
        <Popup onClose={() => setModal('')}>
            <ScrollView className="p-6 max-w-lg rounded-lg">
                <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-bold">{flow === 'signUp' ? 'Sign Up' : 'Sign In'}
                    </Text>
                </View>

                <>
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
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-center text-lg font-medium ">{flow === 'signUp' ? 'Sign Up' : 'Sign In'}</Text>
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

                </>
            </ScrollView>
        </Popup >
    );
}
