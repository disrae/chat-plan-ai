import { useLocalSearchParams } from 'expo-router';

export type Language = typeof locales[number]['code'];
export const locales = [
    { code: 'en-ca', name: 'English', flag: '🇨🇦' },
    { code: 'fr-ca', name: 'Français', flag: '🇨🇦' },
    { code: 'en-us', name: 'English', flag: '🇺🇸' },
    { code: 'es-mx', name: 'Español', flag: '🇲🇽' },
    { code: 'ro-ro', name: 'Română', flag: '🇷🇴' },
];

export function useLocale() {
    const { locale: urlLocale } = useLocalSearchParams<{ locale: string; }>();

    const supportedLocale = locales.find(locale => locale.code === urlLocale);
    const locale = supportedLocale?.code || 'en-ca';

    return { locale: locale as Language };
}
