import React, { useState } from 'react';
import { Button, SafeAreaView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MessageListDemoScreen } from './MessageListDemo';
import { StreamingDemoScreen } from './StreamingDemo';

type DemoMode = 'messageList' | 'streaming';

export default function App() {
  const [mode, setMode] = useState<DemoMode>('messageList');

  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', padding: 8, gap: 8 }}>
          <Button
            title="MessageList"
            onPress={() => setMode('messageList')}
          />
          <Button
            title="Streaming only"
            onPress={() => setMode('streaming')}
          />
        </View>
        <View style={{ flex: 1 }}>
          {mode === 'messageList' ? (
            <MessageListDemoScreen />
          ) : (
            <StreamingDemoScreen />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
