import React from 'react';
import { View, TouchableWithoutFeedback, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';

type Props = {
    onClose: () => void;
    children: React.ReactNode;
};

export function Popup({ onClose, children }: Props) {
    return (
        <Pressable
            className="absolute w-full h-full justify-center items-center z-10"
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <BlurView
                intensity={50}
                tint="dark"
                className="absolute w-full h-full"
            />
            <TouchableWithoutFeedback>
                <View className="bg-slate-50 rounded-lg w-11/12 max-w-lg z-20 cursor-default max-h-[80%]">
                    <Pressable className='absolute top-4 right-4 z-20' onPress={onClose}>
                        <Text className="text-lg">✕</Text>
                    </Pressable>
                    {children}
                </View>
            </TouchableWithoutFeedback>
        </Pressable>
    );
};
