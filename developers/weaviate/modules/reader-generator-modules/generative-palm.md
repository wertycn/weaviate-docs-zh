---
image: og/docs/modules/generative-palm.jpg
sidebar_position: 12
title: Generative Search - PaLM
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

* 生成式PaLM (`generative-palm`) 模块根据存储在您的Weaviate实例中的数据生成响应。
* 该模块可以为每个返回的对象生成一个响应，或者为一组对象生成一个单一的响应。
* 该模块在`Get {}`查询的GraphQL `_additional {}`属性中添加了一个`generate {}`参数。
* 在Weaviate版本`v1.19.1`中添加。
* 您需要一个PaLM API的API密钥来使用该模块。
* 默认模型是 `chat-bison`。

## 简介

`generative-palm` 基于存储在您的 Weaviate 实例中的数据生成响应。

该模块分为两个步骤：
1. (Weaviate) 在 Weaviate 中运行搜索查询以查找相关对象。
2. (PaLM) 使用 PaLM 模型根据结果（来自前一步骤）和提供的提示或任务生成响应。

:::note
You can use the Generative PaLM module with non-PaLM upstream modules. For example, you could use `text2vec-openai`, `text2vec-cohere` or `text2vec-huggingface` to vectorize and query your data, but then rely on the `generative-palm` module to generate a response.
:::

生成模块可以提供以下结果：
* 对于每个返回的对象，使用 `singleResult{ prompt }`
* 对于所有结果的组合，使用 `groupedResult{ task }`

您需要同时输入查询和提示（用于个别响应）或任务（用于所有响应）。

## 推理 API 密钥

:::caution Important: Provide PaLM API key to Weaviate
As the `generative-palm` uses a PaLM API endpoint, you must provide a valid PaLM API key to weaviate.
:::

### 对于Google Cloud用户

在Google Cloud中，这被称为 `access token`。

如果您已经安装并配置了[Google Cloud CLI工具](https://cloud.google.com/cli)，您可以通过运行以下命令来查看您的令牌：

```shell
gcloud auth print-access-token
```

### 提供 Weaviate 的密钥

您可以通过请求头部提供 `"X-Palm-Api-Key"` 来提供您的 PaLM API 密钥。如果您使用 Weaviate 客户端，可以像这样进行操作：

import ClientKey from '/_includes/code/core.client.palm.apikey.mdx';

<ClientKey />

可选地（不建议），您可以将 PaLM API 密钥作为环境变量提供。

<details>
  <summary>如何将 PaLM API 密钥作为环境变量提供</summary>

在配置Docker实例时，通过在`docker-compose`文件的`environment`下添加`PALM_APIKEY`，像这样：

```yaml
environment:
  PALM_APIKEY: 'your-key-goes-here'  # 设置此参数是可选的；您也可以在运行时提供密钥。
  ...
```

</details>

### Google Cloud用户的令牌过期

import GCPTokenExpiryNotes from '/_includes/gcp.token.expiry.notes.mdx';

<GCPTokenExpiryNotes/>

## 模块配置

:::tip Not applicable to WCS
This module is enabled and pre-configured on Weaviate Cloud Services.
:::

### 配置文件（仅适用于Weaviate开源版本）

您可以在配置文件（例如`docker-compose.yaml`）中启用Generative Palm模块。将`generative-palm`模块（以及您可能需要的任何其他模块）添加到`ENABLE_MODULES`属性中，如下所示：

```
ENABLE_MODULES: 'text2vec-palm,generative-palm'
```

<details>
  <summary>查看使用`generative-palm`和`text2vec-palm`模块的Docker配置的完整示例</summary>

以下是一个完整的Docker配置示例，它结合了`generative-palm`模块和`text2vec-palm`模块，并提供了API密钥：

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
      DEFAULT_VECTORIZER_MODULE: 'text2vec-palm'
      // highlight-next-line
      ENABLE_MODULES: 'text2vec-palm,generative-palm'
      PALM_APIKEY: sk-foobar  # Setting this parameter is optional; you can also provide the key at runtime.
      CLUSTER_HOSTNAME: 'node1'
```

</details>

## 模式配置

您可以在模式中定义此模块的设置，包括API端点和项目信息，以及可选的模型参数。

请注意，`projectId`参数是必需的。

### 示例模式

例如，以下模式配置将设置PaLM API信息以及可选参数。

- `"projectId"`是必需的，可以是类似`"cloud-large-language-models"`的值。
- `"apiEndpoint"` 是可选的，可能是类似于 `"us-central1-aiplatform.googleapis.com"` 的内容，
- `"modelId"` 是可选的，可能是类似于 `"chat-bison"` 的内容。

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      ...,
      "moduleConfig": {
        // highlight-start
        "generative-palm": {
          "projectId": "YOUR-GOOGLE-CLOUD-PROJECT-ID",    // Required. Replace with your value: (e.g. "cloud-large-language-models")
          "apiEndpoint": "YOUR-API-ENDPOINT",             // Optional. Defaults to "us-central1-aiplatform.googleapis.
          "modelId": "YOUR-GOOGLE-CLOUD-ENDPOINT-ID",     // Optional. Defaults to "chat-bison"
          "temperature": 0.2,      // Optional
          "maxOutputTokens": 512,  // Optional
          "topK": 3,               // Optional
          "topP": 0.95,            // Optional
        }
        // highlight-end
      }
    }
  ]
}
```

查看相关的PaLM API文档以获取有关这些参数的详细信息。

<details>
  <summary>对Weaviate Schemas不熟悉？</summary>

如果您对Weaviate不熟悉，请查看[Weaviate模式教程](/developers/weaviate/tutorials/schema.md)。

</details>

## 如何使用

该模块通过`_additional {...}`属性扩展了`generate`操作符。

`generate`接受以下参数：

| 字段 | 数据类型 | 是否必需 | 示例 | 描述 |
|- |- |- |- |- |
| `singleResult {prompt}`  | string | no | `在一条推文中概述以下内容: {summary}`  | 为每个单独的搜索结果生成响应。您需要在提示中至少包含一个结果字段，放在大括号之间。 |
| `groupedResult {task}`  | string | no | `解释为什么这些结果彼此相似`  | 为所有搜索结果生成单个响应 |

### 示例中的属性

当将结果导入到提示符时，查询返回的至少一个字段必须添加到提示符中。如果您没有添加任何字段，Weaviate将会抛出一个错误。

例如，假设您的模式如下所示：

```graphql
{
  Article {
    title
    summary
  }
}
```

您可以通过使用花括号将`title`和`summary`包裹起来，将它们添加到提示中：

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

这是一个查询的示例，其中:
* 我们运行了一个向量搜索（使用 `nearText`）来查找关于"意大利食品"的文章
* 然后我们要求生成器模块将每个结果描述为Facebook广告。
  * 查询要求返回 `summary` 字段，然后将其包含在 `generate` 操作符的 `prompt` 参数中。

import PalmSingleResult from '/_includes/code/generative.palm.singleresult.mdx';

<PalmSingleResult/>

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

以下是一个查询示例，其中：
* 我们运行了一个向量搜索（使用 `nearText` ）来查找关于金融的出版物，
* 然后我们要求生成器模块解释为什么这些文章与金融有关。

import PalmGroupedResult from '/_includes/code/generative.palm.groupedresult.mdx';

<PalmGroupedResult />

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

### 支持的模型

默认情况下使用`chat-bison`模型。该模型具有以下属性：

- 最大输入标记数：8,192
- 最大输出标记数：1,024
- 训练数据：截至2023年2月

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />