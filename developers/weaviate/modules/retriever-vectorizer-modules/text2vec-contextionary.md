---
image: og/docs/modules/text2vec-contextionary.jpg
sidebar_position: 4
title: text2vec-contextionary
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 介绍

模块`text2vec-contextionary`，也称为'Contextionary'，是Weaviate自己的语言向量化器。它为您的数据集中使用的语言提供上下文（适用于多种语言的Contextionary版本可用）。`text2vec-contextionary`是一种加权平均词嵌入（WMOWE）向量化器模块，可与流行的模型（如fastText和GloVe）一起使用。最新的`text2vec-contextionary`是使用[fastText](https://fasttext.cc/)在Wiki和CommonCrawl数据上训练的。我们的目标是使Contextionary在任何领域的用例中都可用，无论是业务相关、学术还是其他。但如果需要，您也可以[创建自己的向量化器](/developers/weaviate/modules/other-modules/custom-modules.md)。

`text2vec-contextionary`将数据放置在一个300维空间中。因此，每个数据点都会有一个由300个数字组成的向量。这个向量是从预训练的Contextionary中计算出来的（您无需自己进行任何训练），它包含了允许Weaviate基于其上下文含义存储数据的上下文表示。一个带有预加载的`text2vec-contextionary`模块的空白Weaviate可以被想象成这样（在一个简化的3D可视化中）：

![3D向量可视化](./img/vectors-3d.svg "3D向量可视化")

当您添加数据时，`text2vec-contextionary`会计算在向量空间中表示真实世界实体的位置。

从数据对象到向量位置的过程是基于单词在原始训练文本语料库中的出现次数加权的单词中心点计算的（例如，单词`"has"`被视为比单词`"apples"`不重要）。

![使用Contextionary将数据转换为向量](./img/data2vec-c11y.svg "使用Contextionary将数据转换为向量")

当创建一个新的类对象时，它将被添加到一个Weaviate。

![使用新的数据对象进行三维向量可视化](./img/vectors-3d-dataobject.svg "使用新的数据对象进行三维向量可视化")

### 可用的模块和语言

* 使用GloVe在CommonCrawl和Wiki上进行训练
  * 英语
  * 荷兰语
  * 德语
  * 捷克语
  * 意大利语
* 在Wiki上进行训练
  * 英语
  * 荷兰语

## 如何启用

### Weaviate云服务

在WCS上不可用`text2vec-contextionary`模块。

### Weaviate开源版本

您可以在下面找到一个示例的Docker Compose文件，它将使用`text2vec-contextionary`模块启动Weaviate。

```yaml
---
version: '3.4'
services:
  weaviate:
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    restart: on-failure:0
    environment:
      CONTEXTIONARY_URL: contextionary:9999
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-contextionary'
      ENABLE_MODULES: 'text2vec-contextionary'
      CLUSTER_HOSTNAME: 'node1'
  contextionary:
    environment:
      OCCURRENCE_WEIGHT_LINEAR_FACTOR: 0.75
      EXTENSIONS_STORAGE_MODE: weaviate
      EXTENSIONS_STORAGE_ORIGIN: http://weaviate:8080
      NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE: 5
      ENABLE_COMPOUND_SPLITTING: 'false'
    image: semitechnologies/contextionary:en0.16.0-v1.0.2
    ports:
    - 9999:9999
...
```

变量说明：
* `EXTENSIONS_STORAGE_MODE`：自定义扩展的存储位置
* `EXTENSIONS_STORAGE_ORIGIN`：自定义扩展存储的主机
* `NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE`：这可以用于隐藏非常罕见的单词。如果将其设置为'5'，则表示在最近邻搜索中删除按出现次数排名的前5%的单词（例如在GraphQL的`_additional { nearestNeighbors }`功能中使用）。
* `ENABLE_COMPOUND_SPLITTING`: 请参见[此处](#compound-splitting)。

## 配置方法

在您的Weaviate模式中，您必须定义您希望此模块对数据进行向量化的方式。如果您对Weaviate模式不熟悉，您可能想先查看[Weaviate模式教程](/developers/weaviate/tutorials/schema.md)。

例如

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "moduleConfig": {
        "text2vec-contextionary": {
          "vectorizeClassName": "false"
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            "text2vec-contextionary": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "name": "content"
        }
      ],
      "vectorizer": "text2vec-contextionary"
    }
  ]
}
```

### 模式配置

如果您正在使用此模块并对类或属性名称进行向量化处理，那么这些名称必须是`text2vec-contextionary`的一部分。

#### 类/属性名称

有时您可能希望使用多个单词来设置类或属性的定义。例如，一个人的出生年份，您可能希望使用两个单词：`born`和`in`来定义。您可以通过每个单词的首字母大写来实现这一点。
（驼峰命名法），例如 `bornIn`。当使用 `text2vec-contextionary` 模块时，驼峰命名的单词将被拆分以尝试推断其语义含义。如果没有使用特定的模块，驼峰命名没有语义含义。从 `v1.7.2` 开始，您还可以在属性名中使用下划线（蛇形命名法），例如 `has_articles`，`publication_date` 等。

例如：

```yaml
Publication
  name
  hasArticles
Article
  title
  summary
  wordCount
  url
  hasAuthors
  inPublication        # CamelCase (all versions)
  publication_date     # snake_case (from v1.7.2 on)
Author
  name
  wroteArticles
  writesFor
```

## 如何使用

该模块提供了一个 [`nearText`](/developers/weaviate/api/graphql/vector-search-parameters.md#neartext) GraphQL 搜索参数。

### 示例

import CodeNearText from '/_includes/code/graphql.filters.nearText.mdx';

<CodeNearText />

## 额外信息

### 查找概念

要查找概念或单词，或者检查一个概念是否是Contextionary的一部分，请使用 `v1/modules/text2vec-contextionary/concepts/<concept>` 端点。

```js
GET /v1/modules/text2vec-contextionary/concepts/<concept>
```

### 参数

唯一的参数`concept`是一个字符串，如果是复合词应该使用驼峰命名法，或者是一个单词列表。

### 响应
<!-- TODO: (phase 2) can we make a list of parameters like this look better? -->
结果包含以下字段:
- `"individualWords"`: 查询中每个单词或概念的结果列表，其中包含:
  - `"word"`: 请求的概念或来自概念的单个单词的字符串。
  - `"present"`: 一个布尔值，如果单词存在于Contextionary中，则为`true`。
  - `"info"`: 一个包含以下字段的对象:
    - `"nearestNeighbors"`: 一个包含最近邻单词的列表，包含`"word"`和`"distance"`（在高维空间中两个单词之间的距离）。注意，`"word"`也可以是一个数据对象。
    - `"vector"`: 原始的300维向量值。
  - `"concatenatedWord"`: 拼接概念的对象。
    - `"concatenatedWord"`: 如果给定的概念是一个驼峰命名的单词，则为连接的单词。
      - `"singleWords"`: 连接概念中单词的列表。
      - `"concatenatedVector"`: 连接概念的向量值列表。
      - `"concatenatedNearestNeighbors"`: 最近邻的列表，包含 `"word"` 和 `"distance"`（在高维空间中两个单词之间的距离）。请注意，`"word"` 也可以是一个数据对象。

### 示例

```bash
$ curl http://localhost:8080/v1/modules/text2vec-contextionary/concepts/magazine
```

或者（注意驼峰式组合概念）

import CodeContextionary from '/_includes/code/contextionary.get.mdx';

<CodeContextionary />

结果类似于：

```json
{
  "individualWords": [
    {
      "inC11y": true,
      "info": {
        "nearestNeighbors": [
          {
            "word": "magazine"
          },
          {
            "distance": 6.186641,
            "word": "editorial"
          },
          {
            "distance": 6.372504,
            "word": "featured"
          },
          {
            "distance": 6.5695524,
            "word": "editor"
          },
          {
            "distance": 7.0328364,
            "word": "titled"
          },
          ...
        ],
        "vector": [
          0.136228,
          0.706469,
          -0.073645,
          -0.099225,
          0.830348,
          ...
        ]
      },
      "word": "magazine"
    }
  ]
}
```

## 扩展Contextionary

可以通过扩展Contextionary将自定义词汇或缩写（即“概念”）直接添加到Weaviate中。使用此端点将使用[迁移学习](https://en.wikipedia.org/wiki/Transfer_learning)将您自己的单词、缩写或概念在上下文中丰富Contextionary。使用`v1/modules/text2vec-contextionary/extensions/`端点可以实时地向Weaviate教授新的概念。您还可以使用此端点覆盖概念。请注意，在添加数据之前，您需要将新的概念引入Weaviate中。

### 参数

使用以下字段的JSON或YAML格式的主体，包含您想要添加到Contextionary中的扩展词或缩写：
- `"concept"`: 字符串，包含单词、复合词或缩写
- `"definition"`: 对概念的清晰描述，将用于创建概念的上下文，并将其放置在高维度的Contextionary空间中。
- `"weight"`：概念的相对权重（Contextionary中的默认概念权重为1.0的浮点数）

### 响应

如果扩展成功，则响应体中将包含与输入参数相同的字段。

### 示例

让我们将概念`"weaviate"`添加到Contextionary中。

import CodeContextionaryExtensions from '/_includes/code/contextionary.extensions.mdx';

<CodeContextionaryExtensions />

您可以随时在Contextionary中检查新概念是否存在：

```bash
curl http://localhost:8080/v1/modules/text2vec-contextionary/concepts/weaviate
```

请注意，目前还无法使用多个单词或由多个单词组成的概念来扩展Contextionary。

您还可以使用此端点覆盖当前的概念。假设您使用缩写词`API`代表`学术绩效指数`而不是`应用程序编程接口`，并且您想要重新定位这个概念在Contextionary中的位置：

```bash
$ curl \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "concept": "api",
    "definition": "Academic Performance Index a measurement of academic performance and progress of individual schools in California",
    "weight": 1
  }' \
  http://localhost:8080/v1/modules/text2vec-contextionary/extensions
```

概念`API`在您的Weaviate设置中的含义已经发生了变化。

## 停用词

请注意，停用词会自动从驼峰式和大驼峰式的名称中移除。

### 停用词是什么以及为什么它们很重要

停用词是在不同上下文的文本中不添加语义含义的常见词汇。例如，句子“一辆汽车停在街上”包含以下停用词：“一个”，“是”，“在”，“街上”。如果我们看一下句子“一只香蕉躺在桌子上”，你会发现完全相同的停用词。因此，在这两个句子中，超过50%的词汇重叠。因此它们被认为是相似的（基于整体向量位置）。

然而，如果我们从两个句子中去除停用词，它们变成了"car parked street"和"banana lying table"。突然之间，句子中没有任何相同的词，所以进行向量比较变得更容易。请注意，此时我们无法确定这两个句子是否相关。为了确定，我们需要知道句子"car parked street"的向量位置与"banana lying table"的向量位置有多接近。但我们知道，现在的结果可以用更少的噪音计算出来。

### 停用词的行为

停用词对人类来说很有用，所以我们不鼓励您完全忽略它们。相反，当您的模式信息被转换为向量位置时，Weaviate会将它们移除。

在大多数情况下，您甚至不会注意到这在后台发生，然而，有一些边缘情况可能导致验证错误：

* 如果您的驼峰命名的类或属性名仅包含停用词，验证将失败。例如：`TheInA`不是一个有效的类名，但`TheCarInAField`是有效的（并且在内部表示为`CarField`）。

* 如果您的关键词列表包含停用词，它们将被删除。但是，如果每个关键词都是停用词，验证将失败。

### Weaviate如何确定一个单词是否是停用词？

停用词列表是由使用的Contextionary版本派生的，并与Contextionary文件一起发布。

## 复合词拆分

有时Weaviate的Contextionary无法理解由它本来可以理解的单词组成的复合词。这种影响在允许任意复合的语言（如荷兰语或德语）中比在不常见复合的语言（如英语）中更为显著。

### 影响

假设您导入了一个类为`Post`、内容为`This is a thunderstormcloud`的对象。组合词`thunderstormcloud`在Contextionary中不存在。因此，对象的位置将由它识别的唯一单词组成：`"post", "this"`（"is"和"a"被作为停用词删除）。

如果您使用`_interpretation`功能检查此内容的向量化方式，您将看到类似以下的结果:

```json
"_interpretation": {
  "source": [
    {
      "concept": "post",
      "occurrence": 62064610,
      "weight": 0.3623903691768646
    },
    {
      "concept": "this",
      "occurrence": 932425699,
      "weight": 0.10000000149011612
    }
  ]
}
```

为了克服这个限制，可以在Contextionary中启用可选的**复合拆分功能**。它将理解任意复合词，并将您的对象解释如下：

```json
"_interpretation": {
  "source": [
    {
      "concept": "post",
      "occurrence": 62064610,
      "weight": 0.3623903691768646
    },
    {
      "concept": "this",
      "occurrence": 932425699,
      "weight": 0.10000000149011612
    },
    {
      ... (省略部分内容)
    }
  ]
}
```
      "concept": "雷暴云（雷暴，云）",
      "occurrence": 5756775,
      "weight": 0.5926488041877747
    }
  ]
}
  ```

请注意，由部分“雷暴”和“云”组成的新发现的词在向量化中具有最高的权重。因此，这个含义如果没有复合拆分，是无法被识别的。

### 如何启用复合拆分功能
您可以在`text2vec-contextionary`的配置文件中启用复合拆分。请参阅[这里](#compound-splitting)了解如何进行此操作。

### 导入速度与词语识别的权衡
复合分割运行在任何无法被识别的单词上。根据您的数据集，这可能导致导入时间显著延长（最多延长100%）。因此，您应该仔细评估在您的用例中更重要的是更高的识别准确性还是更快的导入时间。由于某些语言（如荷兰语、德语）比其他语言（如英语）更受益，因此该功能默认关闭。

## 噪声过滤

所谓的“噪声词”是由随机单词组成、没有明显可识别含义的连接词。这些词存在于Contextionary的训练空间中，但非常罕见，因此看似随机分布。因此，使用最近邻相关的查询功能（如附加属性`nearestNeighbors`或`semanticPath`）得到的“普通”查询结果可能包含这些噪声词作为直接的邻居。

为了应对这种噪声，引入了邻居过滤功能，该功能在contextionary中忽略配置的底部百分位数的单词 - 根据在相应的训练集中的出现次数进行排序。默认情况下，该值设置为底部的5%百分位数。可以重写此设置。要设置另一个值，例如忽略底部的10%百分位数，请将环境变量`NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE=10`提供给`text2vec-contextionary`容器（配置文件）。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />