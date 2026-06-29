import React from 'react';

export type AgentCardField = {
  label: string;
  value: string;
};

/** JSON payload for ```agent-card fences (API / agent output). */
export type AgentCardData = {
  title?: string;
  subtitle?: string;
  description?: string;
  /** Primary metric line, e.g. price + change */
  highlight?: string;
  fields?: AgentCardField[];
  rows?: AgentCardField[];
};

function normalizeField(entry: unknown): AgentCardField | null {
  if (!entry || typeof entry !== 'object') return null;
  const row = entry as Record<string, unknown>;
  const label = row.label ?? row.header ?? row.name ?? row.key;
  const value = row.value ?? row.text ?? row.content;
  if (label == null && value == null) return null;
  return {
    label: label == null ? '' : String(label),
    value: value == null ? '' : String(value),
  };
}

function fieldsFromRecord(record: Record<string, unknown>): AgentCardField[] {
  const raw = record.fields ?? record.rows ?? record.items ?? record.data;
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeField).filter((f): f is AgentCardField => f != null);
}

export function normalizeAgentCardData(value: unknown): AgentCardData | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return normalizeAgentCardData(value[0]);
  }
  if (typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const fields = fieldsFromRecord(record);
  const title =
    record.title ?? record.cardTitle ?? record.name ?? record.heading;
  const subtitle = record.subtitle ?? record.subTitle ?? record.caption;
  const description = record.description ?? record.body ?? record.summary;
  const highlight =
    record.highlight ?? record.stat ?? record.metric ?? record.primary;

  if (
    title == null &&
    subtitle == null &&
    description == null &&
    highlight == null &&
    fields.length === 0
  ) {
    return null;
  }

  return {
    title: title != null ? String(title) : undefined,
    subtitle: subtitle != null ? String(subtitle) : undefined,
    description: description != null ? String(description) : undefined,
    highlight: highlight != null ? String(highlight) : undefined,
    fields,
  };
}

export function parseAgentCardJson(raw: string): AgentCardData | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return normalizeAgentCardData(JSON.parse(trimmed));
  } catch {
    return null;
  }
}

export function collectReactText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectReactText).join('');
  if (React.isValidElement(node)) {
    return collectReactText(
      (node.props as { children?: React.ReactNode }).children,
    );
  }
  return '';
}

export function fencedPreCodeMeta(preChildren: React.ReactNode): {
  lang: string | null;
  text: string;
} {
  const items = React.Children.toArray(preChildren);
  const codeEl = items.find(React.isValidElement) ?? items[0];
  if (!React.isValidElement(codeEl)) {
    return { lang: null, text: collectReactText(preChildren) };
  }
  const className = (codeEl.props as { className?: string }).className;
  const langMatch = className?.match(/language-([\w-]+)/i);
  return {
    lang: langMatch?.[1]?.toLowerCase() ?? null,
    text: collectReactText(
      (codeEl.props as { children?: React.ReactNode }).children,
    ),
  };
}
