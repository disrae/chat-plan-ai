import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // For icons, you can replace these if needed

import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { shadow } from '@/constants/styles';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/dist/react';
import { AddProject } from '@/components/popups/AddProject';

// Sample data
const projects = [
    // {
    //     id: 1,
    //     name: "June 24 Wedding Tofino",
    //     customer: "John and Nathalie",
    //     conversations: [
    //         { id: 2, title: "Day 1 Planning" },
    //         { id: 3, title: "Day 2 Planning" },
    //         { id: 4, title: "Day 3 Planning" },
    //         { id: 1, title: "Overall Planning" },
    //     ]
    // },
    // {
    //     id: 2,
    //     name: "October 29 Wedding Mackenzie Beach",
    //     customer: "Suzanne",
    //     conversations: [
    //         { id: 3, title: "Event 1" },
    //         { id: 4, title: "Event 2" },
    //     ]
    // },
    // {
    //     id: 3,
    //     name: "Lemonade Hotel Weekends",
    //     customer: "John Wicks",
    //     conversations: [
    //         { id: 5, title: "Requirements Gathering" },
    //     ]
    // },
];

export default function CompanyDashboar() {
    const router = useRouter();
    const { company } = useLocalSearchParams();
    const { signOut } = useAuthActions();
    const dashboard = useQuery(api.users.getUserDashboardData);
    const [expandedProjects, setExpandedProjects] = useState([]);
    const [modal, setModal] = useState<'addProject' | ''>('');

    console.log(JSON.stringify({ dashboard }, null, 2));
    useEffect(() => {
        if (dashboard?.user.accountType === 'personal') {
            router.replace('/conversations');
        }
    }, [dashboard?.user]);

    const toggleProject = (projectId) => {
        setExpandedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const addNewProject = () => {
        setModal('addProject');
    };

    const addNewConversation = (projectId) => {
        console.log('Add new conversation to project:', projectId);
    };

    return (
        <View className="flex-1">
            {modal && <AddProject setModal={setModal} />}
            <SafeAreaView className="flex-1 mx-4 md:my-4 items-center gap-y-4">
                <View className='w-full max-w-2xl'>
                    {/* Company Info */}
                    <View className="mb-4">
                        <View className='flex-row justify-end'>
                            <Pressable
                                onPress={signOut}
                                className="bg-slate-200 shadow px-4 py-2 rounded">
                                <Text className="font-medium">Logout</Text>
                            </Pressable>
                        </View>
                        <Text className="text-3xl font-bold my-2">{company}</Text>
                        <View className="gap-2 justify-between sm:flex-row sm:items-center">
                            <Text className="text-xl font-semibold">Projects & Conversations</Text>
                            <Pressable
                                onPress={addNewProject}
                                className="flex-row bg-primary py-2 px-2 rounded-lg items-center"
                            >
                                <Text className='text-white pr-1 -mt-[2px] text-xl font-medium '>+</Text>
                                <Text className="text-white font-medium ">New Project</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Search Input */}
                    <TextInput
                        className="bg-white p-2 mb-4 border rounded-lg"
                        placeholder="Search projects..."
                        keyboardType="default"
                    />

                    {/* Project List */}
                    <View className="space-y-2">
                        {projects.map((project) => {
                            const isSelected = expandedProjects.includes(project.id);
                            return <View key={project.id} className={`border ${!isSelected ? 'border-primary ' : " "} rounded-lg p-2`}>
                                {/* Project Header */}
                                <TouchableOpacity
                                    className="flex-row items-center"
                                    onPress={() => toggleProject(project.id)}
                                >
                                    <FontAwesome
                                        name={isSelected ? "chevron-down" : "chevron-right"}
                                        size={16} style={{ paddingRight: 8 }} color={!isSelected ? colors.primary.DEFAULT : 'gray'}
                                    />
                                    <View className=''>
                                        <Text className="text-sm font-medium">{project.name}</Text>
                                        <Text className="text-xs text-gray-900">{project.customer}</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Conversations List */}
                                {isSelected && (
                                    <View className="pl-0 mt-2 space-y-4">
                                        {project.conversations.map((conversation) => (
                                            <Pressable key={conversation.id} className="flex-row items-center bg-slate-200 py-3 px-2 rounded-md shadow">
                                                <AntDesign style={{ paddingRight: 8 }} name="message1" size={16} color={colors.primary.DEFAULT} />
                                                <Text className="text-xs">{conversation.title}</Text>
                                            </Pressable>
                                        ))}
                                        <Pressable className="flex-row items-center bg-primary py-2 px-2 rounded-md shadow">
                                            <Text className='text text-white'>+ New Conversation</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>;
                        })}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

