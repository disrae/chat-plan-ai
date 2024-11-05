import React, { useMemo } from "react";
import { NativeModules, Platform, ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { colors } from "@/constants/Colors";

export default function HomeScreen() {
    const detectedLang = useMemo(() => {
        if (Platform.OS === 'web') return navigator.language;
        return Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale
            : NativeModules.I18nManager.localeIdentifier;
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Redirect href={`/${detectedLang}`} />
        </View>
    );
}
