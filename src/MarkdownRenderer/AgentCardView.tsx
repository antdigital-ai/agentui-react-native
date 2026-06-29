import React, { memo } from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import type { MarkdownTheme } from '../theme/defaultTheme';
import { webClassName } from '../theme/webClassName';
import { figmaHomeSpacing } from '../theme/figmaHomeSpacing';
import type { AgentCardData, AgentCardField } from './agentCard';

export function agentCardContainerStyle(): ViewStyle {
  return {
    backgroundColor: 'rgba(0, 37, 37, 0.03)',
    borderRadius: 12,
    padding: figmaHomeSpacing.cardPadding,
    marginVertical: figmaHomeSpacing.inSectionTitleGap,
    width: '100%',
    alignSelf: 'stretch',
  };
}

type AgentCardViewProps = {
  data: AgentCardData;
  theme: MarkdownTheme;
};

function FieldRow({ field, theme }: { field: AgentCardField; theme: MarkdownTheme }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: figmaHomeSpacing.inSectionTitleGap / 2,
      }}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text
          style={[
            theme.typography.tableLabel,
            { color: theme.colors.textMuted },
          ]}
        >
          {field.label}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[theme.typography.tableValue, { color: theme.colors.text }]}
        >
          {field.value}
        </Text>
      </View>
    </View>
  );
}

export const AgentCardView = memo(function AgentCardView({
  data,
  theme,
}: AgentCardViewProps) {
  const fields = data.fields ?? data.rows ?? [];
  const body = theme.typography.body;

  return (
    <View
      testID="markdown-agent-card"
      {...webClassName('agentui-markdown-card')}
      style={agentCardContainerStyle()}
    >
      {data.title ? (
        <Text
          style={[
            theme.typography.tableValue,
            { color: theme.colors.text, marginBottom: 4 },
          ]}
        >
          {data.title}
        </Text>
      ) : null}
      {data.subtitle ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, marginBottom: 8 },
          ]}
        >
          {data.subtitle}
        </Text>
      ) : null}
      {data.highlight ? (
        <Text
          style={[
            theme.typography.tableValue,
            { color: theme.colors.text, marginBottom: 8 },
          ]}
        >
          {data.highlight}
        </Text>
      ) : null}
      {data.description ? (
        <Text style={[body, { color: theme.colors.text, marginBottom: 8 }]}>
          {data.description}
        </Text>
      ) : null}
      {fields.map((field, index) => (
        <FieldRow key={`${field.label}-${index}`} field={field} theme={theme} />
      ))}
    </View>
  );
});
