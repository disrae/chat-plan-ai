import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, Pressable } from 'react-native';
import { AntDesign, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { shadow } from '@/constants/styles';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/dist/react';
import { AddProject } from '@/components/popups/AddProject';
import { Id } from '@/convex/_generated/dataModel';
import { AddConversation } from '@/components/popups/AddConversation';
import Fuse from 'fuse.js';

export type DashboardModals = {
    type: '' | 'addProject' | 'addConversation',
    payload?: { projectId?: Id<'projects'>; };
};

export default function CompanyDashboard() {
    const router = useRouter();
    const { company } = useLocalSearchParams();
    const { signOut } = useAuthActions();
    const dashboard = useQuery(api.users.getUserDashboardData);
    const user = useQuery(api.users.currentUser);
    const business = dashboard?.businesses?.[0];
    const [expandedProjects, setExpandedProjects] = useState<Array<Id<'projects'>>>([]);
    const [modal, setModal] = useState<DashboardModals>({ type: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProjects, setFilteredProjects] = useState(business?.projects || []);
    const [popup, setPopup] = useState<{ type: 'settings' | ''; }>({ type: '' });
    console.log(JSON.stringify({ business }, null, 2));

    useEffect(() => {
        if (dashboard?.user.accountType === 'personal') { router.replace('/conversations'); }
        if (user === null) { router.replace('/'); }
    }, [dashboard?.user, user]);

    const fuse = new Fuse(business?.projects || [], { keys: ['name'], threshold: 0.3 });

    useEffect(() => {
        if (searchQuery.trim()) {
            const results = fuse.search(searchQuery);
            setFilteredProjects(results.map(result => result.item));
        } else {
            setFilteredProjects(business?.projects || []);
        }
    }, [searchQuery, business?.projects]);

    const toggleProject = (projectId: Id<'projects'>) => {
        setExpandedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const renderProject = ({ item: project }) => {
        if (!project) return null;

        const isSelected = expandedProjects.includes(project._id);
        return (
            <View
                className={`border ${!isSelected ? 'border-primary bg-white shadow' : ""} rounded-lg p-2 py-2 my-2`}
                style={[!isSelected ? shadow : {}]}
            >
                <Pressable
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
                </Pressable>

                {isSelected && (
                    <View className="pl-0 mt-2 space-y-4">
                        {/* Conversations List */}
                        {project.conversations.map((conversation) => {
                            if (!conversation) return null;
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
                            className="flex-row items-center bg-primary py-2 px-2 rounded-md shadow mt-2"
                        >
                            <Text className='text text-white'>+ New Conversation</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {modal.type === 'addProject' && <AddProject setModal={setModal} />}
            {modal.type === 'addConversation' && <AddConversation setModal={setModal} projectId={modal.payload?.projectId} />}
            <SafeAreaView className="flex-1 mx-4 md:my-4 items-center gap-y-4">
                <View className='flex-1 w-full max-w-2xl pt-4'>
                    {/* Settings Button */}
                    <View className='flex-row justify-end'>
                        <Pressable
                            onPress={() => setPopup({ type: popup.type === 'settings' ? '' : 'settings' })}
                            style={[popup.type === 'settings' ? {} : shadow]}
                            className={`${popup.type === 'settings' ? 'bg-slate-200' : 'bg-slate-100'} shadow px-2 py-2 rounded-full`}
                        >
                            <AntDesign name="setting" size={24} color="black" />
                        </Pressable>
                    </View>
                    {popup.type === 'settings' &&
                        <>
                            <Pressable
                                className="absolute -top-80 -left-80 -right-80 bottom-80 inset-0 z-10 "
                                style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                                onPress={() => setPopup({ type: '' })}
                            />
                            <View className='absolute right-8 top-10 bg-gray-50 rounded shadow z-20'>
                                <View className='p-2 border-b border-gray-400 rounded-t'>
                                    <Text className="font-bold">My Account</Text>
                                </View>
                                <Pressable
                                    onPress={() => router.push(`/${company}/settings`)}
                                    className='flex-row items-center hover:bg-gray-100 p-2 border-b border-gray-300'
                                >
                                    <AntDesign name="setting" size={12} color="black" />
                                    <Text className="pl-2">Settings</Text>
                                </Pressable>
                                <Pressable onPress={signOut} className='flex-row items-center hover:bg-gray-100 p-2 '>
                                    <SimpleLineIcons name="logout" size={12} color="black" />
                                    <Text className="pl-2">Log out</Text>
                                </Pressable>
                            </View>
                        </>
                    }

                    {/* Company Info */}
                    <View className="mb-4">
                        <Text className="text-3xl font-bold mt-2">{company}</Text>
                        <Text className="text-xl font-semibold">Projects & Conversations</Text>
                    </View>

                    {/* New Project Button */}
                    <Pressable
                        onPress={() => setModal({ type: 'addProject' })}
                        className="flex-row bg-primary py-2 px-2 rounded-lg items-center mb-6"
                    >
                        <Text className='text-white pr-1 -mt-[2px] text-xl font-medium '>+</Text>
                        <Text className="text-white font-medium ">New Project</Text>
                    </Pressable>

                    {/* Search Input */}
                    {!!business?.projects.length && (
                        <TextInput
                            className="bg-white p-2 mb-4 border rounded-lg"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            inputMode='text'
                        />
                    )}

                    {/* Project List */}
                    <FlatList
                        data={filteredProjects}
                        className='mb-10 '
                        showsVerticalScrollIndicator={false}
                        keyExtractor={item => item?._id || ''}
                        renderItem={renderProject}
                        contentContainerStyle={{ paddingBottom: 10 }}
                    />
                </View>
            </SafeAreaView >
        </View >
    );
}
