import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import AntDesign from '@expo/vector-icons/AntDesign';

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
            <Pressable className='flex-1 justify-center items-center' onPress={(e) => e.stopPropagation()}>
                <View className="bg-slate-50 rounded-lg max-w-lg z-20 cursor-default max-h-[80%]">
                    <Pressable className='absolute top-4 right-4 z-20' onPress={onClose}>
                        <AntDesign name="close" size={24} color="black" />
                    </Pressable>
                    {children}
                </View>
            </Pressable>
        </Pressable>
    );
};
