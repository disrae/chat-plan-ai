import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import 'react-quill/dist/quill.snow.css';

export function WebEditor() {
    const [content, setContent] = useState('');
    const [isClient, setIsClient] = useState(false);
    const quillRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleContentChange = (value: string) => {
        setContent(value);
    };

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
