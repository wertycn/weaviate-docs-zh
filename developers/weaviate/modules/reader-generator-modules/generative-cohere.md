---
image: og/docs/modules/generative-cohere.jpg
sidebar_position: 11
title: Generative Search - Cohere
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简而言之

* 生成式一致性（`generative-cohere`）模块根据存储在您的 Weaviate 实例中的数据生成响应。
* 该模块可以为从 Weaviate 返回的每个对象生成响应，或为一组对象生成组合响应。
* 该模块将 `generate {}` 参数添加到 GraphQL `_additional {}` 属性的 `Get {}` 查询中
* 在 Weaviate `v1.19.0` 中添加
* 默认模型是`command-xlarge-nightly`，Cohere团队每晚训练并推送更新。

## 简介

`generative-cohere`基于您的Weaviate实例中存储的数据生成回复。

该模块分为两个步骤：
1. （Weaviate）在Weaviate中运行搜索查询以找到相关的对象。
2. （Cohere）使用Cohere大型语言模型根据结果（来自上一步骤）和提供的提示或任务生成回复。

:::note
You can use the Generative Cohere module with non-Cohere upstream modules. For example, you could use `text2vec-openai` or `text2vec-huggingface` to vectorize and query your data, but then rely on the `generative-cohere` module to generate a response.
:::

生成模块可以提供以下结果：
* 每个返回对象 - `singleResult{ prompt }`
* 所有结果的组合 - `groupedResult{ task }`

您需要输入查询和提示（用于单个回复）或任务（用于所有回复）。

## Cohere API密钥

`generative-cohere`需要一个[Cohere API密钥](https://dashboard.cohere.com/welcome/login)来执行生成任务。

### 将密钥提供给Weaviate

您可以通过两种方式提供您的Cohere API密钥：

1. 在配置Docker实例时，在您的`docker-compose`文件中的`environment`下添加`COHERE_APIKEY`，如下所示:

  ```
  environment:
    COHERE_APIKEY: 'your-key-goes-here'
    ...
  ```

2. 在运行时（推荐），通过向Weaviate客户端提供`"X-Cohere-Api-Key"`，如下所示:

import ClientKey from '/_includes/code/core.client.cohere.apikey.mdx';

<ClientKey />

## 模块配置

:::tip Not applicable to WCS
This module is enabled and pre-configured on Weaviate Cloud Services.
:::

:::caution
Your Weaviate instance must be on `1.19.0` or newer.

If your instance is older than `1.19.0` then you need to migrate or upgrade it to a newer version.
:::

### 配置文件（仅适用于 Weaviate 开源版本）

您可以在配置文件（例如 `docker-compose.yaml`）中启用生成式 Cohere 模块。将 `generative-cohere` 模块（以及您可能需要的其他模块）添加到 `ENABLE_MODULES` 属性中，如下所示：

```
ENABLE_MODULES: 'text2vec-cohere,generative-cohere'
```

以下是一个完整的Docker配置示例，其中使用了`generative-cohere`模块和`text2vec-cohere`模块的组合:

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
    image:
      semitechnologies/weaviate:||site.weaviate_version||
    ports:
      - 8080:8080
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-cohere'
      // highlight-next-line
      ENABLE_MODULES: 'text2vec-cohere,generative-cohere'
      COHERE_APIKEY: sk-foobar # this parameter is optional, as you can also provide it through the client
      CLUSTER_HOSTNAME: 'node1'
```

## 架构配置

在您的Weaviate架构中，您可以为该模块定义设置。

例如，以下架构配置将设置Weaviate使用`generative-cohere`模块与`Document`类，以及`command-xlarge-nightly`模型。您还可以通过下面显示的参数配置Cohere端点的其他参数。您还可以使用Cohere的其他模型，如`command-xlarge-beta`和`command-xlarge`。

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      ...,
      "moduleConfig": {
        // highlight-start
        "generative-cohere": {
          "model": "command-xlarge-nightly",  // Optional - Defaults to `command-xlarge-nightly`. Can also use`command-xlarge-beta` and `command-xlarge`
          "temperatureProperty": <temperature>,  // Optional
          "maxTokensProperty": <maxTokens>,  // Optional
          "kProperty": <k>, // Optional
          "stopSequencesProperty": <stopSequences>, // Optional
          "returnLikelihoodsProperty": <returnLikelihoods>, // Optional
        },
        // highlight-end
      }
    }
  ]
}
```

<details>
  <summary>初次接触Weaviate模式？</summary>

如果您是Weaviate的新手，请查看[Weaviate模式教程](/developers/weaviate/tutorials/schema.md)。

</details>


## 如何使用

此模块通过`_additional {...}`属性扩展了`generate`运算符。

`generate`接受以下参数：

| 字段 | 数据类型 | 是否必需 | 示例 | 描述 |
|- |- |- |- |- |
| `singleResult {prompt}`  | string | no | `将以下内容以推文的形式总结：{summary}`  | 为每个单独的搜索结果生成响应。在提示中，您需要在大括号之间包含至少一个结果字段。 |
| `groupedResult {task}`  | string | no | `解释为什么这些结果彼此相似`  | 为所有搜索结果生成单个响应。 |

### 提示中属性的示例

当将结果导入到提示符中时，查询返回的至少一个字段必须添加到提示符中。如果您没有添加任何字段，Weaviate将会抛出一个错误。

例如，假设您的模式如下所示：

```graphql
{
  Article {
    title
    summary
  }
}
```

您可以通过将标题和摘要放在花括号中来添加它们到提示中：

```graphql
{
  Get {
    Article {
      title
      summary
      _additional {
        generate(
          singleResult: {
            prompt: """
            Summarize the following in a tweet:

            {title} - {summary}
            """
          }
        ) {
          singleResult
          error
        }
      }
    }
  }
}
```

### 示例 - 单一结果

下面是一个查询的示例，其中:
* 我们运行一个向量搜索（使用`nearText`）来找到关于"意大利美食"的文章
* 然后我们要求生成器模块将每个结果描述为Facebook广告。
  * 查询要求`summary`字段，并将其包含在`generate`操作符的`prompt`参数中。

import CohereSingleResult from '/_includes/code/generative.cohere.singleresult.mdx';

<CohereSingleResult/>

### 示例响应 - 单一结果

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "generate": {
              "error": null,
              "singleResult": "Italian food, as we know it today, might be a relatively modern concept. But it's hard to deny that there's something special about it. It could be the way the pasta tastes or the way the sauce smells. It could be the way the cheese stretches or the way the bread soaks up the sauce. Whatever it is, Italian food has a way of capturing our hearts and our stomachs. So if you're looking for a way to spice up your meal routine, why not try Italian? You might just find that it's your new favorite cuisine."
            }
          },
          "summary": "Even the emoji for pasta isn't just pasta -- it's a steaming plate of spaghetti heaped with tomato sauce on top. But while today we think of tomatoes as inextricably linked to Italian food, that hasn't always been the case. \"People tend to think Italian food was always as it is now -- that Dante was eating pizza,\" says Dr Eva Del Soldato , associate professor of romance languages at the University of Pennsylvania, who leads courses on Italian food history. In fact, she says, Italy's complex history -- it wasn't unified until 1861 -- means that what we think of Italian food is, for the most part, a relatively modern concept. Diego Zancani, emeritus professor of medieval and modern languages at Oxford University and author of \"How We Fell in Love with Italian Food,\" agrees.",
          "title": "How this fruit became the star of Italian cooking"
        }
      ]
    }
  }
}
```

### 示例 - 分组结果

这是一个查询的示例，其中：
* 我们运行了一个向量搜索（使用 `nearText`）来查找关于金融的出版物，
* 然后我们要求生成器模块解释为什么这些文章与金融有关。

import CohereGroupedResult from '/_includes/code/generative.cohere.groupedresult.mdx';

<CohereGroupedResult />

### 示例响应 - 分组结果

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "_additional": {
            "generate": {
              "error": null,
              "groupedResult": "These magazines or newspapers are about finance because they cover topics related to finance, such as business news, financial markets, and economic trends. They also often feature articles about personal finance, such as investing, budgeting, and retirement planning."
            }
          },
          "name": "Financial Times"
        },
        {
          "_additional": {
            "generate": null
          },
          "name": "Wall Street Journal"
        },
        {
          "_additional": {
            "generate": null
          },
          "name": "The New York Times Company"
        }
      ]
    }
  }
}
```

## 附加信息

### 支持的模型

您可以使用以下任何一个模型：

* [`command-xlarge-nightly`](https://docs.cohere.com/docs/command-beta)（默认）
* `command-xlarge-beta`
* `command-xlarge`

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />