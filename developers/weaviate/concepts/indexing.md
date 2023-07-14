---
image: og/docs/concepts.jpg
sidebar_position: 20
title: Indexing
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Related pages
- [Concepts: Vector Indexing](./vector-index.md)
- [Configuration: Indexes](../configuration/indexes.md)
:::

## 简介

Weaviate支持两种类型的索引。

1. **近似最近邻索引（ANN索引）** - ANN索引用于处理所有向量搜索查询。
2. **倒排索引** - 倒排索引允许按属性进行过滤，并提供BM25查询。

您可以在Weaviate中为每个类别配置索引。Weaviate的核心优势之一是将ANN索引与倒排索引相结合。

请注意以下几点：

* 对于大型数据集，配置索引非常重要，因为索引的数量越多，需要的存储空间就越多。
* 一个经验法则是，如果您不在特定字段或向量空间上进行查询，则不要对其进行索引。
* Weaviate的一个独特功能是索引的配置方式（了解更多信息，请点击[这里](../concepts/prefiltering.md)）。

### ANN索引化

需要知道的重要一点是，ANN中的"A"（即"approximate"）带来了一个权衡。也就是说，索引是_近似_的，因此并不总是100%准确。这就是专家在谈论算法的"召回率"时所指的意思。

:::tip
There are different ANN algorithms, you can find a nice overview of them on <a href="http://ann-benchmarks.com/" data-proofer-ignore>this website</a>. Only those algorithms which support [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) can be used in Weaviate (we want that sweet database UX) and Weaviate's ANN system is [completely plug-and-playable](../concepts/index.md#weaviate-architecture) so that we can always add other algorithms in the future.
:::

<!-- TODO: 不确定我们是否需要在这里 -->
<!-- 如果您总是想要完全回忆（即100%回忆，不要与阿诺德·施瓦辛格的电影混淆），那么您需要进行超级慢速（真的非常慢）的蛮力向量比较，这对于生产环境来说并不实用（因此存在ANN算法）。 -->

:::note
Because vector search use cases are growing rapidly, more and more ANN-algorithm are produced. A "good" ANN algorithm means that the recall is high _and_ that it's fast. You can dive into the rabbit hole right [here](https://arxiv.org/search/?query=approximate+nearest+neighbor&searchtype=all). But! Don't be like Alice; just make sure to come back here.
:::

让我们来看一个示例模式中的几个ANN设置。

（请注意，我们已经删除了与当前主题无关的一些JSON代码。）

```js
{
    "classes": [
        {
            "class": "Publication",
            "properties": [],
            "vectorIndexType": "hnsw" // <== the current ANN algorithm
            "vectorIndexConfig": { // <== the vector index settings
                "skip": false,
                "cleanupIntervalSeconds": 300,
                "pq": {"enabled": False,}
                "maxConnections": 64,
                "efConstruction": 128,
                "ef": -1,
                "dynamicEfMin": 100,
                "dynamicEfMax": 500,
                "dynamicEfFactor": 8,
                "vectorCacheMaxObjects": 2000000,
                "flatSearchCutoff": 40000,
                "distance": "cosine"
            }
        },
        { } // <== the Author class
    ]
}
```

如上所示，ANN索引提供了许多可配置的参数。修改这些参数可以影响Weaviate的性能，例如在召回性能和查询时间之间的权衡，或者在查询时间和导入时间之间的权衡。

在下面了解更多：
- [配置向量索引](../configuration/indexes.md)
- [向量索引解释](../concepts/vector-index.md)

:::note
The [ANN benchmark page](/developers/weaviate/benchmarks/ann.md) contains a wide variety of vector search use cases and relative benchmarks. This page is ideal for finding a dataset similar to yours and learning what the most optimal settings are.
:::

## 模块配置
<!-- TODO: 检查是否可以移除。感觉是重复的。 -->

您可以使用带有或不带有模块的 Weaviate。要使用带有模块的 Weaviate，您必须在模式中配置它们。

一个示例配置：

```js
{
    "class": "Author",
    "moduleConfig": { // <== module config on class level
        "text2vec-transformers": { // <== the name of the module (in this case `text2vec-transformers`)
            // the settings based on the choosed modules
        }
    },
    "properties": [ ]
}
```

使用向量化器时，您需要在类和属性级别上设置向量化。如果您使用文本向量化器，关于向量化器工作原理的解释在[这里](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md#configure-semantic-indexing)。

```js
{
    "class": "Author",
    "moduleConfig": { // <== class level configuration
        "text2vec-transformers": { // <== name of the module
            "vectorizeClassName": false // <== vectorize the class name?
        }
    },
    "properties": [{
        "moduleConfig": { // <== property level configuration
            "text2vec-transformers": { // <== name of the module
                "skip": false, // <== skip this `string` for vectorization?
                "vectorizePropertyName": false // <== vectorize the property name?
            }
        },
        "dataType": [
            "text"
        ],
        "name": "name"
    }]
}
```

:::note
Because Weaviate's vectorizer module configuration is set on class and property level, you can have multiple vectorizers for different classes. You can even mix multimodal, NLP, and image modules.
:::

## 总结

* 针对您的用例需要设置ANN索引（尤其是如果您有一个大型数据集）
* 根据您的用例可以启用或禁用索引
* 您可以在模式中配置Weaviate模块

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />