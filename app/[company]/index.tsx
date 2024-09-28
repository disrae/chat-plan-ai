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
import { DataModel, Id } from '@/convex/_generated/dataModel';
import { AddConversation } from '@/components/popups/AddConversation';

export type DashboardModals = {
    type: '' | 'addProject' | 'addConversation',
    payload?: { projectId?: Id<'projects'>; };
};

export default function CompanyDashboar() {
    const router = useRouter();
    const { company } = useLocalSearchParams();
    const { signOut } = useAuthActions();
    const dashboard = useQuery(api.users.getUserDashboardData);
    const business = dashboard?.businesses?.[0];
    const [expandedProjects, setExpandedProjects] = useState<Array<Id<'projects'>>>([]);
    const [modal, setModal] = useState<DashboardModals>({ type: '' });

    // console.log(JSON.stringify({ dashboard }, null, 2));
    useEffect(() => {
        if (dashboard?.user.accountType === 'personal') {
            router.replace('/conversations');
        }
    }, [dashboard?.user]);

    const toggleProject = (projectId: Id<'projects'>) => {
        setExpandedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    return (
        <View className="flex-1">
            {modal.type === 'addProject' && <AddProject setModal={setModal} />}
            {modal.type === 'addConversation' && <AddConversation setModal={setModal} projectId={modal.payload?.projectId} />}
            <SafeAreaView className="flex-1 mx-4 md:my-4 items-center gap-y-4">
                <View className='w-full max-w-2xl'>

                    {/* Logout Button */}
                    <View className='flex-row justify-end'>
                        <Pressable
                            onPress={signOut}
                            className="bg-slate-200 shadow px-4 py-2 rounded">
                            <Text className="text-xs font-medium">Logout</Text>
                        </Pressable>
                    </View>

                    {/* Company Info */}
                    <View className="mb-4">
                        <Text className="text-3xl font-bold mt-2">{company}</Text>
                        <Text className="text-xl font-semibold">Projects & Conversations</Text>
                    </View>

                    {/* New Project Button */}
                    <Pressable
                        onPress={() => setModal({ type: 'addProject' })}
                        className="flex-row bg-primary py-2 px-2 rounded-lg items-center mb-8"
                    >
                        <Text className='text-white pr-1 -mt-[2px] text-xl font-medium '>+</Text>
                        <Text className="text-white font-medium ">New Project</Text>
                    </Pressable>

                    {/* Search Input */}
                    {business?.projects.length && <TextInput
                        className="bg-white p-2 mb-4 border rounded-lg"
                        placeholder="Search projects..."
                        keyboardType="default"
                    />}

                    {/* Project List */}
                    <View className="space-y-6">
                        {business?.projects.map(project => {
                            if (!project) { return null; }
                            const isSelected = expandedProjects.includes(project._id);
                            return <View
                                key={project._id}
                                className={`border ${!isSelected ? 'border-primary bg-white shadow' : ""} rounded-lg p-2 py-2`}
                                style={[!isSelected ? shadow : {}]}
                            >
                                <TouchableOpacity
                                    className="flex-row items-center"
                                    onPress={() => toggleProject(project._id)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <FontAwesome
                                        name={isSelected ? "chevron-down" : "chevron-right"}
                                        size={16} style={{ paddingRight: 8 }} color={!isSelected ? colors.primary.DEFAULT : 'gray'}
                                    />
                                    <View className=''>
                                        <Text className="text-sm font-medium">{project.name}</Text>
                                    </View>
                                </TouchableOpacity>

                                {isSelected && (
                                    <View className="pl-0 mt-2 space-y-4">
                                        {/* Conversations List */}
                                        {project.conversations.map((conversation) => {
                                            if (!conversation) { return null; }
                                            return (
                                                <Pressable
                                                    key={conversation?._id}
                                                    className="flex-row items-center bg-slate-200 py-3 px-2 rounded-md shadow"
                                                    onPress={() => {
                                                        router.push(`/${company}/${project.name}/${conversation?._id}`);
                                                    }}
                                                >
                                                    <AntDesign style={{ paddingRight: 8 }} name="message1" size={16} color={colors.primary.DEFAULT} />
                                                    <Text className="text-xs">{conversation?.name}</Text>
                                                </Pressable>
                                            );
                                        })}
                                        <Pressable
                                            onPress={() => setModal({ type: 'addConversation', payload: { projectId: project._id } })}
                                            className="flex-row items-center bg-primary py-2 px-2 rounded-md shadow mt-2">
                                            <Text className='text text-white'>+ New Conversation</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>;
                        })}
                    </View>
                </View>
            </SafeAreaView >
        </View >
    );
};

