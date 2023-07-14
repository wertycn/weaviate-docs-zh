---
image: og/docs/concepts.jpg
sidebar_position: 23
title: Vector Indexing
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- :::caution 迁移自：
- 来自 `Vector Index (ANN) Plugins:Index` + `HNSW`
  - 注：`HNSW` 的配置选项现在在 `References: Configuration/Vector index#How to configure HNSW` 中 -->
::: -->

## Overview

This page explains what vector indices are, and what purpose they serve in Weaviate.

:::info Related pages
- [概念：索引](./indexing.md)
- [配置：索引](../configuration/indexes.md)
- [配置：模式（配置语义索引）](../config-refs/schema.md#configure-semantic-indexing)
## 介绍

Weaviate的向量优先存储系统通过向量索引处理所有存储操作。以向量优先的方式存储数据不仅可以进行语义或基于上下文的搜索，还可以在不降低性能的情况下存储*非常*大量的数据（假设水平扩展得好或索引具有足够的分片）。

## 为什么要将数据索引为向量？
现在，长长的数字列表本身并没有任何含义。但是，如果这个列表中的数字被选择为表示其他向量所表示的数据对象之间的[语义相似性](https://en.wikipedia.org/wiki/Semantic_similarity)，那么新的向量就包含了关于数据对象的含义和与其他数据的关系的信息。

为了使这个概念更具体化，可以将向量想象成一个*n*维空间中的坐标。例如，我们可以在一个二维空间中表示*单词*。如果使用一个从语料库中学习了单词之间关系或共现统计数据的算法（如[GloVe](https://github.com/stanfordnlp/GloVe)）来给单词分配坐标（向量），那么单词可以根据它们与其他单词的相似性来得到坐标（向量）。这些算法依赖于机器学习和自然语言处理的概念。在下面的图片中，您可以看到这个概念的简化形式。单词`Apple`和`Banana`彼此靠近。这两个单词之间的距离，由向量之间的距离表示，是很小的。但是这两种水果与单词`Newspaper`和`Magazine`之间的距离更远。

![2D向量可视化](./img/vectors-2d.svg "2D向量可视化")

另一种思考这个问题的方式是将产品放置在超市里。你会期望在`Apples`和`Bananas`附近找到`Apples`，因为它们都是水果。但是当你在寻找一个`Magazine`时，你会离开`Apples`和`Bananas`，更靠近例如`Newspapers`的走廊。这也是概念的语义可以存储在Weaviate中的方式，这取决于您使用的模块来计算向量中的数字。不仅可以将单词或文本作为向量索引，还可以将图像、视频、DNA序列等索引为向量。在此处阅读有关使用哪个模型的更多信息[/developers/weaviate/modules/index.md](/developers/weaviate/modules/index.md)。

![超市地图可视化](./img/supermarket.svg "超市地图可视化")

## 如何选择正确的向量索引类型
Weaviate支持的第一种向量存储类型是[HNSW](./vector-index.md#hnsw)，这也是默认的向量索引类型。HNSW的特点是在查询时非常快速，但在构建过程（添加具有向量的数据）时更耗费资源。如果您的用例对数据上传速度要求较高，而对查询时间和可扩展性要求较低，那么其他向量索引类型可能是更好的解决方案（例如[Spotify的Annoy](https://github.com/spotify/annoy)）。如果您想为新的索引类型做出贡献，可以随时与我们联系或向Weaviate发起拉取请求，并构建您自己的索引类型。敬请关注更新！

## 向量索引类型的配置
可以根据数据类别指定索引类型。目前唯一的索引类型是HNSW，因此除非在[data schema](/developers/weaviate/configuration/schema-configuration.md)中另有规定，否则所有数据对象都将使用HNSW算法进行索引。

以下是数据模式中类别向量索引配置的示例：[/developers/weaviate/configuration/schema-configuration.md](/developers/weaviate/configuration/schema-configuration.md)
{
  "class": "Article",
  "description": "string",
  "properties": [
    {
      "name": "title",
      "description": "string",
      "dataType": ["text"]
    }
  ],
  "vectorIndexType": " ... ",
  "vectorIndexConfig": { ... }
}
请注意，向量索引类型只指定了数据对象的向量是如何进行索引的，这用于数据检索和相似性搜索。数据向量的确定方式（向量包含的数值）由"vectorizer"参数指定，该参数指向一个[模块](/developers/weaviate/modules/index.md)，例如"text2vec-contextionary"（或者指定为"none"，如果您想导入自己的向量）。在数据模式配置中了解更多关于所有参数的信息[在这里](/developers/weaviate/configuration/schema-configuration.md)。

## Weaviate是否支持多个向量索引（ANN）类型？

* 简短回答：是的
* 较长回答：目前，我们在Weaviate中有一个[自定义实现](../more-resources/faq.md#q-does-weaviate-use-hnswlib)的HNSW，以实现Weaviate的[完全CRUD支持](https://db-engines.com/en/blog_post/87)。原则上，如果ANN算法允许完全CRUD支持，Weaviate就可以支持它。如果您对除HNSW之外的其他ANN索引类型有想法、建议或计划（例如研究项目），请在我们的[论坛](https://forum.weaviate.io)中告知我们。

## HNSW

[HNSW](https://arxiv.org/abs/1603.09320)是Weaviate支持的第一种向量索引类型。

### 什么是HNSW？

HNSW代表层次可导航小世界，是一个多层图。数据库中的每个对象都被捕获在最底层（图中的第0层）。这些数据对象之间的连接非常紧密。在最底层的每一层上方，表示的数据点较少。这些数据点与较低的层匹配，但每个更高的层中的数据点指数级减少。如果有一个搜索查询进来，最接近的数据点将在最高层中找到。在下面的示例中，只有一个更多的数据点。然后它进入更深的一层，并从最高层中找到的第一个数据点中搜索最近的数据点。在最深的层中，将找到与搜索查询最接近的实际数据对象。

如果没有层次结构，只有最深的层（0）存在，并且需要探索更多的数据点，因为所有的数据对象都存在于那里。在较高的层次中，由于较少的数据点，需要进行较少的数据跳跃，距离较远。HNSW是一种非常快速和内存高效的相似性搜索方法，因为只有最高层（顶层）保留在缓存中，而不是最底层的所有数据点。只有当它们被更高层请求时，最接近搜索查询的数据点才被加载，这意味着只需要保留很小一部分内存。

该图片显示了如何使用HNSW算法从顶层的搜索查询向量（蓝色）到最底层的最接近搜索结果（绿色）。只进行了三次数据跳跃（蓝色实线箭头），而如果没有这种分层结构（需要找到每层中的*所有*数据点的最接近数据点），则需要搜索更多的数据对象。

![HNSW层级](./img/hnsw-layers.svg "HNSW层级")

### 距离度量

在Weaviate中支持的所有[距离度量](/developers/weaviate/config-refs/distances.md)也适用于HNSW索引类型。

## HNSW与Product Quantization（PQ）

在使用HNSW时，您还可以选择使用Product Quantization（PQ）来压缩向量表示，以帮助减少内存需求。Product Quantization是一种技术，允许Weaviate的HNSW向量索引使用更少的字节存储向量。由于HNSW将向量存储在内存中，这使得在给定的内存量上运行更大的数据集成为可能。

需要注意的重要一点是，Product Quantization是在召回率和内存节省之间进行权衡。这意味着减少内存的配置设置也会减少召回率。这类似于如何通过配置其搜索参数(`ef`和`maxConnections`)来调整HNSW以降低延迟，但会降低召回率。有关如何配置PQ的更多信息，请参阅[配置：索引](../configuration/indexes.md)。

### 什么是PQ？

Product Quantization是一种减少存储在Weaviate中的向量内存使用的方法。Quantization是将一系列向量表示为有限的较小向量集的方法。一个熟悉的例子是将一个单一的数值四舍五入为最接近的整数。

在最接近邻居搜索的上下文中，[Product Quantization](https://ieeexplore.ieee.org/document/5432202)首先将向量分割为段（也称为子空间），然后每个段独立进行量化。

因此，假设我们有一个具有256个维度和8个段的浮点向量：

[ 256个维度 ]

首先将其分段并表示如下：

[ 32 ] [ 32 ] [ 32 ] [ 32 ] [ 32 ] [ 32 ] [ 32 ] [ 32 ]

然后我们使用一个码本对每个段进行量化。码本对于每个段都有一组质心，将每个段映射到这些质心。例如，如果第一个段最接近质心1，它将由id 1表示。

可能的质心数设置为256，因此这意味着我们现在只存储1个字节的信息加上码本的开销，而不是存储32个浮点数（128字节）。

[ id 1 ] [ id 23 ] [ id 195 ] [ id 128 ] [ id 1 ] [ id 43 ] [ id 7 ] [ id 50 ]

然后使用查询向量与对称地计算距离。这意味着我们计算距离的方式如下：`distance_pq(query_vector, quantized(store_vector))`，目标是在计算距离时保留查询向量中的所有信息。

Weaviate的HNSW实现假设在加载一些数据后会进行Product Quantization。原因是码本中找到的质心需要在现有数据上进行训练。

一个好的建议是在启用产品量化之前，每个shard加载10,000到100,000个向量。为了减少拟合时间，您还可以使用`trainingLimit`参数来限制PQ将拟合质心的最大向量数。
### 将现有类转换为使用PQ

您可以通过以下方式更改模式，将现有类转换为使用产品量化。*建议在启用之前先进行备份。*

client.schema.update_config("DeepImage", {
    "vectorIndexConfig": {
        "pq": {
            "enabled": True,
        }
    }
})
```

要了解有关PQ的其他配置设置的更多信息，请参阅[配置：索引](../configuration/indexes.md)中的文档
命令将立即返回，并在后台运行一个作业来转换索引。在此期间，索引将为只读状态。转换后，分片状态将返回为`READY`。

client.schema.get_class_shards("DeepImage")

[{'name': '1Gho094Wev7i', 'status': 'READONLY'}]
```

You can now query and write to the index as normal. The original vectors will be returned if using _additional { vector } but the distances will be slightly different due to the effects of quantization.

```python
client.query.get("DeepImage", ["i"]) \
	.with_near_vector({"vector": vector}) \
	.with_additional(["vector", "distance"]) \
	.with_limit(10).do()

{'data': {'Get': {'DeepImage': [{'_additional': {'distance': 0.18367815},
     'i': 64437},
    {'_additional': {'distance': 0.18895388}, 'i': 97342},
    {'_additional': {'distance': 0.19454134}, 'i': 14852},
    {'_additional': {'distance': 0.20019263}, 'i': 84393},
    {'_additional': {'distance': 0.20580399}, 'i': 71091},
    {'_additional': {'distance': 0.2110992}, 'i': 15182},
    {'_additional': {'distance': 0.2117207}, 'i': 92370},
    {'_additional': {'distance': 0.21241724}, 'i': 98583},
    {'_additional': {'distance': 0.21241736}, 'i': 8064},
    {'_additional': {'distance': 0.21257097}, 'i': 537}]}
```

As an example please refer to the example below for the different parameters that can be set to further configure PQ:

```python
client.schema.update_config("DeepImage", {
    "vectorIndexConfig": {
        "pq": {
            "enabled": True, # 默认为False
            "segments": 32, # 默认为维度数
            "encoder": {
                "type": "kmeans"  # 默认为kmeans
            }
        }
    }
})
```

### Encoders
In the configuration above you can see that you can set the `encoder` object to specify how the codebook centroids are generated. Weaviate’s PQ supports using two different encoders. The default is `kmeans` which maps to the traditional approach used for creating centroid.

Alternatively, there is also the `tile` encoder. This encoder is currently experimental but does have faster import times and better recall on datasets like SIFT and GIST. The `tile` encoder has an additional `distribution` parameter that controls what distribution to use when generating centroids. You can configure the encoder by setting `type` to `tile` or `kmeans` the encoder creates the codebook for product quantization. For more details about configuration please refer to [Configuration: Indexes](../configuration/indexes.md).

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />