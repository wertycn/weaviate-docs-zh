---
image: og/docs/modules/generative-openai.jpg
sidebar_position: 10
title: Generative Search - OpenAI
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

* 生成型OpenAI（`generative-openai`）模块基于存储在您的Weaviate实例中的数据生成响应。
* 该模块可以为每个返回的对象生成一个响应，或者为一组对象生成一个单一的响应。
* 该模块在GraphQL的`_additional {}`属性的`Get {}`查询中添加了一个`generate {}`参数。
* 在Weaviate `v1.17.3`中添加。
* 默认的OpenAI模型是`gpt-3.5-turbo`，但也支持其他模型（如`gpt-4`）。
* 对于Azure OpenAI，必须指定一个模型。

import OpenAIOrAzureOpenAI from '/_includes/openai.or.azure.openai.mdx';

<OpenAIOrAzureOpenAI/>

## 简介

`generative-openai`根据存储在您的Weaviate实例中的数据生成响应。

该模块分为两个步骤：
1. （Weaviate）在Weaviate中运行搜索查询以找到相关的对象。
2. (OpenAI) 使用OpenAI模型根据前一步的结果和提供的提示或任务生成回复。

:::note
You can use the Generative OpenAI module with non-OpenAI upstream modules. For example, you could use `text2vec-cohere` or `text2vec-huggingface` to vectorize and query your data, but then rely on the `generative-openai` module to generate a response.
:::

生成模块可以提供以下结果：
- 每个返回对象的结果 - `singleResult{ prompt }`
- 所有结果的集合 - `groupedResult{ task }`

您需要输入查询和提示（用于单个响应）或任务（用于所有响应）。

## 推理 API 密钥

`generative-openai` 需要来自 OpenAI 或 Azure OpenAI 的 API 密钥。

:::tip
You only need to provide one of the two keys, depending on which service (OpenAI or Azure OpenAI) you are using.
:::

### 提供 Weaviate 的密钥

您可以通过两种方式提供 API 密钥：

1. 在配置 Docker 实例时，通过在 `docker-compose` 文件的 `environment` 下添加相应的 `OPENAI_APIKEY` 或 `AZURE_APIKEY`，例如：

   ```yaml
   environment:
     OPENAI_APIKEY: 'your-key-goes-here'  # 用于 OpenAI。设置此参数是可选的；您也可以在运行时提供密钥。
    AZURE_APIKEY: 'your-key-goes-here'  # 用于Azure OpenAI。设置此参数是可选的；您也可以在运行时提供密钥。
    ...
  ```

2. **在运行时**（推荐），通过请求头提供`"X-OpenAI-Api-Key"`或`"X-Azure-Api-Key"`。您可以使用Weaviate客户端提供它，就像这样：

import ClientKey from '/_includes/code/core.client.openai.apikey.mdx';

<ClientKey />

## 模块配置

:::tip Not applicable to WCS
This module is enabled and pre-configured on Weaviate Cloud Services.
:::

### 配置文件（仅适用于Weaviate开源版）

您可以在配置文件（例如 `docker-compose.yaml`）中启用Generative OpenAI模块。 将`generative-openai`模块（以及您可能需要的任何其他模块）添加到`ENABLE_MODULES`属性中，如下所示：

```
ENABLE_MODULES: 'text2vec-openai,generative-openai'
```

以下是一个完整的Docker配置示例，它使用`generative-openai`模块结合`text2vec-openai`进行操作:

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
      DEFAULT_VECTORIZER_MODULE: 'text2vec-openai'
      // highlight-next-line
      ENABLE_MODULES: 'text2vec-openai,generative-openai'
      OPENAI_APIKEY: sk-foobar  # For use with OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      AZURE_APIKEY: sk-foobar  # For use with Azure OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      CLUSTER_HOSTNAME: 'node1'
```

## 模式配置

您可以在模式中定义此模块的设置。

### OpenAI vs Azure OpenAI

- **OpenAI** 用户可以选择设置 `model` 参数。
- **Azure OpenAI** 用户必须设置参数 `resourceName` 和 `deploymentId`。

### 模型参数

您还可以通过下面显示的 `xxxProperty` 参数来配置生成模型的其他参数。

### 示例模式

例如，以下模式配置将使Weaviate使用`generative-openai`模型和`Document`类。

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      ...,
      "moduleConfig": {
        // highlight-start
        "generative-openai": {
          "model": "gpt-3.5-turbo",  // Optional - Defaults to `gpt-3.5-turbo`
          "resourceName": "<YOUR-RESOURCE-NAME>",  // For Azure OpenAI - Required
          "deploymentId": "<YOUR-MODEL-NAME>",  // For Azure OpenAI - Required
          "temperatureProperty": <temperature>,  // Optional, applicable to both OpenAI and Azure OpenAI
          "maxTokensProperty": <max_tokens>,  // Optional, applicable to both OpenAI and Azure OpenAI
          "frequencyPenaltyProperty": <frequency_penalty>,  // Optional, applicable to both OpenAI and Azure OpenAI
          "presencePenaltyProperty": <presence_penalty>,  // Optional, applicable to both OpenAI and Azure OpenAI
          "topPProperty": <top_p>,  // Optional, applicable to both OpenAI and Azure OpenAI
        },
        // highlight-end
      }
    }
  ]
}
```

<details>
  <summary>初次接触Weaviate Schemas？</summary>

如果您是第一次接触Weaviate，请查看[Weaviate模式教程](/developers/weaviate/tutorials/schema.md)。

</details>

## 如何使用

该模块通过 `_additional {...}` 属性扩展了 `generate` 操作符。

`generate` 接受以下参数：

| 字段 | 数据类型 | 必需 | 示例 | 描述 |
|- |- |- |- |- |
| `singleResult {prompt}`  | string | no | `在一条推文中概括以下内容: {summary}`  | 为每个单独的搜索结果生成响应。在提示语中，您需要在大括号中包含至少一个结果字段。 |
| `groupedResult {task}`  | string | no | `解释为什么这些结果彼此相似`  | 为所有搜索结果生成单个响应 |

### 提示语属性示例

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

您可以通过将`title`和`summary`放在花括号中来添加到提示中：

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

### 示例 - 单个结果

以下是一个查询的示例，其中:
* 我们运行一个向量搜索（使用 `nearText`）来找到关于"意大利食品"的文章
* 然后我们要求生成器模块将每个结果描述为 Facebook 广告。
  * 查询要求返回 `summary` 字段，并将其包含在 `generate` 操作符的 `prompt` 参数中。

import OpenAISingleResult from '/_includes/code/generative.openai.singleresult.mdx';

<OpenAISingleResult/>

### 示例响应 - 单个结果

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "generate": {
              "error": null,
              "singleResult": "This Facebook Ad will explore the fascinating history of Italian food and how it has evolved over time. Learn from Dr Eva Del Soldato and Diego Zancani, two experts in Italian food history, about how even the emoji for pasta isn't just pasta -- it's a steaming plate of spaghetti heaped with tomato sauce on top. Discover how Italy's complex history has shaped the Italian food we know and love today."
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

以下是一个查询的示例，其中:
* 我们运行了一个向量搜索（使用`nearText`）来查找关于金融的出版物，
* 然后我们要求生成器模块解释为什么这些文章与金融有关。

import OpenAIGroupedResult from '/_includes/code/generative.openai.groupedresult.mdx';

<OpenAIGroupedResult />

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
              "groupedResult": "The Financial Times, Wall Street Journal, and The New York Times Company are all about finance because they provide news and analysis on the latest financial markets, economic trends, and business developments. They also provide advice and commentary on personal finance, investments, and other financial topics."
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

### 支持的模型（OpenAI）

您可以使用以下任意模型：

* [gpt-3.5-turbo](https://platform.openai.com/docs/models/gpt-3-5)（默认）
* [gpt-4](https://platform.openai.com/docs/models/gpt-4)
* [gpt-4-32k](https://platform.openai.com/docs/models/gpt-4)

该模块还支持以下旧版模型（不建议使用）：

* [davinci 002](https://platform.openai.com/docs/models/overview)
* [davinci 003](https://platform.openai.com/docs/models/overview)

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />