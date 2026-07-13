export interface KeepaliveProgressSnapshot {
  readonly elapsedSeconds: number;
  readonly phaseLabel: string;
  readonly phaseElapsedSeconds: number;
  readonly rawLine: string;
}

const KEEPALIVE_PROGRESS_LINE_PREFIXES_ZH = ['仍在处理中', '模型服务正在排队'] as const;
const KEEPALIVE_PROGRESS_LINE_PREFIXES_EN = ['Still processing', 'Model service queuing'] as const;

const PROCESSING_LINE_PATTERN_ZH =
  /^仍在处理中，已处理 (\d+)s（当前阶段：([^，]+)，阶段耗时 (\d+)s）。$/;
const QUEUED_LINE_PATTERN_ZH =
  /^模型服务正在排队\/限流等待，已处理 (\d+)s（当前阶段：([^，]+)，阶段耗时 (\d+)s）；若主模型不可用，系统会继续尝试备用模型。$/;

const PROCESSING_LINE_PATTERN_EN =
  /^Still processing, elapsed (\d+)s \(current phase: ([^,]+), phase elapsed (\d+)s\)\.$/;
const QUEUED_LINE_PATTERN_EN =
  /^Model service queuing\/rate-limiting, elapsed (\d+)s \(current phase: ([^,]+), phase elapsed (\d+)s\); if the primary model is unavailable, the system will try the fallback model\.$/;

const ALL_PREFIXES = [...KEEPALIVE_PROGRESS_LINE_PREFIXES_ZH, ...KEEPALIVE_PROGRESS_LINE_PREFIXES_EN];

const ALL_PATTERNS = [
  PROCESSING_LINE_PATTERN_ZH,
  QUEUED_LINE_PATTERN_ZH,
  PROCESSING_LINE_PATTERN_EN,
  QUEUED_LINE_PATTERN_EN,
] as const;

export function isKeepaliveProgressLine(line: string): boolean {
  return parseKeepaliveProgressLine(line) !== undefined;
}

export function repairGluedKeepaliveProgressLines(content: string): string {
  let text = content;
  for (const prefix of ALL_PREFIXES) {
    text = text.replace(
      new RegExp(`。(?=${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g'),
      '。\n',
    );
    text = text.replace(
      new RegExp(`\\.(?=${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g'),
      '.\n',
    );
  }
  return text;
}

export function parseKeepaliveProgressLine(line: string): KeepaliveProgressSnapshot | undefined {
  const trimmed = line.trim();

  for (const pattern of ALL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        elapsedSeconds: Number(match[1]),
        phaseLabel: match[2].trim(),
        phaseElapsedSeconds: Number(match[3]),
        rawLine: trimmed,
      };
    }
  }

  return undefined;
}

export function toMarkdownHardBreakKeepaliveLines(lines: readonly string[]): string {
  return `${lines.map((line) => `${line.trimEnd()}  `).join('\n')}\n`;
}
