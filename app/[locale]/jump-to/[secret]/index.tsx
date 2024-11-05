import { SignUp } from '@/components/popups/SignUp';
import { Popup } from '@/components/utils/Popup';
import { colors } from '@/constants/Colors';
import { shadow } from '@/constants/styles';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useZodErrorHandler } from '@/hooks/useZodErrorHandler';
import { useAuthActions } from '@convex-dev/auth/dist/react';
import { AntDesign } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

export default function index() {
    const { secret } = useLocalSearchParams() as { secret: string; };
    const router = useRouter();
    const { signIn } = useAuthActions();
    const [loading, setLoading] = useState<'signUp' | 'signIn' | 'verifying' | ''>('');
    const [accountType, setAccountType] = useState<'business' | 'personal'>('personal');
    const [businessName, setBusinessName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [flow, setFlow] = useState('signUp' as 'signUp' | 'signIn');
    const [verificationCode, setVerificationCode] = useState('');
    const user = useQuery(api.users.currentUser);
    const conversation = useQuery(api.conversations.getConversationBySecret, { secret });
    const addUserToConversation = useMutation(api.conversations.addParticipant);

    console.log(JSON.stringify({ conversation }, null, 2));

    useEffect(() => {
        const handleSignedUp = async () => {
            if (!conversation) return null;
            if (user) {
                console.log('Adding user to conversation');
                const conversationId = await addUserToConversation({ secret });
                console.log(JSON.stringify({ conversationId }, null, 2));

                router.replace(`/conversations/${conversation?._id}`);
            }
        };
        handleSignedUp();
    }, [user, conversation]);


    const { handleError, errors } = useZodErrorHandler();

    const handleSignUp = async () => {
        setLoading('signUp');
        console.log(JSON.stringify({ email, password, flow, name, accountType, conversationIds: [], businessName }, null, 2));
        try {
            const result = await signIn("password", { email, password, flow, name, accountType, conversationIds: [], businessName });
            setEmailSent(true);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading('');
        }
    };

    const handleVerifyEmail = async () => {
        try {
            setLoading('verifying');
            await signIn("password", { email: email.toLowerCase(), code: verificationCode, password, flow: "email-verification" });
            // router.push(accountType === 'business' ? `/${businessName}` : '/conversations');
        } catch (error) {
            handleError(error);
            setEmailSent(false);
        }
        setLoading('');
    };

    const handleSignIn = async () => {
        setLoading('signIn');
        try {
            await signIn("password", { email, password, flow });
        } catch (error) {
            handleError(error);
        }
        setLoading('');
    };

    if (!conversation) return null;
    return (
        <SafeAreaView className="flex-1 mx-4 py-4 justify-center items-center">
            <ScrollView className="p-6 max-w-lg rounded-lg bg-slate-50">
                {conversation && <View className='py-4 gap-1'>
                    <Text className='text-slate-800 text-lg font-bold'>You're invited:</Text>
                    <Text>{`${conversation.ownerName} from ${conversation.businessName} has invited you to join the ${conversation.name} conversation as part of the ${conversation.projectName} project.`}</Text>
                    <Text>If you already have an account, sign in, otherwise sign up.</Text>
                </View>}
                <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-bold">{flow === 'signUp' ? 'Sign Up' : 'Sign In'}
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
                                inputMode='email'
                                autoCapitalize="none"
                                autoCorrect={false}
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

                        {!!errors.length
                            ? <View className='py-4 gap-y-4 justify-center '>
                                {errors.map(e => <Text className="text-red-500">{e}</Text>)}
                            </View>
                            : <View className='h-12' />}

                        <Pressable
                            className="bg-primary h-12 items-center justify-center rounded-md mb-4"
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
                            className='items-center justify-center h-12 rounded-md  bg-slate-200'
                        >
                            <Text className='text-primary font-medium'>{flow === 'signUp'
                                ? 'Already have an account? Sign In'
                                : 'Don\'t have an account? Sign Up'}
                            </Text>
                        </Pressable>

                    </>}
                <View className='h-12' />
            </ScrollView>
        </SafeAreaView>
    );
};
