import React, { useState, useRef } from 'react';
import { View, Button } from 'react-native';
import { WebView } from 'react-native-webview';

export function MobileEditor() {
  const [html, setHtml] = useState('');
  const webViewRef = useRef(null);

  const saveHtml = () => {
    webViewRef.current?.injectJavaScript(`
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'save',
        html: quill.root.innerHTML
      }));
    `);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'save') {
      console.log('Saved HTML:', data.html);
      console.log(JSON.stringify(data.html, null, 2));
    }
  };

  const quillHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
      <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    </head>
    <body>
      <div id="editor"></div>
      <script>
        var quill = new Quill('#editor', {
          theme: 'snow'
        });
        quill.root.innerHTML = ${JSON.stringify(html)};
      </script>
    </body>
    </html>
  `;

  return (
    <View className='flex-1'>
      <WebView
        ref={webViewRef}
        source={{ html: quillHtml }}
        onMessage={handleMessage}
      />
      <Button title="Save" onPress={saveHtml} />
    </View>
  );
}
