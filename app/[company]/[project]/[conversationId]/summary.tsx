import React from 'react';
import { colors } from '@/constants/Colors';
import { View, Text, StatusBar, SafeAreaView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WebEditor } from '@/components/screens/WebEditor';
import { MobileEditor } from '@/components/screens/MobileEditor';

export default function Summary() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const onBackPress = () => {
        router.back();
    };

    // Choose the appropriate Editor based on the platform
    // const Editor = Platform.OS === 'web' ? WebEditor : MobileEditor;

    return (
        <View className='flex-1 bg-primary-dark'>
            <StatusBar barStyle="light-content" />
            <SafeAreaView className='flex-1'>
                {/* Header */}
                <View className='bg-primary-dark'>
                    <View className='flex-row justify-center items-center px-4'>
                        <View className='py-2'>
                            <Text className='text-slate-100 text-xl font-medium text-right'>
                                Summary
                            </Text>
                        </View>
                    </View>
                </View>

                <MobileEditor />

            </SafeAreaView>
        </View>
    );
}
