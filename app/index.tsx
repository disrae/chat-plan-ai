import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, SafeAreaView } from "react-native";
// import { useMediaQuery } from "react-responsive"; // For responsive design with @expo/match-media
import AntDesign from '@expo/vector-icons/AntDesign';
import { SignUp } from "@/components/modals/SignUp";

const NavLink = ({ title }) => (
    <TouchableOpacity>
        <Text className="text-sm font-medium hover:underline underline-offset-4">{title}</Text>
    </TouchableOpacity>
);

const TestimonialCard = ({ name }) => (
    <View className="bg-background rounded-lg p-6 space-y-4">
        <Text className="font-bold">{name}</Text>
        <Text className="text-muted-foreground">
            The Chat App has been a game-changer for our business. The AI-powered summaries have helped us create much more
            detailed project plans with our customers.
        </Text>
    </View>
);

export default function HomePage() {
    // const isLargeScreen = useMediaQuery({ minWidth: 768 });
    const [modal, setModal] = useState<'' | 'sign-up'>('');

    return (
        <View className="flex-1">
            {modal === 'sign-up' && <SignUp onClose={() => setModal('')} />}
            <SafeAreaView className="flex-1 bg-primary-dark mx-4 py-4">
                <View className="flex-1 flex-col min-h-[100vh]">
                    {/* Header */}
                    <View className="flex-row items-center h-14 px-4 lg:px-6">
                        <TouchableOpacity className="flex items-center justify-center">
                            <AntDesign name="message1" size={24} color="black" />
                            <Text className="sr-only">Chat App</Text>
                        </TouchableOpacity>
                        <View className="ml-auto flex-row gap-4 sm:gap-6">
                            <NavLink title="Features" />
                            <NavLink title="Pricing" />
                            <NavLink title="About" />
                            <NavLink title="Contact" />
                        </View>
                    </View>

                    {/* Main Content */}
                    <ScrollView>
                        {/* Titles */}
                        <View className="w-full items-center px-4 md:px-6">
                            <View className="h-12"></View>
                            <Text className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-center">
                                Plan projects with customers using AI-powered summaries
                            </Text>
                            <View className="h-12"></View>
                            <Text className="text-muted-foreground text-center md:text-xl max-w-[700px] mx-auto">
                                Our chat app helps business owners create detailed project plans with customers using AI-generated summaries
                                of your conversations.
                            </Text>
                            <View className="h-12"></View>
                            <View className="justify-center items-center">
                                <TouchableOpacity className="bg-primary px-16 py-4 rounded-md" onPress={() => setModal('sign-up')}>
                                    <Text className="text-white text-2xl font-medium">Sign Up</Text>
                                </TouchableOpacity>
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
                                        resizeMode="cover"
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

                        {/* Sign-Up Section */}
                        <View className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                            <Text className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
                                Get started with the Chat App
                            </Text>
                            <View className="mx-auto w-full max-w-sm space-y-2">
                                <View className="flex-row gap-2">
                                    <TextInput
                                        className="flex-1 border border-primary rounded-md px-4 py-2"
                                        placeholder="Enter your email"
                                    />
                                    <TouchableOpacity className="bg-primary px-4 py-2 rounded-md">
                                        <Text className="text-white text-sm font-medium">Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-xs text-muted-foreground text-center">
                                    Already have an account?{" "}
                                    <TouchableOpacity>
                                        <Text className="underline">Sign In</Text>
                                    </TouchableOpacity>
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                        <Text className="text-xs text-muted-foreground">&copy; 2024 Chat App. All rights reserved.</Text>
                        <View className="sm:ml-auto flex-row gap-4 sm:gap-6">
                            <NavLink title="Terms of Service" />
                            <NavLink title="Privacy" />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
