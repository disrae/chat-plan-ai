import React, { useEffect, useState } from "react";
import '../constants/styles.css';
import { Image } from 'expo-image';
import { View, Text, ScrollView, Pressable, SafeAreaView, StatusBar, Platform } from "react-native";
import { SignUp } from "@/components/popups/SignUp";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/dist/react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Fontisto from '@expo/vector-icons/Fontisto';
import { SimpleLineIcons } from '@expo/vector-icons';

const languages = [
    { code: 'en-CA', name: 'English', flag: '🇨🇦' },
    { code: 'fr-CA', name: 'Français', flag: '🇨🇦' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-MX', name: 'Español', flag: '🇲🇽' },
    { code: 'ro-RO', name: 'Română', flag: '🇷🇴' },
];

export type HomeScreenModals = '' | 'signUp' | 'signIn';
export default function HomePage() {
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const { signOut } = useAuthActions();
    const [modal, setModal] = useState<HomeScreenModals>('');
    const insets = useSafeAreaInsets();
    const isAndroid = Platform.OS === 'android';
    const [popup, setPopup] = useState<{ type: 'language' | ''; }>({ type: '' });

    useEffect(() => {
        if (!user) { return; }
        user.accountType == 'business'
            ? router.push(`/${user.businessName}`)
            : router.push('/conversations');
    }, [user]);

    return (
        <View className="flex-1">
            {modal &&
                <SignUp setModal={setModal} initialFlow={modal} />}
            <View className="bg-primary-dark" style={{ height: insets.top }} />
            <StatusBar barStyle="light-content" />
            <SafeAreaView className="flex-1 bg-gray-100">
                <View className="flex-1 flex-col min-h-[100vh]">
                    {/* Header */}
                    <View className={`flex-row items-center justify-between px-4 bg-primary-dark lg:px-8 ${isAndroid ? 'py-4' : 'py-2'}`}>
                        <View className="flex-row items-center gap-2">
                            <Image
                                className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
                                source={require("../assets/icon_web/icon_circle.png")}
                                contentFit="cover"
                                transition={300} />
                            <Text className="text-2xl text-gray-100 font-bold tracking-tighter sm:text-3xl md:text-4xl top-1">ChatPlanAI
                                <Text className="text-[6px] text-gray-200 tracking-normal ml-1">public beta</Text>
                            </Text>
                        </View>
                        <View className="flex-row items-center space-x-3 sm:space-x-4">
                            <Pressable
                                onPress={() => { setModal('signIn'); }}
                                className="bg-slate-200 shadow px-3 py-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                <Text className="font-medium text-sm">Sign In</Text>
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
                                    <Text className="font-bold text-lg">Select Language</Text>
                                </View>
                                {languages.map((lang) => (
                                    <Pressable
                                        key={lang.code}
                                        onPress={() => {
                                            // Add language change logic here
                                            setPopup({ type: '' });
                                        }}
                                        className='flex-row items-center justify-between hover:bg-gray-100 p-3 border-b border-gray-300'
                                    >
                                        <View className="flex-row items-center">
                                            <Text className="text-xl mr-3">{lang.flag}</Text>
                                            <Text className="text-base">{lang.name}</Text>
                                        </View>
                                        {/* Add checkmark for selected language if needed */}
                                    </Pressable>
                                ))}
                            </View>
                        </>
                    )}

                    <ScrollView className="px-4" showsVerticalScrollIndicator={false} >
                        <View className="w-full items-center px-4 md:px-6">
                            <View className="h-12"></View>
                            <Text className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-center">
                                Plan projects with customers using AI-powered summaries
                            </Text>
                            <View className="h-4"></View>
                            <Text className="text-muted-foreground text-center md:text-xl max-w-[700px] mx-auto">
                                Create detailed project plans with customers using AI-generated summaries
                                of your conversations.
                            </Text>
                            <View className="h-12"></View>
                            <View className="justify-center items-center">
                                <Pressable className="bg-primary px-6 py-2 rounded-md" onPress={() => setModal('signUp')}>
                                    <Text className="text-gray-100 text-xl font-semibold">Sign Up</Text>
                                </Pressable>
                            </View>
                        </View>
                        <View className="h-12"></View>
                        <Text className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
                            See the app in action
                        </Text>
                        <View className="h-0"></View>
                        {/* Demo Videos */}
                        <View className="grid gap-x-6 sm:grid-cols-2 md:grid-cols-3">
                            {["Project Planning", "AI-Powered Summaries", "Collaboration Tools"].map((title, index) => (
                                <View key={title} className="flex-col items-center my-6 bg-background rounded-lg bg-slate-200">
                                    <View className="p-4">
                                        <Text className="text-lg font-bold">{title}</Text>
                                        <Text className="text-muted-foreground">See how the app can help you create detailed project plans.</Text>
                                    </View>
                                    <Image
                                        source={require("../assets/images/example.png")}
                                        style={{ width: '100%', height: 375 }}
                                        className="rounded-lg"
                                    />
                                </View>
                            ))}
                        </View>

                        {/* Customer Testimonials */}
                        <View className="w-full py-12 md:py-24 lg:py-32">
                            <Text className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
                                What our customers say
                            </Text>
                            <View className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                                {["Max", "Alex", "Sarah"].map((name, index) => (
                                    <TestimonialCard key={index} name={name} />
                                ))}
                            </View>
                        </View>

                        {/* Footer */}
                        <View className="flex flex-col gap-2 sm:flex-row py-6 pb-20 lg:pb-2 w-full shrink-0 items-center px-4 md:px-6 border-t">
                            <Text className="text-xs text-muted-foreground">&copy; 2024 Elevate Labs. All rights reserved.</Text>
                            <View className="sm:ml-auto flex-row gap-4 sm:gap-6">
                                <NavLink title="Terms of Service" />
                                <NavLink title="Privacy" />
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

const TestimonialCard = ({ name }: { name: string; }) => (
    <View className="bg-background rounded-lg p-6 space-y-4">
        <Text className="font-bold">{name}</Text>
        <Text className="text-muted-foreground">
            The Chat App has been a game-changer for our business. The AI-powered summaries have helped us create much more
            detailed project plans with our customers.
        </Text>
    </View>
);