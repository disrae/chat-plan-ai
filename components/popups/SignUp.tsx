import React, { Dispatch, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Popup } from '../utils/Popup';
import { colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { shadow } from '@/constants/styles';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/react';
import { useZodErrorHandler } from '@/hooks/useZodErrorHandler';
import { HomeScreenModals } from '@/app/[locale]';
import { Language } from '@/hooks/useLocale';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        signUp: 'Sign Up',
        signIn: 'Sign In',
        accountType: 'Account Type',
        business: 'Business',
        personal: 'Personal',
        businessName: 'Business Name',
        enterBusinessName: 'Enter your business name',
        name: 'Name',
        enterName: 'Enter your name',
        email: 'Email',
        enterEmail: 'Enter your email',
        password: 'Password',
        enterPassword: 'Enter your password',
        show: 'Show',
        hide: 'Hide',
        verificationSent: 'A verification code was sent to your email.',
        enterCode: 'Please enter the code below:',
        checkEmail: 'Enter the code sent to your email',
        verifyEmail: 'Verify Email',
        alreadyHaveAccount: 'Already have an account? Sign In',
        dontHaveAccount: "Don't have an account? Sign Up"
    },
    'fr-ca': {
        signUp: "S'inscrire",
        signIn: 'Connexion',
        accountType: 'Type de compte',
        business: 'Entreprise',
        personal: 'Personnel',
        businessName: "Nom de l'entreprise",
        enterBusinessName: 'Entrez le nom de votre entreprise',
        name: 'Nom',
        enterName: 'Entrez votre nom',
        email: 'Courriel',
        enterEmail: 'Entrez votre courriel',
        password: 'Mot de passe',
        enterPassword: 'Entrez votre mot de passe',
        show: 'Afficher',
        hide: 'Masquer',
        verificationSent: 'Un code de vérification a été envoyé à votre courriel.',
        enterCode: 'Veuillez entrer le code ci-dessous:',
        checkEmail: 'Entrez le code envoyé à votre courriel',
        verifyEmail: 'Vérifier le courriel',
        alreadyHaveAccount: 'Vous avez déjà un compte? Connexion',
        dontHaveAccount: "Vous n'avez pas de compte? S'inscrire"
    },
    'es-mx': {
        signUp: "Registrarse",
        signIn: 'Iniciar sesión',
        accountType: 'Tipo de cuenta',
        business: 'Empresa',
        personal: 'Personal',
        businessName: 'Nombre de la empresa',
        enterBusinessName: 'Ingrese el nombre de su empresa',
        name: 'Nombre',
        enterName: 'Ingrese su nombre',
        email: 'Correo electrónico',
        enterEmail: 'Ingrese su correo electrónico',
        password: 'Contraseña',
        enterPassword: 'Ingrese su contraseña',
        show: 'Mostrar',
        hide: 'Ocultar',
        verificationSent: 'Se ha enviado un código de verificación a su correo electrónico.',
        enterCode: 'Por favor ingrese el código a continuación:',
        checkEmail: 'Ingrese el código enviado a su correo electrónico',
        verifyEmail: 'Verificar correo',
        alreadyHaveAccount: '¿Ya tiene una cuenta? Iniciar sesión',
        dontHaveAccount: "¿No tiene una cuenta? Registrarse"
    },
    'ro-ro': {
        signUp: "Înregistrare",
        signIn: 'Conectare',
        accountType: 'Tip cont',
        business: 'Business',
        personal: 'Personal',
        businessName: 'Nume companie',
        enterBusinessName: 'Introduceți numele companiei',
        name: 'Nume',
        enterName: 'Introduceți numele',
        email: 'Email',
        enterEmail: 'Introduceți email-ul',
        password: 'Parolă',
        enterPassword: 'Introduceți parola',
        show: 'Arată',
        hide: 'Ascunde',
        verificationSent: 'Un cod de verificare a fost trimis pe email-ul dvs.',
        enterCode: 'Vă rugăm să introduceți codul mai jos:',
        checkEmail: 'Introduceți codul trimis pe email',
        verifyEmail: 'Verifică email-ul',
        alreadyHaveAccount: 'Aveți deja cont? Conectare',
        dontHaveAccount: "Nu aveți cont? Înregistrare"
    }
};

type Props = {
    setModal: Dispatch<React.SetStateAction<HomeScreenModals>>;
    initialFlow?: 'signUp' | 'signIn';
    locale?: Language;
};

export function SignUp({
    setModal,
    initialFlow = 'signUp',
    locale = 'en-ca'
}: Props) {
    const router = useRouter();
    const { signIn } = useAuthActions();
    const [loading, setLoading] = useState<'signUp' | 'signIn' | 'verifying' | ''>('');
    const [accountType, setAccountType] = useState<'business' | 'personal'>('business');
    const [businessName, setBusinessName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const user = useQuery(api.users.currentUser);
    const [flow, setFlow] = useState(initialFlow);

    const { handleError, errors } = useZodErrorHandler();
    const t = translations[locale] ?? translations['en-ca'];

    const handleSignUp = async () => {
        setLoading('signUp');
        try {
            const result = await signIn("password", { email, password, flow, name, accountType, conversationIds: [], businessName, pushToken: [] });
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
            router.push(accountType === 'business' ? `/${businessName}` : '/conversations');
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

    return (
        <Popup onClose={() => setModal('')}>
            <ScrollView className="p-6 max-w-lg rounded-lg">
                <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-bold">{flow === 'signUp' ? t.signUp : t.signIn}
                    </Text>
                </View>

                {emailSent
                    ?
                    <View className="">
                        <View className='py-4 gap-1'>
                            <Text className="">{t.verificationSent}</Text>
                            <Text className="">{t.enterCode}</Text>
                        </View>
                        <TextInput
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            className="border focus:outline-primary rounded-md p-2"
                            placeholder={t.checkEmail}
                        />

                        <Pressable onPress={handleVerifyEmail} className='bg-primary py-2 rounded-md my-4'>
                            <Text className='text-white text-center text-lg font-medium'>{t.verifyEmail}</Text>
                        </Pressable>
                    </View>
                    : <>
                        {flow === 'signUp' &&
                            <View>
                                <View className="mb-4">
                                    <Text className="text-lg mb-1">{t.accountType}</Text>
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
                                            <Text className={`text-md font-medium ${accountType === 'business' ? 'text-white' : ''}`}>{t.business}</Text>
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
                                            <Text className={`text-md font-medium ${accountType === 'personal' ? 'text-white' : ''}`}>{t.personal}</Text>
                                        </Pressable>
                                    </View>
                                </View>

                                {accountType === 'business' && (
                                    <View className="mb-4">
                                        <Text className="text-lg mb-1">{t.businessName}</Text>
                                        <TextInput
                                            value={businessName}
                                            onChangeText={setBusinessName}
                                            className="border focus:outline-primary rounded-md p-2"
                                            placeholder={t.enterBusinessName}
                                        />
                                    </View>
                                )}

                                <View className="mb-4">
                                    <Text className="text-lg mb-1">{t.name}</Text>
                                    <TextInput
                                        value={name}
                                        onChangeText={setName}
                                        className="border focus:outline-primary rounded-md p-2"
                                        placeholder={t.enterName}
                                    />
                                </View>
                            </View>}

                        <View className="mb-4">
                            <Text className="text-lg mb-1">{t.email}</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                inputMode='email'
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="border focus:outline-primary rounded-md p-2"
                                placeholder={t.enterEmail}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-lg mb-1">{t.password}</Text>
                            <View className={`flex-row items-center border rounded-md ${isPasswordFocused ? 'outline-primary outline border-primary' : ''}`}>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    className="flex-1 p-2 focus:outline-none"
                                    placeholder={t.enterPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                />
                                <Pressable className=' px-2 py-1' onPress={() => setShowPassword(!showPassword)}>
                                    <Text className='text-sm font-bold text-gray-500'>{showPassword ? t.hide : t.show}</Text>
                                </Pressable>
                            </View>
                        </View>

                        {!!errors.length
                            ? <View className='py-4 gap-y-4 justify-center '>
                                {errors.map((e, index) => <Text key={index} className="text-red-500">{e}</Text>)}
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
                                <Text className="text-white text-center text-lg font-medium">{flow === 'signUp' ? t.signUp : t.signIn}</Text>
                            )}
                        </Pressable>
                        <Pressable
                            onPress={() => setFlow(flow === 'signUp' ? 'signIn' : 'signUp')}
                            className='items-center justify-center h-12 rounded-md  bg-slate-200'
                        >
                            <Text className='text-primary font-medium'>{flow === 'signUp'
                                ? t.alreadyHaveAccount
                                : t.dontHaveAccount}
                            </Text>
                        </Pressable>

                    </>}
            </ScrollView>
        </Popup >
    );
};