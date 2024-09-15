import React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';

type Props = {
    onClose: () => void;
    children: React.ReactNode;
};

export function CenteredModal({ onClose, children }: Props) {
    return (
        <TouchableOpacity
            className="absolute w-full h-full justify-center items-center z-10"
            activeOpacity={0.2}
            onPress={onClose}
        >
            <BlurView
                intensity={50}
                tint="dark"
                className="absolute w-full h-full"
            />
            <TouchableWithoutFeedback>
                <View className="bg-slate-100 rounded-lg w-11/12 max-w-lg z-20 cursor-default">
                    <Pressable className='absolute top-4 right-4 z-20' onPress={onClose}>
                        <Text className="text-lg">✕</Text>
                    </Pressable>
                    {children}
                </View>
            </TouchableWithoutFeedback>
        </TouchableOpacity>
    );
};
