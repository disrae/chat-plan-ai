import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

export default function AccountSettings() {
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john.doe@example.com');
    const [company, setCompany] = useState('Acme Inc.');
    const user = useQuery(api.users.currentUser);
    const [bio, setBio] = useState('Business owner passionate about customer communication.');

    console.log(JSON.stringify({ user }, null, 2));

    return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', paddingTop: 20 }}>
            <ScrollView className='w-[90%] max-w-2xl px-4'>
                {/* Header */}
                <Text className="text-2xl font-bold mb-6">Account Settings</Text>

                {/* Tabs */}
                <View className="flex-row mb-4">
                    <Text className="text-base font-bold text-black mr-5">Profile</Text>
                    <Text className="text-base text-gray-500">Notifications</Text>
                </View>

                {/* Form Container */}
                <View className="bg-gray-100 rounded-lg p-4 shadow">
                    {/* Section Title */}
                    <Text className="text-lg font-bold mb-2">Profile Information</Text>
                    <Text className="text-sm text-gray-600 mb-4">Update your account details here.</Text>

                    {/* Avatar Section */}
                    {/* <View className="flex-row items-center mb-5">
                        <View className="w-16 h-16 rounded-full bg-gray-300 justify-center items-center">
                            <Text className="text-2xl text-gray-600">JD</Text>
                        </View>
                        <TouchableOpacity className="ml-4">
                            <Text className="text-base text-blue-600">Change Avatar</Text>
                        </TouchableOpacity>
                    </View> */}

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
                        keyboardType="email-address"
                    />
                    <Text>Company</Text>
                    <TextInput
                        className="h-10 border border-gray-300 rounded-md px-2 mb-4 bg-white"
                        value={company}
                        onChangeText={setCompany}
                        placeholder="Company"
                    />
                    {/* <Text></Text>
                    <TextInput
                        className="h-20 border border-gray-300 rounded-md px-2 mb-4 bg-white"
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Bio"
                        multiline
                        numberOfLines={4}
                    /> */}

                    {/* Update Button */}
                    <TouchableOpacity className="bg-black py-3 rounded-md items-center mt-4">
                        <Text className="text-white text-base font-bold">Update Profile</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
