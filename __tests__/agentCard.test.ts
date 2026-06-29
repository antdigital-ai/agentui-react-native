import {
  normalizeAgentCardData,
  parseAgentCardJson,
} from '../src/MarkdownRenderer/agentCard';

describe('agentCard', () => {
  it('parseAgentCardJson parses title and fields', () => {
    const data = parseAgentCardJson(
      '{"title":"BTC-PERP","fields":[{"label":"24h","value":"+3.2%"}]}',
    );
    expect(data?.title).toBe('BTC-PERP');
    expect(data?.fields).toEqual([{ label: '24h', value: '+3.2%' }]);
  });

  it('normalizeAgentCardData accepts rows alias', () => {
    const data = normalizeAgentCardData({
      cardTitle: 'X',
      rows: [{ header: 'A', text: 'B' }],
    });
    expect(data?.title).toBe('X');
    expect(data?.fields).toEqual([{ label: 'A', value: 'B' }]);
  });

  it('parseAgentCardJson returns null for invalid JSON', () => {
    expect(parseAgentCardJson('not json')).toBeNull();
  });
});
