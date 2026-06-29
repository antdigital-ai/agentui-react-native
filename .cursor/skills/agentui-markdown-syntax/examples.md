# Agent UI markdown — examples

## Full assistant reply (markdown only)

```markdown
Here is my analysis of BTC

#### What it is

Largest smart-contract platform by TVL; ETH is its native gas and staking asset.

**BTC-PERP**

##### Subtext

**72,732.45** · -2.63%

| header | value |
| --- | --- |
| 24H Volume | $456.20 M |
| Open Interest | $89.40 M |
| Funding Rate | +0.01% / 8H |
| 24H Change | <font color="#FF5B5B">+13.05</font> |

#### Bull Case

- Expanding spot-ETF access broadens demand
- Recovering L2 fees; staking locks up float

Official docs: [https://arbitrum.io/](https://arbitrum.io/)
```

Use `layoutDensity="compact"` on `MarkdownRenderer` for link styling aligned with mobile Figma demos.

## Same metrics as agent-card

````markdown
Summary below.

```agent-card
{
  "title": "BTC-PERP",
  "subtitle": "Perp · Trade",
  "highlight": "72,732.45 · -2.63%",
  "fields": [
    { "label": "24H Volume", "value": "$456.20 M" },
    { "label": "Open Interest", "value": "$89.40 M" },
    { "label": "Funding Rate", "value": "+0.01% / 8H" },
    { "label": "24H Change", "value": "+13.05" }
  ]
}
```

#### Current trend & events

**Up 1.8% over 24h** with a risk-on market.
````

## ChatMessage shape (host app)

```ts
const messages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Analyze BTC' },
  {
    id: '2',
    role: 'assistant',
    content: assistantMarkdownString,
    streaming: true,
    isFinished: false,
    thinking: {
      status: 'thinking',
      body: 'Pull BTC spot and perp metrics…',
      defaultExpanded: false,
    },
  },
];
```

## Custom card renderer

```tsx
<MarkdownRenderer
  content={fromApi}
  components={{
    agentCard: ({ data }) => <MyApiCard title={data.title} rows={data.fields} />,
  }}
/>
```

## API returning JSON only

Host can inject the fence:

```ts
function wrapAgentCard(payload: object): string {
  return '```agent-card\n' + JSON.stringify(payload) + '\n```';
}
```
