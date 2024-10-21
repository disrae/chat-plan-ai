import React, { useState, useRef } from 'react';
import { View, Button, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

export function MobileEditor() {
  const [html, setHtml] = useState('');
  const webViewRef = useRef(null);
  const windowHeight = Dimensions.get('window').height;

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
          font-size: 18px;
        }
        .ql-editor {
          padding: 12px;
        }
      </style>
    </head>
    <body>
      <div id="editor"></div>
      <script>
        var quill = new Quill('#editor', {
          theme: 'snow',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['image', 'link'],
              ['clean']
            ]
          }
        });
        quill.root.innerHTML = ${JSON.stringify(html)};

        // Handle image upload
        quill.getModule('toolbar').addHandler('image', () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, 'image', e.target.result);
            };

            reader.readAsDataURL(file);
          };
        });
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
        style={{ height: windowHeight - 50 }}
      />
      <Button title="Save" onPress={saveHtml} />
    </View>
  );
}
