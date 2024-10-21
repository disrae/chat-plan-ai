import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image',
    ];

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
                                modules={modules}
                                formats={formats}
                                style={{ height: '100%' }}
                            />
                        );
                    })()
                )}
            </View>
        </ScrollView>
    );
}
