---
image: og/docs/modules/text2vec-palm.jpg
sidebar_position: 1
title: text2vec-palm
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

* 本模块使用第三方API，可能会产生费用。
* 在向大量数据进行向量化之前，请查看供应商定价（例如，检查Google Vertex AI定价）。
* Weaviate在使用批处理端点时会自动并行化API请求。
* 在Weaviate `v1.19.1`中添加。
* 使用此模块需要一个PaLM API的API密钥。
* 默认模型为`textembedding-gecko`。

## 概述

`text2vec-palm`模块使您能够在Weaviate中使用PaLM嵌入表示数据对象并运行语义（`nearText`）查询。

## 推理 API 密钥

:::caution Important: Provide PaLM API key to Weaviate
As the `text2vec-palm` uses a PaLM API endpoint, you must provide a valid PaLM API key to weaviate.
:::

### 对于Google Cloud用户

这在Google Cloud中被称为`access token`。

如果您已经安装并配置了[Google Cloud CLI工具](https://cloud.google.com/cli)，您可以通过运行以下命令来查看您的令牌：

```shell
gcloud auth print-access-token
```

### 提供 Weaviate API 密钥

您可以通过请求头中提供`"X-Palm-Api-Key"`来提供您的 PaLM API 密钥。如果您使用 Weaviate 客户端，您可以像这样提供：

import ClientKey from '/_includes/code/core.client.palm.apikey.mdx';

<ClientKey />

可选（不推荐的）方法是将 PaLM API 密钥提供为环境变量。

<details>
  <summary>如何将 PaLM API 密钥提供为环境变量</summary>

在配置Docker实例时，通过在`docker-compose`文件的`environment`下添加`PALM_APIKEY`，如下所示：

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

通过配置文件（例如 `docker-compose.yaml`），您可以：
- 启用 `text2vec-palm` 模块，
- 将其设置为默认的向量化器，并且
- 提供其API密钥。

使用以下变量：

```
ENABLE_MODULES: 'text2vec-palm,generative-palm'
DEFAULT_VECTORIZER_MODULE: text2vec-palm
PALM_APIKEY: sk-foobar
```

<details>
  <summary>查看一个使用<code>text2vec-palm</code>的完整Docker配置示例</summary>

```yaml
---
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:||site.weaviate_version||
    restart: on-failure:0
    ports:
     - "8080:8080"
    environment:
      QUERY_DEFAULTS_LIMIT: 20
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: "./data"
      DEFAULT_VECTORIZER_MODULE: text2vec-palm
      ENABLE_MODULES: text2vec-palm
      PALM_APIKEY: sk-foobar  # For use with PaLM. Setting this parameter is optional; you can also provide the key at runtime.
      CLUSTER_HOSTNAME: 'node1'
...
```

</details>

import T2VInferenceYamlNotes from './_components/text2vec.inference.yaml.notes.mdx';

<T2VInferenceYamlNotes apiname="PALM_APIKEY"/>

## 架构配置

您可以通过架构提供额外的模块配置。您可以在[此处了解有关架构的更多信息](/developers/weaviate/tutorials/schema.md)。

对于 `text2vec-palm`，您可以在架构的 `moduleConfig` 部分中使用参数来设置矢量化模型和矢量化行为：

请注意，`projectId`参数是必需的。

### 示例模式

例如，以下模式配置将设置PaLM API信息。

- `"projectId"` 是必需的，可以是类似 `"cloud-large-language-models"` 的字符串，
- `"apiEndpoint"` 是可选的，可以是类似 `"us-central1-aiplatform.googleapis.com"` 的字符串，
- `"modelId"` 是可选的，可以是类似 `"textembedding-gecko"` 的字符串。

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-palm",
      "moduleConfig": {
        // highlight-start
        "text2vec-palm": {
          "projectId": "YOUR-GOOGLE-CLOUD-PROJECT-ID",    // Required. Replace with your value: (e.g. "cloud-large-language-models")
          "apiEndpoint": "YOUR-API-ENDPOINT",             // Optional. Defaults to "us-central1-aiplatform.googleapis.com".
          "modelId": "YOUR-GOOGLE-CLOUD-MODEL-ID",        // Optional. Defaults to "textembedding-gecko".
        },
        // highlight-end
      },
    }
  ]
}
```

### 向量化器行为

使用每个属性下的 `moduleConfig` 部分来设置属性级别的向量化器行为:

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-palm",
      "moduleConfig": {
        "text2vec-palm": {
          // See above for module parameters
        },
      },
      "properties": [
        {
          "dataType": ["text"],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            // highlight-start
            "text2vec-palm": {
              "skip": false,
              "vectorizePropertyName": false
            },
            // highlight-end
          },
          "name": "content"
        }
      ]
    }
  ]
}
```

## 用法

启用此模块将使[GraphQL向量搜索运算符](/developers/weaviate/api/graphql/vector-search-parameters.md#neartext)可用。

### 示例

import CodeNearText from '/_includes/code/graphql.filters.nearText.palm.mdx';

<CodeNearText />

## 附加信息

### 可用模型

您可以将模型作为模式的一部分来指定，如前面所示。

目前，唯一可用的模型是`textembedding-gecko`。

`textembedding-gecko` 模型接受最多3,072个输入标记，并输出768维的向量嵌入。

### 速率限制

由于您将使用自己的API密钥获取嵌入，与您的帐户相关的任何速率限制也将适用于您在Weaviate上的使用。

如果您超过了速率限制，Weaviate将输出由PaLM API生成的错误消息。如果问题仍然存在，我们建议您通过联系[Vertex AI支持](https://cloud.google.com/vertex-ai/docs/support/getting-support)来申请增加速率限制，并描述您在Weaviate中的使用情况。

### 在应用程序中限制导入速率

处理速率限制的一种方法是在应用程序内部限制导入速率。例如，在使用Weaviate客户端时:

import CodeThrottlingExample from '/_includes/code/text2vec-api.throttling.example.mdx';

<CodeThrottlingExample />

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />