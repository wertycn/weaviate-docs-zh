---
image: og/docs/configuration.jpg
sidebar_position: 4
title: Distance metrics
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Related pages
- [Configuration: Schema](../configuration/schema-configuration.md)
- [References: REST API: Schema](../api/rest/schema.md)
- [Concepts: Data Structure](../concepts/data.md)
:::

## 可用的距离度量标准

如果没有显式指定，默认的距离度量标准是`cosine`。可以将其作为模式的一部分，在vectorIndexConfig字段中进行[设置](/developers/weaviate/configuration/indexes.md#how-to-configure-hnsw)（这里是一个[向模式中添加类的示例](../api/rest/schema.md#create-a-class)），适用于以下任何类型：

:::tip Comparing distances
In all cases, larger distance values indicate lower similarity. Conversely, smaller distance values indicate higher similarity.
:::

<!-- TODO: Consider removing {:.text-nowrap} -->
| 名称 | 描述 | 定义 | 范围 | 示例 |
| --- | --- | --- | --- | --- |
| <span style={{ whiteSpace: 'nowrap' }}>`cosine`</span> | 余弦（角度）距离。<br/><sub>[请参考下文注释 1]</sub> | <span style={{ whiteSpace: 'nowrap' }}>`1 - cosine_sim(a,b)`</span> | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d <= 2`</span> | `0`: 向量相同<br/><br/> `2`: 反向向量。 |
| <span style={{ whiteSpace: 'nowrap' }}>`dot`</span> | 基于点积的距离指示。 <br/><br/>更确切地说，是负的点积。 <br/><sub>[见下面的注释2]</sub> | <span style={{ whiteSpace: 'nowrap' }}>`-dot(a,b)`</span> | <span style={{ whiteSpace: 'nowrap' }}>`-∞ < d < ∞`</span> | `-3`: 比`-2`更相似 <br/><br/>`2`: 比`5`更相似 |
| <span style={{ whiteSpace: 'nowrap' }}>`l2-squared`</span> | 两个向量之间的欧几里德距离的平方。 | <span style={{ whiteSpace: 'nowrap' }}>`sum((a_i - b_i)^2)`</span> | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d < ∞`</span> | `0`: 向量相同 |
| `hamming` | 向量在每个维度上的差异数量。 | `sum(|a_i != b_i|)` | `0 <= d < ∞` | `0`: 相同的向量 |
| <span style={{ whiteSpace: 'nowrap' }}>`manhattan`</span> | 两个向量维度之间沿着垂直轴测量的距离。 | <span style={{ whiteSpace: 'nowrap' }}><code>sum(&#124;a_i - b_i&#124;)</code></span> | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d < dims`</span> | `0`: 相同的向量 |

如果您想要添加您喜欢的距离类型并将其贡献给Weaviate，我们将非常乐意审查您的[PR](https://github.com/weaviate/weaviate)。

:::note Additional notes

1. If `cosine` is chosen, all vectors are normalized to length 1 at import/read time and dot product is used to calculate the distance for computational efficiency.
2. Dot Product on its own is a similarity metric, not a distance metric. As a result, Weaviate returns the negative dot product to stick with the intuition that a smaller value of a distance indicates a more similar result and a higher distance value indicates a less similar result.

:::

### 距离计算和优化

在典型的Weaviate使用情况下，CPU时间的大部分都用于计算向量距离。即使使用了近似最近邻索引，从而减少了计算量，距离计算的效率对[整体性能](/developers/weaviate/benchmarks/ann.md)也有重大影响。

您可以使用以下概述来找到最佳的距离度量和CPU架构/指令集的组合。

| 距离 | `linux/amd64 AVX2` | `darwin/amd64 AVX2` | `linux/amd64 AVX512` | `linux/arm64` | `darwin/arm64` |
| --- | --- | --- | --- | --- | --- |
| `余弦` | [优化版本](https://github.com/weaviate/weaviate/blob/master/adapters/repos/db/vector/hnsw/distancer/asm/dot_amd64.s) | [优化版本](https://github.com/weaviate/weaviate/blob/master/adapters/repos/db/vector/hnsw/distancer/asm/dot_amd64.s) | 无SIMD | 无SIMD | 无SIMD |
| `dot` | [优化](https://github.com/weaviate/weaviate/blob/master/adapters/repos/db/vector/hnsw/distancer/asm/dot_amd64.s) | [优化](https://github.com/weaviate/weaviate/blob/master/adapters/repos/db/vector/hnsw/distancer/asm/dot_amd64.s) | 无SIMD | 无SIMD | 无SIMD |
| `l2-squared` | [优化](https://github.com/weaviate/weaviate/blob/master/adapters/repos/db/vector/hnsw/distancer/asm/l2_amd64.s) | [优化](https://github.com/weaviate/weaviate/blob/master/adapters/repos/db/vector/hnsw/distancer/asm/l2_amd64.s) | 无SIMD | 无SIMD | 无SIMD |
| `hamming` | 无SIMD | 无SIMD | 无SIMD | 无SIMD | 无SIMD |
| `manhattan` | 无SIMD | 无SIMD | 无SIMD | 无SIMD | 无SIMD |

如果您喜欢处理汇编程序、SIMD和矢量指令集，我们非常欢迎您为尚未接受SIMD特定优化的组合之一做出贡献。

### API中的距离字段

`distance`在API中以两种方式公开：

* 每当涉及到向量搜索时，距离可以作为结果的一部分显示，例如使用 <span style={{ whiteSpace: 'nowrap' }}>`_additional { distance }`</span>
* 每当涉及到向量搜索时，可以将距离指定为限制条件，例如使用<span style={{ whiteSpace: 'nowrap' }}>`nearVector({distance: 1.5, vector: ... })`</span>

注意：`distance`字段是在`v1.14.0`版本中引入的。在之前的版本中，只有`certainty`（见下文）可用。

### 距离 vs 确定性

在`v1.14`版本之前，API中只有`certainty`可用。
`certainty`的原始想法是将距离得分归一化为`0 <= certainty <= 1`之间的值，其中1表示相同的向量，0表示相反的向量。

然而，这个概念只适用于`cosine`距离。对于其他距离度量，得分可能是无界的。因此，更推荐使用`distance`而不是`certainty`。

为了向后兼容，当距离是...时，仍然可以使用`certainty`。
`cosine`。如果选择了其他距离，则无法使用`certainty`。

另请参阅[距离和确信度_additional{}属性](../api/graphql/additional-properties.md)。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />