import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Popup } from '../utils/Popup';

type Props = { setModal: React.Dispatch<React.SetStateAction<'addProject' | ''>>; };
export function AddProject({ setModal }: Props) {
    const [loading, setLoading] = useState<'creating-project' | ''>('');
    return (
        <Popup onClose={() => setModal('')}>
            <ScrollView className="p-6 max-w-lg rounded-lg">
                <View className="gap-4 max-w-">
                    <View className="gap-2">
                        <Text className="text-xl font-bold">Create New Project</Text>
                        <Text>Enter the details of your new project</Text>
                    </View>
                    {/* <View className="h-10" /> */}
                    <View className='gap-2'>
                        <View className='flex-row justify-between max-w-sm items-center gap-2'>
                            <Text className='font-semibold max-w-[100px]'>Name</Text>
                            <TextInput className="border focus:outline-primary rounded-md p-2"
                                placeholder="Enter the project name" />
                        </View>
                        <View className='flex-row justify-between max-w-sm items-center gap-2'>
                            <Text className='font-semibold max-w-[100px]'>Customer Emails</Text>
                            <TextInput className="border focus:outline-primary rounded-md p-2"
                                placeholder="Email1, Email2, ..." />
                        </View>
                    </View>
                    {/* Submit Button */}
                    <Pressable
                        className="bg-primary py-3 rounded-md"
                        onPress={() => null}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-center text-lg font-medium">Create Project</Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView >
        </Popup >
    );
}