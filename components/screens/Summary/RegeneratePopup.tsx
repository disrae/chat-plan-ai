import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Platform } from 'react-native';
import { colors } from '@/constants/Colors';
import { Popup } from '@/components/utils/Popup';
import Checkbox from 'expo-checkbox';
import { Language, useLocale } from '@/hooks/useLocale';

const translations: Record<Language, Record<string, string>> = {
    'en-ca': {
        regenerateSummary: 'Regenerate Summary',
        includeCurrentSummary: 'Include current summary?',
        includeCurrentSummaryDesc: 'The AI will start with your existing document rather than starting from scratch. You can add a prompt to guide how the AI should modify or enhance the current content.',
        includeChat: 'Include chat',
        includeChatDesc: 'The AI will use the chat messages to update the document with new information.',
        customPrompt: 'Custom Prompt (optional)',
        customPromptPlaceholder: 'E.g., Remove the part about xyz. Include sections Itemized Price, Dates, Third Party Providers.',
        generate: 'Generate'
    },
    'fr-ca': {
        regenerateSummary: 'Régénérer le résumé',
        includeCurrentSummary: 'Inclure le résumé actuel ?',
        includeCurrentSummaryDesc: "L'IA commencera avec votre document existant plutôt que de partir de zéro. Vous pouvez ajouter des instructions pour guider comment l'IA devrait modifier ou améliorer le contenu actuel.",
        includeChat: 'Inclure le chat',
        includeChatDesc: "L'IA utilisera les messages du chat pour mettre à jour le document avec de nouvelles informations.",
        customPrompt: 'Instructions personnalisées (optionnel)',
        customPromptPlaceholder: 'Ex., Supprimer la partie concernant xyz. Inclure les sections Prix détaillé, Dates, Fournisseurs tiers.',
        generate: 'Générer'
    },
    'es-mx': {
        regenerateSummary: 'Regenerar resumen',
        includeCurrentSummary: '¿Incluir resumen actual?',
        includeCurrentSummaryDesc: 'La IA comenzará con su documento existente en lugar de comenzar desde cero. Puede agregar instrucciones para guiar cómo la IA debe modificar o mejorar el contenido actual.',
        includeChat: 'Incluir chat',
        includeChatDesc: 'La IA utilizará los mensajes del chat para actualizar el documento con nueva información.',
        customPrompt: 'Instrucciones personalizadas (opcional)',
        customPromptPlaceholder: 'Ej., Eliminar la parte sobre xyz. Incluir secciones Precio detallado, Fechas, Proveedores externos.',
        generate: 'Generar'
    },
    'ro-ro': {
        regenerateSummary: 'Regenerează rezumatul',
        includeCurrentSummary: 'Include rezumatul curent?',
        includeCurrentSummaryDesc: 'AI-ul va începe cu documentul dvs. existent în loc să înceapă de la zero. Puteți adăuga instrucțiuni pentru a ghida modul în care AI-ul ar trebui să modifice sau să îmbunătățească conținutul actual.',
        includeChat: 'Include chat',
        includeChatDesc: 'AI-ul va folosi mesajele din chat pentru a actualiza documentul cu informații noi.',
        customPrompt: 'Instrucțiuni personalizate (opțional)',
        customPromptPlaceholder: 'Ex., Șterge partea despre xyz. Include secțiunile Preț detaliat, Date, Furnizori terți.',
        generate: 'Generează'
    }
};

export interface SummaryOptions {
    preserveDocument: boolean;
    includeChat: boolean;
    customPrompt?: string;
}

interface RegeneratePopupProps {
    onClose: () => void;
    onSubmit: (options: SummaryOptions) => void;
    loading: string;
}

export const RegeneratePopup = ({ onClose, onSubmit, loading }: RegeneratePopupProps) => {
    const [includeDocument, setIncludeDocument] = useState(true);
    const [includeChat, setIncludeChat] = useState(true);
    const [customPrompt, setCustomPrompt] = useState('');
    const { locale } = useLocale();
    const t = translations[locale] ?? translations['en-ca'];

    // Add hover classes only for web
    const hoverClass = Platform.OS === 'web' ? 'hover:opacity-80' : '';

    return (
        <Popup onClose={onClose}>
            <View className="p-6">
                <Text className="text-xl font-bold tracking-tighter mb-4">{t.regenerateSummary}</Text>
                <View className="gap-4">
                    <Pressable
                        className={`flex-row items-center p-4 rounded-lg ${hoverClass} ${includeDocument ? 'bg-gray-200' : 'bg-gray-100'}`}
                        onPress={() => setIncludeDocument(!includeDocument)}
                        disabled={!!loading}>
                        <Checkbox
                            value={includeDocument}
                            onValueChange={setIncludeDocument}
                            color={includeDocument ? colors.primary.DEFAULT : undefined}
                            className="mx-4"
                            disabled={!!loading}
                        />
                        <View className='flex flex-1'>
                            <Text className="flex-shrink-1 font-semibold pb-2">{t.includeCurrentSummary}</Text>
                            <Text className="flex-shrink-1 font-light">{t.includeCurrentSummaryDesc}</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        className={`flex-row items-center mb-4 p-4 rounded-lg ${hoverClass} ${includeChat ? 'bg-gray-200' : 'bg-gray-100'}`}
                        onPress={() => setIncludeChat(!includeChat)}
                        disabled={!!loading}>
                        <Checkbox
                            value={includeChat}
                            onValueChange={setIncludeChat}
                            color={includeChat ? colors.primary.DEFAULT : undefined}
                            className="mx-4"
                            disabled={!!loading}
                        />
                        <View className='flex flex-1'>
                            <Text className="flex-shrink-1 font-semibold pb-2">{t.includeChat}</Text>
                            <Text className="flex-shrink-1 font-light">{t.includeChatDesc}</Text>
                        </View>
                    </Pressable>
                </View>

                <View className="mb-4">
                    <Text className="mb-2 font-semibold">{t.customPrompt}</Text>
                    <TextInput
                        className="border rounded p-2 bg-background focus:border-primary focus:outline-primary min-h-[100px] flex-1 flex-grow"
                        value={customPrompt}
                        onChangeText={setCustomPrompt}
                        multiline
                        placeholder={t.customPromptPlaceholder}
                        placeholderTextColor="#aaa"
                        editable={!loading}
                    />
                </View>

                <View className="flex-row justify-end gap-2">
                    <Pressable
                        className="bg-primary px-4 py-2 rounded"
                        onPress={() => onSubmit({
                            preserveDocument: includeDocument,
                            includeChat: includeChat,
                            customPrompt: customPrompt
                        })}
                        disabled={!!loading}>
                        <Text className="text-white font-semibold">{t.generate}</Text>
                    </Pressable>
                </View>
            </View>
        </Popup>
    );
};