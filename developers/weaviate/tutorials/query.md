---
image: og/docs/tutorials.jpg
sidebar_position: 50
title: Queries in detail
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

在本节中，我们将探索您可以在Weaviate上执行的不同查询。在这里，我们将扩展您在[快速入门教程](../quickstart/index.md)中可能已经看到的`nearText`查询，以展示不同的查询类型、过滤器和指标的使用方法。

在本节结束时，您将分别执行向量搜索和标量搜索，以及结合使用它们来检索单个对象和聚合数据。

## 先决条件

我们建议您首先完成[快速入门教程](../quickstart/index.md)。

在开始本教程之前，您应该按照快速入门中的步骤完成以下操作：

- 运行一个Weaviate实例（例如在[Weaviate云服务](https://console.weaviate.cloud)上）
- 一个适用于您首选推理 API（例如 OpenAI、Cohere 或 Hugging Face）的 API 密钥，
- 安装您首选的 Weaviate 客户端库，
- 在模式中设置一个 `Question` 类，
- 导入 `jeopardy_tiny.json` 数据。

## 使用 `Get` 进行对象检索

:::tip GraphQL
Weaviate's queries are built using GraphQL. If this is new to you, don't worry. We will take it step-by-step and build up from the basics. Also, in many cases, the GraphQL syntax is abstracted by the client.

You can query Weaviate using one or a combination of a semantic (i.e. vector) search and a lexical (i.e. scalar) search. As you've seen, a vector search allows for similarity-based searches, while scalar searches allow filtering by exact matches.
:::

首先，我们将通过向Weaviate发出查询来检索之前导入的**Question**对象。

用于检索对象的Weaviate函数是`Get`。

这对一些人来说可能很熟悉。如果您已经完成了我们的[Imports in detail tutorial](./import.md)，您可能已经执行了一个`Get`查询来确认数据导入成功。这是相同的代码，以作为提醒：

import CodeImportGet from '/_includes/code/quickstart.import.get.mdx';

<CodeImportGet />

这个查询只是简单地向Weaviate请求这个（`Question`）类的一些对象。

当然，在大多数情况下，我们希望根据一些条件检索信息。让我们在这个查询的基础上添加一个向量搜索。

### 使用`nearText`的`Get`

这是一个使用`Get`查询的向量搜索。

import CodeAutoschemaNeartext from '/_includes/code/quickstart.autoschema.neartext.mdx'

<CodeAutoschemaNeartext />

这可能看起来很熟悉，因为它在[快速入门教程](../quickstart/index.md)中使用过。但是让我们稍微解释一下。

在这里，我们使用了`nearText`参数。我们所做的是向Weaviate提供一个查询`concept`为`biology`的向量。Weaviate然后通过推理API（在这个特定的例子中是OpenAI）将其转换为一个向量，并将该向量作为基础进行向量搜索。

同时请注意，在此我们将API密钥作为头部传递。这是必需的，因为推理API用于将输入查询向量化。

此外，我们使用`limit`参数仅获取最多两个（2个）对象。

如果您运行此查询，您应该会看到Weaviate返回的关于"DNA"和"species"的条目。

### 使用`nearVector`进行`Get`请求

在某些情况下，您可能希望将向量直接作为搜索查询进行输入。例如，您可能正在使用自定义的外部向量化器运行Weaviate。在这种情况下，您可以使用`nearVector`参数将查询向量提供给Weaviate。

例如，以下是一个获取OpenAI嵌入并通过`nearVector`参数手动提供的示例Python代码：

```python
import openai

openai.api_key = "YOUR-OPENAI-API-KEY"
model="text-embedding-ada-002"
oai_resp = openai.Embedding.create(input = ["biology"], model=model)

oai_embedding = oai_resp['data'][0]['embedding']

result = (
    client.query
    .get("Question", ["question", "answer"])
    .with_near_vector({
        "vector": oai_embedding,
        "certainty": 0.7
    })
    .with_limit(2)
    .do()
)

print(json.dumps(result, indent=4))
```

并且它应该返回与上述结果相同的结果。

请注意，我们在这里使用了相同的OpenAI嵌入模型（`text-embedding-ada-002`），以便向量在相同的向量“空间”中。

您可能还注意到我们在`with_near_vector`方法中添加了一个`certainty`参数。这个参数允许您为对象指定一个相似度阈值，非常有用，可以确保不会返回远离的对象。

## 附加属性

我们可以要求Weaviate返回任何返回对象的`_additional`属性。这使我们能够获取每个返回对象的`vector`以及实际的`certainty`值，以便我们可以验证每个对象与我们的查询向量的接近程度。以下是一个查询，将返回`certainty`值：

import CodeQueryNeartextAdditional from '/_includes/code/quickstart.query.neartext.additional.mdx'

<CodeQueryNeartextAdditional />

尝试一下，您应该会看到类似这样的响应：

```json
{
    "data": {
        "Get": {
            "Question": [
                {
                    "_additional": {
                        "certainty": 0.9030631184577942
                    },
                    "answer": "DNA",
                    "category": "SCIENCE",
                    "question": "In 1953 Watson & Crick built a model of the molecular structure of this, the gene-carrying substance"
                },
                {
                    "_additional": {
                        "certainty": 0.900638073682785
                    },
                    "answer": "species",
                    "category": "SCIENCE",
                    "question": "2000 news: the Gunnison sage grouse isn't just another northern sage grouse, but a new one of this classification"
                }
            ]
        }
    }
}
```

您可以尝试修改此查询以查看是否检索到向量（注意 - 这将是一个很长的响应 😉）。

我们鼓励您还尝试使用不同的查询，观察结果和距离如何在不同的数据集和/或向量化器中发生变化。

## 筛选器

尽管向量搜索非常有用，但有时候单纯的向量搜索可能不足够。例如，您可能只对特定类别中的**问题**对象感兴趣。

在这些情况下，您可以使用Weaviate的标量过滤功能 - 单独使用或与向量搜索结合使用。

请尝试以下操作：

import CodeQueryWhere1 from '/_includes/code/quickstart.query.where.1.mdx'

<CodeQueryWhere1 />

此查询要求Weaviate返回包含字符串`ANIMALS`的**Question**对象。您应该会看到类似以下的结果：

```json
{
    "data": {
        "Get": {
            "Question": [
                {
                    "answer": "the diamondback rattler",
                    "category": "ANIMALS",
                    "question": "Heaviest of all poisonous snakes is this North American rattlesnake"
                },
                {
                    "answer": "Elephant",
                    "category": "ANIMALS",
                    "question": "It's the only living mammal in the order Proboseidea"
                },
                {
                    "answer": "the nose or snout",
                    "category": "ANIMALS",
                    "question": "The gavial looks very much like a crocodile except for this bodily feature"
                },
                {
                    "answer": "Antelope",
                    "category": "ANIMALS",
                    "question": "Weighing around a ton, the eland is the largest species of this animal in Africa"
                }
            ]
        }
    }
}
```

现在您已经看到了标量过滤器，让我们来看看它如何与向量搜索函数结合使用。

### 使用标量过滤器进行向量搜索

将过滤器与向量搜索结合是一个加法过程。让我们来展示一下我们的意思。

import CodeQueryWhere2 from '/_includes/code/quickstart.query.where.2.mdx'

<CodeQueryWhere2 />

这个查询请求Weaviate返回与"biology"最接近的**Question**对象，但是在`ANIMALS`类别内。您应该会看到如下结果：

```json
{
    "data": {
        "Get": {
            "Question": [
                {
                    "_additional": {
                        "certainty": 0.8918434679508209
                    },
                    "answer": "the nose or snout",
                    "category": "ANIMALS",
                    "question": "The gavial looks very much like a crocodile except for this bodily feature"
                },
                {
                    "_additional": {
                        "certainty": 0.8867587149143219
                    },
                    "answer": "Elephant",
                    "category": "ANIMALS",
                    "question": "It's the only living mammal in the order Proboseidea"
                }
            ]
        }
    }
}
```

请注意，结果仅限于“动物”类别的选择。请注意，这些结果虽然不是最前沿的科学，但是是生物学上的事实。

## 使用`Aggregate`的元数据

顾名思义，`Aggregate`函数可用于显示聚合数据，例如整个类别或对象组的数据。

例如，下面的查询将返回`Question`类别中的数据对象数量：

import CodeQueryAggregate1 from '/_includes/code/quickstart.query.aggregate.1.mdx'

<CodeQueryAggregate1 />

您还可以像上面使用`Get`函数一样，使用`Aggregate`函数与筛选器一起使用。下面的查询示例将返回具有类别为"ANIMALS"的**Question**对象的数量。

import CodeQueryAggregate2 from '/_includes/code/quickstart.query.aggregate.2.mdx'

<CodeQueryAggregate2 />

正如您在上面看到的，有四个对象与查询过滤器匹配。

```json
{
    "data": {
        "Aggregate": {
            "Question": [
                {
                    "meta": {
                        "count": 4
                    }
                }
            ]
        }
    }
}
```

在这里，Weaviate已经识别出与您之前在类似的`Get`查询中看到的相同对象。不同之处在于，这里不是返回单个对象，而是显示所请求的聚合统计信息（计数）。

正如您所见，`Aggregate`函数可以从Weaviate数据库中返回方便的聚合或元数据信息。

## 总结

* `Get`查询用于检索数据对象。
* `Aggregate`查询可用于检索元数据或聚合数据。
* 可以使用`nearText`或`nearVector`等参数进行向量查询。
* 标量过滤器可用于精确过滤，利用倒排索引的优势。
* 可以组合使用向量和标量过滤器，并且在`Get`和`Aggregate`查询中都可用。

## 推荐阅读

- [教程：详解模式](./schema.md)
- [教程：详解导入](./import.md)
- [教程：模块介绍](./modules.md)
- [教程：Weaviate控制台介绍](../../wcs/guides/console.mdx)

## 注释

### 如何计算确定性？

在Weaviate中，`certainty`是从向量到数据对象的距离的度量。您还可以根据确定性计算余弦相似度，如[这里所述](../more-resources/faq.md#q-how-do-i-get-the-cosine-similarity-from-weaviates-certainty?)。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />