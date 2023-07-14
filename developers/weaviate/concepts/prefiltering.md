---
image: og/docs/concepts.jpg
sidebar_position: 26
title: Filtered Vector Search
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Related pages
- [References: GraphQL API](../api/graphql/index.md)
:::

## 简介

Weaviate提供了强大的向量搜索功能，可以根据个别属性在“模糊”的向量搜索中消除候选项。由于Weaviate的高效预过滤机制，即使过滤器非常严格，也可以保持高召回率。此外，与未经过滤的向量搜索相比，该过程高效且开销最小。

## 后过滤 vs 前过滤

无法使用预过滤的系统通常需要使用后过滤。这是一种先执行向量搜索，然后移除不符合过滤条件的结果的方法。这会导致两个主要的缺点：

1. 无法轻易预测搜索结果中会包含多少元素，因为过滤器是应用于已经减少的候选列表上的。

2. 如果筛选器非常严格，即与数据集大小相比仅匹配一小部分数据点，那么原始向量搜索可能根本没有任何匹配项。

通过预过滤可以克服后过滤的限制。预过滤是一种在开始向量搜索之前确定合格候选人的方法。然后，向量搜索仅考虑出现在“允许”列表上的候选人。

:::note
Some authors make a distinction between "pre-filtering" and "single-stage filtering" where the former implies a brute-force search and the latter does not. We do not make this distinction, as Weaviate does not have to resort to brute-force searches, even when pre-filtering due to the its combined inverted index and HNSW index.
:::

## Weaviate中高效的预过滤搜索

在关于存储的部分，[我们详细描述了Weaviate中组成分片的各个部分](./storage.md)。尤其值得注意的是，每个分片旁边都包含一个倒排索引和HNSW索引。这样可以实现高效的预过滤。具体过程如下：

1. 使用倒排索引（类似于传统搜索引擎）创建一个允许列表，该列表实际上是一个`uint64` id的列表，因此它可以在不损失效率的情况下变得非常庞大。
2. 进行向量搜索，其中将允许列表传递给HNSW索引。索引会按照节点的边缘正常移动，但只会将存在于允许列表中的ID添加到结果集中。搜索的终止条件与未过滤搜索相同：当达到所需限制并且额外的候选项不再改善结果质量时，搜索将停止。

### 使用Roaring Bitmaps进行预过滤

:::info Available for Weaviate versions `1.18` and up
:::

Weaviate版本`1.18.0`及以上使用`RoaringSet`数据类型来使用Roaring Bitmaps。Roaring Bitmaps采用各种策略来提高效率，它将数据分成块，并对每个块应用适当的存储策略。这样可以实现高度的数据压缩和集合操作速度，从而提高Weaviate的过滤速度。

如果您处理的是大型数据集，这可能会显着提高过滤性能，因此我们鼓励您进行迁移和重新索引。

此外，我们的团队会维护我们的底层Roaring Bitmap库，以解决任何问题并进行必要的改进。

#### 用于`text`属性的Roaring Bitmaps

:::info Available for Weaviate versions `1.19` and up
:::

从`1.19`版本开始，可以使用基于`text`属性的Roaring位图索引，该索引使用两个独立的（`filterable`和`searchable`）索引实现，取代了现有的单个索引。您可以配置新的`indexFilterable`和`indexSearchable`参数来确定是否分别创建Roaring位图索引和适用于BM25的Map索引（默认情况下都启用）。

#### 迁移到Roaring位图索引

如果您使用的是Weaviate版本 `< 1.18.0`，您可以通过迁移到 `1.18.0` 或更高版本，并进行一次性的过程来创建新的索引，从而利用Roaring Bitmaps。一旦您的Weaviate实例创建了Roaring Bitmap索引，它将在后台运行，以加快您的工作速度。

这种行为是通过<code>REINDEX_SET_TO_ROARINGSET_AT_STARTUP</code> [环境变量](../config-refs/env-vars.md)设置的。如果您不希望进行重建索引，您可以在升级之前将其设置为`false`。

## 预过滤搜索回顾

由于Weaviate的自定义HNSW实现，在正常遍历HNSW图中的所有链接并仅在考虑结果集时应用过滤条件的情况下，保持了图的完整性。经过过滤的搜索的召回率通常不会比未经过滤的搜索差。

下图显示了不同限制程度的筛选器。从左边（匹配数据集的100%）到右边（匹配数据集的1%），筛选器的限制程度逐渐增加，同时不会对具有筛选器的 `k=10`、 `k=15` 和 `k=20` 的向量搜索的召回率产生负面影响。

![筛选向量搜索的召回率](./img/recall-of-filtered-vector-search.png "在Weaviate中筛选向量搜索的召回率")

## 平坦搜索截断

版本 `v1.8.0` 引入了自动切换到平面（暴力）向量搜索的能力，当筛选器变得过于严格时。这种情况只适用于组合的向量和标量搜索。关于为什么HNSW在某些筛选器上需要切换到平面搜索的详细解释，请参阅 [towards data science](https://towardsdatascience.com/effects-of-filtered-hnsw-searches-on-recall-and-latency-434becf8041c) 中的文章。简而言之，如果一个筛选器非常严格（即数据集的匹配百分比很小），HNSW遍历将变得穷尽。换句话说，筛选器变得越严格，HNSW的性能越接近对整个数据集进行暴力搜索。然而，对于这么严格的筛选器，我们已经将数据集缩小到了一个很小的部分。因此，如果性能已经接近于暴力搜索，那么只在匹配的子集上进行搜索要比在整个数据集上进行搜索效率更高。

下图显示了具有不同限制性的筛选器。从左侧（0%）到右侧（100%），筛选器的限制性逐渐增加。**截断点设置为数据集大小的约15%**。这意味着虚线右侧使用了蛮力搜索。

![使用平坦搜索截断的预过滤](./img/prefiltering-response-times-with-filter-cutoff.png "使用平坦搜索截断的预过滤")

作为对比，如果只使用纯HNSW而没有截断，相同的筛选器会如下所示:

![使用纯HNSW进行预过滤](./img/prefiltering-pure-hnsw-without-cutoff.png "没有截断的预过滤，即纯HNSW")

截断值可以作为每个类别在模式中的`vectorIndexConfig`设置的一部分进行配置。

<!-- TODO - 使用更新后的post-roaring位图图表替换图表 -->

:::note Performance improvements from roaring bitmaps
From `v1.18.0` onwards, Weaviate implements 'Roaring bitmaps' for the inverted index which decreased filtering times, especially for large allow lists. In terms of the above graphs, the *blue* areas will be reduced the most, especially towards the left of the figures.
:::

## 可缓存的筛选器

从 `v1.8.0` 版本开始，筛选器的倒排索引部分可以被缓存和重用，甚至可以跨不同的向量搜索。如上面的章节所述，预过滤是一个两步骤的过程。首先，查询倒排索引并检索潜在匹配项。然后将此列表传递给HNSW索引。在以下情况下，从磁盘上读取潜在匹配项（步骤1）可能成为瓶颈：

* 当大量的ID与筛选器匹配时，
* 当使用复杂的查询操作（例如通配符、长筛选链）时
如果倒排索引的状态自上次查询以来没有更改，现在可以重用这些“允许列表”。

:::note
Even with the filter portion from cache, each vector search is still performed at query time. This means that two previously unseen vector searches can still make use of the cache as long as they use the same filter.
:::

示例:

```graphql
# search 1
where: {
  operator: Equal
  path: ["publication"]
  valueText: "NYT"
}
nearText: {
  concepts: ["housing prices in the western world"]
}

# search 2
where: {
  operator: Equal
  path: ["publication"]
  valueText: "NYT"
}
nearText: {
  concepts: ["where do the best wines come from?"]
}
```

这两个语义查询之间的关联非常小，很可能在结果中没有重叠。然而，由于标量过滤器（`publication==NYT`）在两个查询中都相同，因此可以在第二个查询中重复使用。这使得第二个查询与未经过滤的向量搜索一样快。

## 缓存过滤器的向量搜索性能

以下内容是在一个包含1百万个对象的数据集上以单线程方式运行的（即可以增加更多的CPU线程以提高吞吐量），其中每个对象都具有384维的随机向量，并配备了一个预热的过滤器缓存（`Roaring bitmap`实现）。

请注意，每次搜索都使用完全唯一的（随机）搜索向量，这意味着只有过滤器部分被缓存，而向量搜索部分没有被缓存，即在`count=100`的情况下，使用了100个唯一的查询向量和相同的过滤器。

<!-- TODO - 用更新后的 post-roaring bitmaps 图表替换表格 -->

[![使用缓存的筛选向量搜索性能](./img/filtered-vector-search-with-caches-performance.png "使用 1M 384d 对象的筛选向量搜索性能")](./img/filtered-vector-search-with-caches-performance.png)

:::note
Wildcard filters show considerably worse performance than exact match filters. This is because - even with caching - multiple rows need to be read from disk to make sure that no stale entries are served when using wildcards. See also "Automatic Cache Invalidation" below.
:::

## 自动缓存失效

缓存的构建方式是不会提供过期的条目。对倒排索引的任何写入操作都会更新特定行的哈希值。这个哈希值被用作缓存中的键的一部分。这意味着如果底层的倒排索引被更改，新的查询将首先读取更新后的哈希值，然后遇到缓存未命中（而不是提供过期的条目）。缓存的大小是固定的，当缓存已满时，过期的哈希值的条目将被覆盖。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />