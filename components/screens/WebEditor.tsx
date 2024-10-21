import React, { useState, useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function WebEditor() {
    const [content, setContent] = useState('');
    const quillRef = useRef<ReactQuill>(null);

    useEffect(() => {
        // Load saved content from storage if needed
    }, []);

    const handleContentChange = (value: string) => {
        setContent(value);
        // Save content to storage if needed
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    return (
        <View className='flex-1'>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                style={{ height: '100%' }}
            />
        </View>
    );
}


