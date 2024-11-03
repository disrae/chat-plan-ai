import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import 'react-quill/dist/quill.snow.css';
import { Id } from '../../../convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { colors } from '@/constants/Colors';

interface WebEditorProps {
    conversationId: Id<'conversations'>;
}

export function WebEditor({ conversationId }: WebEditorProps) {
    const [isClient, setIsClient] = useState(false);
    const [content, setContent] = useState('');
    const quillRef = useRef(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const summary = useQuery(api.summaries.getLatestSummary, { conversationId });
    const updateSummary = useMutation(api.summaries.addSummary);

    // console.log(JSON.stringify(summary, null, 2));

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (summary) {
            setContent(summary);
        }
    }, [summary]);

    const debounce = useCallback((func: Function, delay: number) => {
        return (...args: any[]) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                func(...args);
            }, delay);
        };
    }, []);

    const debouncedSave = useCallback(
        debounce((value: string) => {
            updateSummary({ conversationId, html: value })
                .catch(error => console.error('Failed to update summary:', error));
        }, 5000),
        [conversationId, updateSummary]
    );

    const handleContentChange = (value: string) => {
        setContent(value);
        debouncedSave(value);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    if (!summary) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            </View>
        );
    }
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1">
                {isClient && (
                    (() => {
                        const ReactQuill = require('react-quill');
                        return (
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={handleContentChange}
                                style={{ height: '100%' }}
                            />
                        );
                    })()
                )}
            </View>
        </ScrollView>
    );
}
