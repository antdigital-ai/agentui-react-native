import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  DeepThinking,
  MarkdownThemeProvider,
} from '@antdigital/agentui-react-native';
import { demoStyles } from './demoStyles';
import { FIGMA_HOME_THINKING_BODY } from './figmaHomeDemoContent';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 12, opacity: 0.55, marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

export function DeepThinkingDemoScreen() {
  return (
    <MarkdownThemeProvider>
      <ScrollView
        style={demoStyles.content}
        contentContainerStyle={demoStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Section title="Completed — tap to expand reasoning">
          <DeepThinking
            status="completed"
            body={FIGMA_HOME_THINKING_BODY}
            layoutDensity="compact"
            defaultExpanded={false}
          />
        </Section>
        <Section title="Thinking (in progress)">
          <DeepThinking status="thinking" layoutDensity="compact" />
        </Section>
        <Section title="Failed">
          <DeepThinking
            status="failed"
            label="Could not finish reasoning"
            layoutDensity="compact"
          />
        </Section>
      </ScrollView>
    </MarkdownThemeProvider>
  );
}
