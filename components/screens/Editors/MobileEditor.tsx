import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Button, Dimensions, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Id } from '../../../convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { colors } from '@/constants/Colors';

type Props = { conversationId: Id<'conversations'>; };
export function MobileEditor({ conversationId }: Props) {
  const [html, setHtml] = useState('');
  const webViewRef = useRef(null);
  const windowHeight = Dimensions.get('window').height;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const summary = useQuery(api.summaries.getLatestSummary, { conversationId });
  const updateSummary = useMutation(api.summaries.addSummary);

  useEffect(() => {
    if (summary) {
      setHtml(summary);
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
      updateSummary({ conversationId, summary: value })
        .catch(error => console.error('Failed to update summary:', error));
    }, 5000),
    [conversationId, updateSummary]
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'contentChange') {
      setHtml(data.html);
      debouncedSave(data.html);
    }
  };

  const quillHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
      <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
      <style>
        html, body, #editor {
          height: 100%;
          margin: 0;
          padding: 0;
        }
        .ql-container {
          font-size: 16px;
        }
        .ql-editor {
          padding: 12px;
        }
        h1 {
          font-size: 24px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div id="editor"></div>
      <script>
        var quill = new Quill('#editor', {
          theme: 'snow',
          modules: {
            toolbar: true
          }
        });
        quill.root.innerHTML = ${JSON.stringify(html)};
        quill.on('text-change', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'contentChange',
            html: quill.root.innerHTML
          }));
        });
      </script>
    </body>
    </html>
  `;

  if (!summary) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View className='flex-1'>
      <WebView
        ref={webViewRef}
        source={{ html: quillHtml }}
        onMessage={handleMessage}
        style={{ height: windowHeight - 50 }}
      />
    </View>
  );
}
