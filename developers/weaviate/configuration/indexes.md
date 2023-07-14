---
image: og/docs/configuration.jpg
sidebar_position: 13
title: Indexes
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- :::caution 迁移自:
- 添加关于配置选项的文本，来自于 `Vector index plugins/HNSW` -->
::: -->

:::info Related pages
- [概念：索引](../concepts/indexing.md)
- [概念：向量索引](../concepts/vector-index.md)
## 向量索引

Weaviate的向量优先存储系统通过向量索引处理所有的存储操作。以向量优先的方式存储数据不仅可以实现语义或基于上下文的搜索，还可以在不降低性能的情况下存储*非常*大量的数据（假设水平扩展良好或索引具有足够的分片）。

## Weaviate的向量索引
Weaviate支持的第一个向量索引是[HNSW](/developers/weaviate/concepts/vector-index.md#hnsw)，也是默认的向量索引类型。HNSW的典型特点是在查询时非常快速，但在构建过程中（添加带有向量的数据）成本较高。如果您的用例更看重快速的数据上传而不是超快的查询时间和高伸缩性，那么其他向量索引类型可能是一个更好的解决方案（例如[Spotify的Annoy](https://github.com/spotify/annoy)）。如果您想贡献一个新的索引类型，可以随时与我们联系或向Weaviate发起拉取请求并构建自己的索引类型。敬请关注更新！

### 如何配置HNSW
目前唯一的索引类型是HNSW，因此除非在[data schema](/developers/weaviate/configuration/schema-configuration.md)中另外指定，否则所有的数据对象都将使用HNSW算法进行索引。

- `vectorIndexType`是您要使用的ANN算法。默认情况下，Weaviate选择`hnsw`，即Hierarchical Navigable Small World（HNSW）算法。
- `"vectorIndexConfig"`：这是一个对象，您可以在其中为所选的向量索引类型设置特定参数，例如hnsw，它具有以下参数：
  - `"distance"`：用于计算任意两个向量之间距离的距离度量标准。默认值为`cosine`。请查看[支持的度量标准](/developers/weaviate/config-refs/distances.md)。
  - `"ef"`：选择更高的`ef`，搜索将变得更准确，但也会变得更慢。这有助于在HNSW中实现召回/性能权衡。如果忽略设置此字段，它将默认为`-1`，表示“让Weaviate选择正确的`ef`值”。`ef`可以随时间而更新，不像`efConstruction`和`maxConnections`那样不可变。
  - `"efConstruction"`：控制索引搜索速度/构建速度的权衡。这个权衡在导入时发挥作用。因此，较高的`efConstruction`意味着您可以降低`ef`设置，但导入速度将变慢。默认设置为128，整数应大于0。此设置在类初始化后是不可变的。
  - `"maxConnections"`：每个元素在所有层中的最大连接数。默认设置为64，整数应大于0。此设置在类初始化后是不可变的。
  - `"dynamicEfMin"`：如果使用动态的`ef`（设置为`-1`），此值充当下限。即使限制足够小以建议较低的值，`ef`也永远不会低于此值。即使设置非常低的限制，如1、2或3，这有助于保持搜索准确性较高。*在`v1.10.0`之前不可用。默认值为`100`。如果`ef`的值不是`-1`，此设置无效。*
  - `"dynamicEfMax"`：如果使用动态的`ef`（设置为`-1`），此值充当上限。即使限制足够大以建议较低的值，`ef`也会被限制在此值。当检索大量搜索结果集（例如500+）时，这有助于保持搜索速度合理。请注意，如果限制本身高于此最大值，则最大值不会产生任何影响。在这种情况下，限制将被选择为`ef`，以避免`limit`大于不可能出现的`ef`的情况。*在`v1.10.0`之前不可用。默认为`500

{
  "class": "Article",
  "description": "字符串",
  "properties": [
    {
      "name": "title",
      "description": "字符串",
      "dataType": ["文本"]
    }
  ],
  "vectorIndexType": "hnsw",
  "vectorIndexConfig": {
    "skip": false,
    "ef": 100,
    "efConstruction": 128,
    "maxConnections": 64,
  }
}
```

### 配置提示

现在您可能会想："我在我的用例中需要哪些设置？"

为了确定这一点，您需要问自己以下问题，并在下表中比较您的答案：

1. 我预计每秒有多少个查询？
2. 我预计会有很多的导入或更新操作吗？
3. 召回率应该设置多高？

| Q1的答案 | Q2的答案 | Q3的答案 | 配置 |
| --- | --- | --- | --- |
| 不多 | 否 | 低 | 这是理想的情况，只需将`ef`和`efConstruction`设置得低点即可。您不需要一台大型机器，并且您仍然会对结果感到满意。 |
| 不多 | 否 | 高 | 在这种情况下，棘手的是您的召回率需要很高，即使您不期望有很多请求或导入，您仍然可以增加`ef`和`efConstruction`的设置。只需不断增加它们，直到您对召回率感到满意为止。在这种情况下，您可以接近100%。 |
| 不多 | 是 | 低 | 在这种情况下，棘手的是高频导入和更新。无论您做什么，请确保将`efConstruction`设置得低。幸运的是，您不需要高召回率，并且您不期望有很多查询，因此您可以通过调整`ef`设置来达到所需的召回率。 |
| 不多 | 是 | 高 | 现在我们需要开始注意了，您需要高召回率，并且您要处理大量的导入或更新。这意味着我们需要将`efConstruction`设置得低，但我们可以显着增加`ef`设置，因为您的每秒查询量将很低。 |
| 很多 | 否 | 低 | 每秒较多的查询意味着较低的`ef`设置。幸运的是，您不需要高准确性或召回率，因此您可以显着增加`efConstruction`的值。 |
| 很多 | 否 | 高 | 每秒较多的查询意味着较低的`ef`设置。因为您需要较高的召回率，但不期望有很多的导入或更新操作，因此您可以增加`efConstruction`直到达到所需的召回率为止。 |
| 很多 | 是 | 低 | 每秒较多的查询意味着较低的`ef`设置，而大量的导入和更新意味着较低的`efConstruction`设置。幸运的是，您的召回率不需要尽可能接近100%，因此您可以将`efConstruction`设置相对较低，以支持输入或更新吞吐量，并通过`ef`设置限制每秒查询速度。 |
| 很多 | 是 | 高 | 啊哈，这意味着您是一个完美主义者，或者您有一个需要三者兼顾的用例。我们建议您这样做：不断增加`efConstruction`直到达到导入和更新的时间限制。接下来，不断增加`ef`设置直到达到所需的每秒查询与召回率的平衡。值得一提的是，很多人认为他们需要这样做，但通常并非如此。我们让您自己决定，或在[我们的论坛](https://forum.weaviate.io)上寻求帮助。
```

如果您正在寻找起始值，我们建议将`efConstruction`设置为`128`，`maxConnections`设置为`32`，并将`ef`设置为`64`。
请注意，向量索引类型仅指定数据对象的向量是如何被索引的，用于数据检索和相似性搜索。数据向量的确定方式（向量包含的数字）由`"vectorizer"`参数指定，该参数指向一个[模块](/developers/weaviate/modules/index.md)，例如`"text2vec-contextionary"`（或者如果您想导入自己的向量，则指向`"none"`）。在数据模式中了解更多关于所有参数的信息[在这里](/developers/weaviate/configuration/schema-configuration.md)。

## 倒排索引

### 配置倒排索引

有两个用于过滤或搜索数据的索引，其中第一个（可过滤的）用于构建快速的Roaring Bitmaps索引，第二个（可搜索的）索引用于BM25或混合搜索。

因此，有`indexFilterable`和`indexSearchable`键，可以在属性级别上设置为`true`（打开）或`false`（关闭）。默认情况下，两者都是打开的。

可过滤的索引仅能用于过滤，而可搜索的索引可以用于搜索和过滤（虽然不如可过滤的索引快）。

因此，设置`"indexFilterable": false`和`"indexSearchable": true`（或者根本不设置）会产生权衡，即较差的过滤性能，但导入速度更快（因为只需要更新一个索引）和较低的磁盘使用。

您可以在模式中像下面所示的属性级别上设置这些键：

{
    "class": "Author",
    "properties": [ // <== 注意每个属性都可以设置反向索引
        {
            "indexFilterable": false,  // <== 通过将 `indexFilterable` 设置为 false 来关闭可过滤的索引（Roaring Bitmap 索引）
            "indexSearchable": false,  // <== 通过将 `indexSearchable` 设置为 false 来关闭可搜索的索引（用于 BM25/hybrid）
            "dataType": [
                "text"
            ],
            "name": "name"
        }
    ]
}
```

在确定是否关闭索引时，有一个简单的经验法则可供参考：如果您永远不会基于此属性执行查询，可以将其关闭。

`indexFilterable` 和 `indexSearchable` 对于所有类型的数据都可用。然而，`indexSearchable` 只对 `text`/`text[]` 有意义，在其他情况下将被忽略。
```

您还可以启用倒排索引来基于时间戳进行搜索[/developers/weaviate/config-refs/schema.md#invertedindexconfig--indextimestamps](/developers/weaviate/config-refs/schema.md#invertedindexconfig--indextimestamps)。

```json
{
    "class": "Author",
    "invertedIndexConfig": {
        "indexTimestamps": true // <== 默认情况下为 false
    },
    "properties": []
}
```
```

### Classes without indices

If you don't want to set an index at all, neither ANN nor inverted, this is possible too.

If we don't want to index the `Authors` we can simply skip all indices (vector _and_ inverted) like this:

```js
{
    "class": "作者",
    "description": "这个类的描述，本例中是关于作者的",
    "vectorIndexConfig": {
        "skip": true // <== 禁用向量索引
    },
    "properties": [
        {
            "indexFilterable": false,  // <== 禁用此属性的可过滤索引
            "indexSearchable": false,  // <== 禁用此属性的可搜索索引
            "dataType": [
                "文本"
            ],
            "description": "作者的姓名",
            "name": "name"
        },
        {
            "indexFilterable": false,  // <== 禁用此属性的可过滤索引
            "dataType": [
                "int"
            ],
            "description": "作者的年龄",
            "name": "age"
        },
        {
            "indexFilterable": false,  // <== 禁用此属性的可过滤索引
            "dataType": [
                "date"
            ],
            "description": "作者的出生日期",
            "name": "born"
        },
        {
            "indexFilterable": false,  // <== 禁用此属性的可过滤索引
            "dataType": [
                "boolean"
            ],
            "description": "一个布尔值，表示作者是否获得过诺贝尔奖",
            "name": "wonNobelPrize"
        },
        {
            "indexFilterable": false,  // <== 禁用此属性的可过滤索引
"indexSearchable": false,  // <== 禁用此属性的可搜索索引
"dataType": [
    "text"
],
"description": "作者的描述",
"name": "description"
}
```

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />