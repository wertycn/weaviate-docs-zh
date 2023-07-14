---
image: og/docs/tutorials.jpg
sidebar_position: 10
title: Schemas in detail
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

在本节中，我们将探讨模式构建，包括讨论一些常见的参数。我们还将讨论自动模式特性以及为什么您可能希望花时间手动设置模式。

## 先决条件

我们建议您先完成[快速入门教程](../quickstart/index.md)。

在开始本教程之前，您应该按照教程中的步骤进行操作，以确保具备以下内容：

- 已启动的Weaviate实例（例如在[Weaviate云服务](https://console.weaviate.cloud)上），
- 适用于您首选的推理API（如OpenAI、Cohere或Hugging Face）的API密钥，以及
- 已安装您首选的Weaviate客户端库。

如果您已完成整个快速入门教程，您的Weaviate实例将包含数据对象和模式。**我们建议在开始本节之前删除`Question`类。** 请参阅下面的详细信息：

### 删除类

import CautionSchemaDeleteClass from '/_includes/schema-delete-class.mdx'

<CautionSchemaDeleteClass />

## 介绍

### 什么是模式？

import SchemaDef from '/_includes/definition-schema.md';

<SchemaDef/>

### 快速入门回顾

在[快速入门教程](../quickstart/index.md)中，您学习了如何为数据集合指定名称和矢量化器，这在Weaviate中称为“类”。

import CodeAutoschemaMinimumSchema from '/_includes/code/quickstart.autoschema.minimum.schema.mdx'

<CodeAutoschemaMinimumSchema />

然后当你导航到[`schema`端点](../api/rest/schema.md)，在`https://some-endpoint.weaviate.network/v1/schema`上，你会看到上面指定的类名和向量化器。

但你可能也注意到`schema`包含了你没有指定的大量信息。

这是因为Weaviate使用了"auto-schema"功能为我们推断出了它们。

### 自动模式与手动模式

Weaviate对于每个数据对象类别都需要一个完整的模式。

如果缺少任何必需的信息，Weaviate将使用[auto-schema功能](../config-refs/schema.md#auto-schema)从导入的数据以及默认设置中推断出其余部分。

虽然在某些情况下这可能是适用的，但在许多情况下，您可能希望明确定义一个模式。手动定义模式将帮助您确保模式适合您的特定数据和需求。

## 创建一个类

在Weaviate中，数据集合被称为"类"。我们将添加一个类来存储我们的测验数据。

### 关于类

以下是关于类的一些关键考虑因素：

每个Weaviate类：
- 总是以大写字母开头。这是为了将其与用于交叉引用的通用名称区分开来。
- 构成一个独立的向量空间。Weaviate中的搜索总是限制在一个类中进行。
- 可以有自己的向量化器（例如，一个类可以有一个 `text2vec-openai` 向量化器，另一个可以有 `multi2vec-clip` 向量化器，或者如果您不打算使用向量化器，可以使用 `none`）。
- 有 `property` 值，其中每个 `property` 指定要存储的数据类型。

:::info Can I specify my own vectors?
Yes! You can bring your own vectors and pass them to Weaviate directly. See [this reference](../api/rest/objects.md#with-a-custom-vector) for more information.
:::

### 创建一个基本类

让我们为我们的数据创建一个名为 **Question** 的类。

我们的 **Question** 类将包含以下三个属性：
- 属性名为 `answer`，类型为 `text`
- 属性名为 `question`，类型为 `text`
- 属性名为 `category`，类型为 `text`
- 使用 `text2vec-openai` 的向量化器

通过使用你的客户端运行以下代码，定义 **Question** 类的模式，并显示创建的模式信息。

import CodeCreateSchema from '/_includes/code/quickstart.schema.create.mdx';

<CodeCreateSchema />

:::note Classes and Properties - best practice
Classes always start with a capital letter. Properties always begin with a small letter. You can use `CamelCase` class names, and property names allow underscores. Read more about schema classes, properties and data types [here](../config-refs/schema.md).
:::

结果应该类似于这样：

<details>
  <summary>查看返回的模式</summary>

```json
{
    "classes": [
        {
            "class": "Question",
            "description": "Information from a Jeopardy! question",
            "invertedIndexConfig": {
                "bm25": {
                    "b": 0.75,
                    "k1": 1.2
                },
                "cleanupIntervalSeconds": 60,
                "stopwords": {
                    "additions": null,
                    "preset": "en",
                    "removals": null
                }
            },
            "moduleConfig": {
                "text2vec-openai": {
                    "model": "ada",
                    "modelVersion": "002",
                    "type": "text",
                    "vectorizeClassName": true
                }
            },
            "properties": [
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "The question",
                    "moduleConfig": {
                        "text2vec-openai": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "question",
                    "tokenization": "word"
                },
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "The answer",
                    "moduleConfig": {
                        "text2vec-openai": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "answer",
                    "tokenization": "word"
                },
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "The category",
                    "moduleConfig": {
                        "text2vec-openai": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "category",
                    "tokenization": "word"
                }
            ],
            "replicationConfig": {
                "factor": 1
            },
            "shardingConfig": {
                "virtualPerPhysical": 128,
                "desiredCount": 1,
                "actualCount": 1,
                "desiredVirtualCount": 128,
                "actualVirtualCount": 128,
                "key": "_id",
                "strategy": "hash",
                "function": "murmur3"
            },
            "vectorIndexConfig": {
                "skip": false,
                "cleanupIntervalSeconds": 300,
                "maxConnections": 64,
                "efConstruction": 128,
                "ef": -1,
                "dynamicEfMin": 100,
                "dynamicEfMax": 500,
                "dynamicEfFactor": 8,
                "vectorCacheMaxObjects": 1000000000000,
                "flatSearchCutoff": 40000,
                "distance": "cosine"
            },
            "vectorIndexType": "hnsw",
            "vectorizer": "text2vec-openai"
        }
    ]
}
```

</details>

这里返回了很多信息。

其中一些是我们指定的，比如类名（`class`），以及`properties`包括它们的`dataType`和`name`。但其他的则是Weaviate根据默认值和提供的数据进行推断的。

### 类属性规范示例

根据您的需求，您可能想要更改其中的任意数量。例如，您可能要更改：

- `dataType` 用于修改要保存的数据类型。例如，具有 `text` 数据类型的类将与具有 `string` 数据类型的类进行不同的标记化处理（[了解更多](../config-refs/schema.md#property-tokenization)）。
- `moduleConfig` 用于修改每个模块的行为。在这种情况下，您可以更改 OpenAI 推理 API 的模型和/或版本，以及矢量化行为，例如是否使用类名进行矢量化。
- `properties` / `moduleConfig` 可以在类数据属性级别进一步修改模块行为。您可以选择跳过包含特定属性进行向量化。
- `invertedIndexConfig` 可以添加或删除特定的停用词，或者更改BM25索引常量。
- `vectorIndexConfig` 可以更改向量索引（例如HNSW）的参数，例如用于速度/召回率的平衡。

因此，例如，您可以指定以下类似的模式：

```json
{
    "class": "Question",
    "description": "Information from a Jeopardy! question",
    "moduleConfig": {
        "text2vec-openai": {
            "vectorizeClassName": false  // Default: true
        }
    },
    "invertedIndexConfig": {
        "bm25": {
            "k1": 1.5,  // Default: 1.2
            "b": 0.75
        }
    },
    "properties": [
        {
            "dataType": ["text"],
            "description": "The question",
            "moduleConfig": {
                "text2vec-openai": {
                    "vectorizePropertyName": true  // Default: false
                }
            },
            "name": "question",
        },
        ...
    ]
}
```

通过这样做，您将会修改指定属性的默认值。请注意，在其他教程中，我们假设您还没有进行过这样的修改。

您可以在以下页面了解更多关于各种模式、数据类型、模块和索引配置选项的内容。

- [模式](../configuration/schema-configuration.md)
- [数据类型](../config-refs/datatypes.md)
- [模块](../configuration/modules.md)
- [索引](../configuration/indexes.md)

## 概述

- 模式是您定义要保存的信息结构的地方。
- 模式由类和属性组成，它们定义了概念。
<!-- - 模式中的词汇（类和属性的名称）必须是`text2vec-contextionary`的一部分。 -->
- 任何未指定的设置都将由自动模式功能根据数据和默认值推断。
- 可以通过[RESTful API](../api/rest/schema.md)修改模式。
- Weaviate中的类或属性是不可变的，但始终可以扩展。

## 推荐阅读

- [参考：`schema`端点RESTful API](../api/rest/schema.md)
- [教程：详细导入](./import.md)
- [教程：详细查询](./query.md)
- [教程：模块介绍](./modules.md)
- [教程：Weaviate控制台介绍](../../wcs/guides/console.mdx)

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />