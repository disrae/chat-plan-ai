import React from 'react';
import { colors } from '@/constants/Colors';
import { View, Text, StatusBar, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebEditor } from '@/components/screens/Editors/WebEditor';

export default function Summary() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View className='flex-1'>
            <StatusBar barStyle="light-content" />
            <View style={{ height: insets.top, backgroundColor: colors.primary.dark }}></View>
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

                {/* Editor */}
                <WebEditor />

            </SafeAreaView>
        </View>
    );
}
