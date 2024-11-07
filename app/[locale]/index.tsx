import React, { useEffect, useState } from "react";
import '@/constants/styles.css';
import { Image } from 'expo-image';
import { View, Text, ScrollView, Pressable, SafeAreaView, StatusBar, Platform } from "react-native";
import { SignUp } from "@/components/popups/SignUp";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/dist/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Fontisto from '@expo/vector-icons/Fontisto';
import { Language, useLocale } from "@/hooks/useLocale";

const translations: Record<Language, Record<string, unknown>> = {
    'en-ca': {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        selectLanguage: 'Select Language',
        appName: 'ChatPlanAI',
        betaLabel: 'public beta',
        heroTitle: 'Plan projects with customers using AI-powered summaries',
        heroSubtitle: 'Create detailed project plans with customers using AI-generated summaries of your conversations.',
        demoSection: 'See the app in action',
        demoTitles: {
            planning: 'Project Planning',
            summaries: 'AI-Powered Summaries',
            collaboration: 'Collaboration Tools'
        },
        demoDescription: 'See how the app can help you create detailed project plans.',
        testimonialSection: 'What our customers say',
        testimonialText: 'The Chat App has been a game-changer for our business. The AI-powered summaries have helped us create much more detailed project plans with our customers.',
        footer: {
            copyright: '© 2024 Elevate Labs. All rights reserved.',
            terms: 'Terms of Service',
            privacy: 'Privacy'
        }
    },
    'fr-ca': {
        signIn: `Connexion`,
        signUp: `S'inscrire`,
        selectLanguage: `Choisir la langue`,
        appName: `ChatPlanAI`,
        betaLabel: `bêta publique`,
        heroTitle: `Planifiez des projets avec vos clients grâce aux résumés alimentés par l'IA`,
        heroSubtitle: `Créez des plans de projet détaillés avec vos clients en utilisant des résumés générés par l'IA de vos conversations.`,
        demoSection: `Voir l'application en action`,
        demoTitles: {
            planning: `Planification de projet`,
            summaries: `Résumés alimentés par l'IA`,
            collaboration: `Outils de collaboration`
        },
        demoDescription: `Découvrez comment l'application peut vous aider à créer des plans de projet détaillés.`,
        testimonialSection: `Ce que disent nos clients`,
        testimonialText: `L'application de chat a changé la donne pour notre entreprise. Les résumés alimentés par l'IA nous ont aidés à créer des plans de projet beaucoup plus détaillés avec nos clients.`,
        footer: {
            copyright: `© 2024 Elevate Labs. Tous droits réservés.`,
            terms: `Conditions d'utilisation`,
            privacy: `Confidentialité`
        }
    },
    'en-us': {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        selectLanguage: 'Select Language',
        appName: 'ChatPlanAI',
        betaLabel: 'public beta',
        heroTitle: 'Plan projects with customers using AI-powered summaries',
        heroSubtitle: 'Create detailed project plans with customers using AI-generated summaries of your conversations.',
        demoSection: 'See the app in action',
        demoTitles: {
            planning: 'Project Planning',
            summaries: 'AI-Powered Summaries',
            collaboration: 'Collaboration Tools'
        },
        demoDescription: 'See how the app can help you create detailed project plans.',
        testimonialSection: 'What our customers say',
        testimonialText: 'The Chat App has been a game-changer for our business. The AI-powered summaries have helped us create much more detailed project plans with our customers.',
        footer: {
            copyright: '© 2024 Elevate Labs. All rights reserved.',
            terms: 'Terms of Service',
            privacy: 'Privacy'
        }
    },
    'es-mx': {
        signIn: 'Iniciar sesión',
        signUp: 'Registrarse',
        selectLanguage: 'Seleccionar idioma',
        appName: 'ChatPlanAI',
        betaLabel: 'beta pública',
        heroTitle: 'Planifica proyectos con clientes usando resúmenes impulsados por IA',
        heroSubtitle: 'Crea planes de proyecto detallados con clientes usando resúmenes generados por IA de tus conversaciones.',
        demoSection: 'Ve la aplicación en acción',
        demoTitles: {
            planning: 'Planificación de proyectos',
            summaries: 'Resúmenes con IA',
            collaboration: 'Herramientas de colaboración'
        },
        demoDescription: 'Descubre cómo la aplicación puede ayudarte a crear planes de proyecto detallados.',
        testimonialSection: 'Lo que dicen nuestros clientes',
        testimonialText: 'La aplicación de chat ha sido revolucionaria para nuestro negocio. Los resúmenes impulsados por IA nos han ayudado a crear planes de proyecto mucho más detallados con nuestros clientes.',
        footer: {
            copyright: '© 2024 Elevate Labs. Todos los derechos reservados.',
            terms: 'Términos de servicio',
            privacy: 'Privacidad'
        }
    },
    'ro-ro': {
        signIn: 'Conectare',
        signUp: 'Înregistrare',
        selectLanguage: 'Selectează limba',
        appName: 'ChatPlanAI',
        betaLabel: 'beta public',
        heroTitle: 'Planifică proiecte cu clienții folosind rezumate generate de AI',
        heroSubtitle: 'Creează planuri detaliate de proiect cu clienții folosind rezumate generate de AI ale conversațiilor tale.',
        demoSection: 'Vezi aplicația în acțiune',
        demoTitles: {
            planning: 'Planificare proiect',
            summaries: 'Rezumate cu AI',
            collaboration: 'Instrumente de colaborare'
        },
        demoDescription: 'Vezi cum te poate ajuta aplicația să creezi planuri detaliate de proiect.',
        testimonialSection: 'Ce spun clienții noștri',
        testimonialText: 'Aplicația de chat a fost o revoluție pentru afacerea noastră. Rezumatele generate de AI ne-au ajutat să creăm planuri de proiect mult mai detaliate cu clienții noștri.',
        footer: {
            copyright: '© 2024 Elevate Labs. Toate drepturile rezervate.',
            terms: 'Termeni și condiții',
            privacy: 'Confidențialitate'
        }
    }
};

export type HomeScreenModals = '' | 'signUp' | 'signIn';
export default function HomePage() {
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const { signOut } = useAuthActions();
    const [modal, setModal] = useState<HomeScreenModals>('');
    const insets = useSafeAreaInsets();
    const isAndroid = Platform.OS === 'android';
    const [popup, setPopup] = useState<{ type: 'language' | ''; }>({ type: '' });
    const { locale } = useLocale();
    const t = translations[locale];

    useEffect(() => {
        if (!user) { return; }
        user.accountType == 'business'
            ? router.push(`/${locale}/${user.businessName}`)
            : router.push(`/${locale}/conversations`);
    }, [user]);

    return (
        <View className="flex-1">
            {modal &&
                <SignUp setModal={setModal} initialFlow={modal} locale={locale} />}
            <View className="bg-primary-dark" style={{ height: insets.top }} />
            <StatusBar barStyle="light-content" />
            <SafeAreaView className="flex-1 bg-gray-100">
                <View className="flex-1 flex-col min-h-[100vh]">
                    {/* Header */}
                    <View className={`flex-row items-center justify-between px-4 bg-primary-dark lg:px-8 ${isAndroid ? 'py-4' : 'py-2'}`}>
                        <View className="flex-row items-center gap-2">
                            <Image
                                className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
                                source={require("@/assets/icon_web/icon_circle.png")}
                                contentFit="cover"
                                transition={300} />
                            <Text className="text-2xl text-gray-100 font-bold tracking-tighter sm:text-3xl md:text-4xl top-1">{t.appName}
                                <Text className="text-[6px] text-gray-200 tracking-normal ml-1">{t.betaLabel}</Text>
                            </Text>
                        </View>
                        <View className="flex-row items-center space-x-3 sm:space-x-4">
                            <Pressable
                                onPress={() => { setModal('signIn'); }}
                                className="bg-slate-200 shadow px-3 py-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                <Text className="font-medium text-sm">{t.signIn}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setPopup({ type: popup.type === 'language' ? '' : 'language' })}
                                className={`${popup.type === 'language' ? 'opacity-70' : ''}`}
                            >
                                <Fontisto name="world-o" size={24} color="white" />
                            </Pressable>
                        </View>
                    </View>

                    {popup.type === 'language' && (
                        <>
                            <Pressable
                                className="absolute top-0 left-0 right-0 bottom-0 z-10"
                                style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                                onPress={() => setPopup({ type: '' })}
                            />
                            <View className='absolute right-8 top-16 bg-gray-50 rounded shadow z-20 min-w-[200px]'>
                                <View className='p-3 border-b border-gray-400 rounded-t'>
                                    <Text className="font-bold text-lg">{t.selectLanguage}</Text>
                                </View>
                                {languages.map((lang) => (
                                    <Pressable
                                        key={lang.code}
                                        onPress={() => {
                                            router.replace(`/${lang.code}`);
                                            setPopup({ type: '' });
                                        }}
                                        className='flex-row items-center justify-between hover:bg-gray-100 p-3 border-b border-gray-300'
                                    >
                                        <View className="flex-row items-center">
                                            <Text className="text-xl mr-3">{lang.flag}</Text>
                                            <Text className="text-base">{lang.name}</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </>
                    )}

                    <ScrollView className="px-4" showsVerticalScrollIndicator={false} >
                        <View className="w-full items-center px-4 md:px-6">
                            <View className="h-12"></View>
                            <Text className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-center">
                                {t.heroTitle}
                            </Text>
                            <View className="h-4"></View>
                            <Text className="text-muted-foreground text-center md:text-xl max-w-[700px] mx-auto">
                                {t.heroSubtitle}
                            </Text>
                            <View className="h-12"></View>
                            <View className="justify-center items-center">
                                <Pressable className="bg-primary px-6 py-2 rounded-md" onPress={() => setModal('signUp')}>
                                    <Text className="text-gray-100 text-xl font-semibold">{t.signUp}</Text>
                                </Pressable>
                            </View>
                        </View>
                        <View className="h-12"></View>
                        <Text className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
                            {t.demoSection}
                        </Text>
                        <View className="h-0"></View>
                        {/* Demo Videos */}
                        <View className="grid gap-x-6 sm:grid-cols-2 md:grid-cols-3">
                            {Object.values(t.demoTitles).map((title) => (
                                <View key={title} className="flex-col items-center my-6 bg-background rounded-lg bg-slate-200">
                                    <View className="p-4">
                                        <Text className="text-lg font-bold">{title}</Text>
                                        <Text className="text-muted-foreground">{t.demoDescription}</Text>
                                    </View>
                                    <Image
                                        source={require("@/assets/images/example.png")}
                                        style={{ width: '100%', height: 375 }}
                                        className="rounded-lg"
                                    />
                                </View>
                            ))}
                        </View>

                        {/* Customer Testimonials */}
                        <View className="w-full py-12 md:py-24 lg:py-32">
                            <Text className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
                                {t.testimonialSection}
                            </Text>
                            <View className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                                {["Max", "Alex", "Sarah"].map((name, index) => (
                                    <TestimonialCard key={index} name={name} testimonialText={t.testimonialText} />
                                ))}
                            </View>
                        </View>

                        {/* Footer */}
                        <View className="flex flex-col gap-2 sm:flex-row py-6 pb-20 lg:pb-2 w-full shrink-0 items-center px-4 md:px-6 border-t">
                            <Text className="text-xs text-muted-foreground">{t.footer.copyright}</Text>
                            <View className="sm:ml-auto flex-row gap-4 sm:gap-6">
                                <NavLink title={t.footer.terms} />
                                <NavLink title={t.footer.privacy} />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const NavLink = ({ title }: { title: string; }) => (
    <Pressable className="pl-4">
        <Text className="text-sm font-medium hover:underline underline-offset-4">{title}</Text>
    </Pressable>
);

const TestimonialCard = ({ name, testimonialText }: { name: string; testimonialText: string; }) => (
    <View className="bg-background rounded-lg p-6 space-y-4">
        <Text className="font-bold">{name}</Text>
        <Text className="text-muted-foreground">
            {testimonialText}
        </Text>
    </View>
);
