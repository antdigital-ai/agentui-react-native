/**
 * Copy from Figma 首页 Home —「Crypto Analysis - crypto」chat `675:23865`.
 * Assistant reply text matches design; think row uses `ChatMessage.thinking` + `DeepThinking`.
 */
export const FIGMA_HOME_USER_MESSAGE = 'Please help me analyze the assets';

/** Expandable reasoning — Figma think body `675:23594` (12px caption, lh 1.8). */
export const FIGMA_HOME_THINKING_BODY = `正在将您的仓位分析请求发送给专业分析代理...

正在处理您的请求...正在处理您的请求...

正在处理您的请求...

正在处理您的请求...

正在处理您的请求...

# Portfolio Review: Risk Exposure

Here's how your portfolio looks right now

\`\`\`agent-card
{"cardType":"portfolioReview","title":"Portfolio Review","highlight":"$121.63","subtitle":null,"totalValue":"$121.63","changeValue":null,"changePercentage":null,"prices":[0.0,121.6265,121.63],"legendTitle":"1D","allocations":[{"category":"Earn","label":"syrupUSDT","value":"$79.25","proportion":65.2},{"category":"Earn","label":"syrupUSDC","value":"$35.13","proportion":28.9},{"category":"Spot","label":"NTBILL","value":"$3.37","proportion":2.8},{"category":"Spot","label":"USDT","value":"$2.00","proportion":1.6},{"category":"Spot","label":"ETH","value":"$1.46","proportion":1.2},{"category":"Spot","label":"USDC","value":"$0.42","proportion":0.3}]}
\`\`\`

| Metric | Snapshot | Read |
|---|---:|---|
| Risk level | HIGH（年化波动率 94.89%） | 当前组合风险等级为 HIGH，主要由高波动率驱动 |
| Top concentration | syrupUSDT 占比 65.2% | 单一资产占据组合三分之二，对整体结果影响显著 |
| Concentration index | HHI = 0.5092（高度集中） | 少数资产主导整体波动，分散化程度低 |
| Risk range | 年化波动率 94.89%，VaR(95%) 9.83% | 短期波动区间较大，95% 置信度下估计损失边界约 9.83% |
| Drawdown estimate | 预估最大回撤 19.67% | 这是基于当前波动率的估计值，不是历史真实最大回撤 |
| Data coverage | 相关性指标不可用；已过滤 4 项测试网资产（约 $14,071.55） | 历史价格数据不足，相关性分析暂不可用；测试网资产不计入本次分析 |

你的组合总资产约 $121.63，包含 6 个持仓标的。产品类型上，Earn 占比 94.04%（syrupUSDT 和 syrupUSDC），Spot 占比 5.96%（NTBILL、USDT、ETH、USDC）。链分布上，Ethereum 占 97.23%，Plume 占 2.77%。收益结构方面，虽然 Earn 占比很高，但当前加权 APY 为 0.0%，意味着这部分资产暂未产生链上收益。闲置资产占比 5.96%。

## What this means

**集中度**：你的 HHI 指数为 0.5092，属于"高度集中"区间（> 0.25）。这意味着组合中少数资产占据了绝大部分权重，单一标的的波动会对整体产生显著影响。

**风险等级**：当前组合年化波动率为 94.89%，对应风险等级 HIGH。你的风险偏好设定为 Balanced（可接受 LOW / MODERATE），当前等级超出了你设定的可接受区间。

**VaR 与预估最大回撤**：VaR(95%) 为 9.83%，表示在 95% 置信度下，短期估计损失边界约为 9.83%。预估最大回撤约为 19.67%（2 × VaR），这是基于当前波动率的理论估计，不是历史真实发生的最大回撤。

**相关性**：由于历史价格数据不足，无法计算资产之间的相关系数，因此无法判断是否存在"伪分散"（名义上持有多个标的但方向趋同）。

## 现状 vs 你的设定

- 当前组合风险等级 **HIGH**，高于你风险标签 **Balanced** 对应区间（可接受 LOW / MODERATE）。

## 可了解的选项

- [Understand concentration] — 集中度和 HHI 是什么，为什么分散化重要
- [Understand VaR] — VaR 与预估最大回撤是什么意思
- [View your positions] — 查看持仓明细
- [Explore Earn options] — Earn 是什么、有哪些类型、怎么运作

是否调整由你决定。

> 以上为信息与分析，投资决策请你自行判断。`;

export const FIGMA_HOME_ASSISTANT_MARKDOWN = `Here is my analysis of BTC

Here is my analysis of BTC

| Metric | Snapshot | Read |
|---|---:|---|
| Risk level | HIGH（年化波动率 94.89%） | 当前组合风险等级为 HIGH，主要由高波动率驱动 |
| Top concentration | syrupUSDT 占比 65.2% | 单一资产占据组合三分之二，对整体结果影响显著 |
| Concentration index | HHI = 0.5092（高度集中） | 少数资产主导整体波动，分散化程度低 |
| Risk range | 年化波动率 94.89%，VaR(95%) 9.83% | 短期波动区间较大，95% 置信度下估计损失边界约 9.83% |
| Drawdown estimate | 预估最大回撤 19.67% | 这是基于当前波动率的估计值，不是历史真实最大回撤 |
| Data coverage | 相关性指标不可用；已过滤 4 项测试网资产（约 $14,071.55） | 历史价格数据不足，相关性分析暂不可用；测试网资产不计入本次分析 |

你的组合总资产约 $121.63，包含 6 个持仓标的。产品类型上，Earn 占比 94.04%（syrupUSDT 和 syrupUSDC），Spot 占比 5.96%（NTBILL、USDT、ETH、USDC）。链分布上，Ethereum 占 97.23%，Plume 占 2.77%。收益结构方面，虽然 Earn 占比很高，但当前加权 APY 为 0.0%，意味着这部分资产暂未产生链上收益。闲置资产占比 5.96%。

## What this means

**集中度**：你的 HHI 指数为 0.5092，属于"高度集中"区间（> 0.25）。这意味着组合中少数资产占据了绝大部分权重，单一标的的波动会对整体产生显著影响。

**风险等级**：当前组合年化波动率为 94.89%，对应风险等级 HIGH。你的风险偏好设定为 Balanced（可接受 LOW / MODERATE），当前等级超出了你设定的可接受区间。

**VaR 与预估最大回撤**：VaR(95%) 为 9.83%，表示在 95% 置信度下，短期估计损失边界约为 9.83%。预估最大回撤约为 19.67%（2 × VaR），这是基于当前波动率的理论估计，不是历史真实发生的最大回撤。

**相关性**：由于历史价格数据不足，无法计算资产之间的相关系数，因此无法判断是否存在"伪分散"（名义上持有多个标的但方向趋同）。

## 现状 vs 你的设定

- 当前组合风险等级 **HIGH**，高于你风险标签 **Balanced** 对应区间（可接受 LOW / MODERATE）。

## 可了解的选项

- [Understand concentration] — 集中度和 HHI 是什么，为什么分散化重要
- [Understand VaR] — VaR 与预估最大回撤是什么意思
- [View your positions] — 查看持仓明细
- [Explore Earn options] — Earn 是什么、有哪些类型、怎么运作

是否调整由你决定。

> 以上为信息与分析，投资决策请你自行判断



#### What it is

Largest smart-contract platform by TVL; ETH is its native gas and staking asset.

**BTC-PERP**

##### Subtext

**72,732.45** · <font color="#FF5B5B">-2.63%</font>

| header | value |
| --- | --- |
| 24H Volume | $456.20 M |
| Open Interest | $89.40 M |
| Funding Rate | +0.01% / 8H |
| 24H Change | +13.05 |

Perp · Trade

#### Current trend & events

**Up 1.8% over 24h with a risk-on market. A major L2 upgrade landed this week; staking ratio**

##### Bull Case

- Expanding spot-ETF access broadens demand
- Recovering L2 fees; staking locks up float

##### Bear Case

- Expanding spot-ETF access broadens demand
- Recovering L2 fees; staking locks up float

#### Your holding

You hold ETH (~28% of portfolio). An unlock in ~7d adds near-term supply; portfolio sensitivity to ETH is elevated.

- CPI's effect on crypto?
- What's ETF net inflow and outflow?

###### 以上服务由TopNod提供，不是投资建议
`;
