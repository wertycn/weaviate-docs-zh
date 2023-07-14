---
image: og/docs/modules/text2vec-openai.jpg
sidebar_position: 1
title: text2vec-openai
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简而言之

* 该模块使用第三方 API，可能会产生费用。
* 在对大量数据进行向量化之前，请检查供应商定价（例如，[OpenAI 定价页面](https://openai.com/api/pricing/)）。
* 当使用批处理端点时，Weaviate 会自动并行化对 API 的请求。
* 请查看[text2vec-openai 演示](https://github.com/weaviate/DEMO-text2vec-openai)。
* 您需要从OpenAI或Azure OpenAI获取API密钥才能使用此模块。
* 默认的OpenAI模型是`text-embedding-ada-002`。

## 概述

`text2vec-openai`模块使您能够在Weaviate或Azure中使用[OpenAI](https://platform.openai.com/docs/guides/embeddings)或[Azure](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/concepts/understand-embeddings)嵌入来表示数据对象。

import OpenAIOrAzureOpenAI from '/_includes/openai.or.azure.openai.mdx';

<OpenAIOrAzureOpenAI/>

## 模块配置

:::tip Not applicable to WCS
This module is enabled and pre-configured on Weaviate Cloud Services.
:::

### 配置文件（仅适用于Weaviate开源版）

您可以在配置文件（例如`docker-compose.yaml`）中启用`text2vec-openai`模块。

- 此配置将启动具有启用的OpenAI模块的Weaviate，并将其设置为默认的向量化模块。
- 可选地，您可以在文件中指定所需的API密钥。
    - 如果您没有指定，您必须在运行时指定API密钥。

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
      DEFAULT_VECTORIZER_MODULE: text2vec-openai
      ENABLE_MODULES: text2vec-openai
      OPENAI_APIKEY: sk-foobar  # For use with OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      AZURE_APIKEY: sk-foobar  # For use with Azure OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      CLUSTER_HOSTNAME: 'node1'
...
```

import T2VInferenceYamlNotes from './_components/text2vec.inference.yaml.notes.mdx';

<T2VInferenceYamlNotes apiname="OPENAI_APIKEY"/>

## 模式配置

您可以通过模式提供额外的模块配置。您可以在[这里了解有关模式的信息](/developers/weaviate/tutorials/schema.md)。

对于`text2vec-openai`，您可以设置矢量化模型和矢量化行为。

### OpenAI 设置

在模式的`moduleConfig`部分中，使用参数`model`、`modelVersion`和`type`来设置向量化模型：

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-openai",
      "moduleConfig": {
        "text2vec-openai": {
          "model": "ada",
          "modelVersion": "002",
          "type": "text"
        }
      },
    }
  ]
}
```

### Azure OpenAI设置

在模式的`moduleConfig`部分中设置参数`resourceName`和`deploymentId`：

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-openai",
      "moduleConfig": {
        "text2vec-openai": {
          "resourceName": "<YOUR-RESOURCE-NAME>",
          "deploymentId": "<YOUR-MODEL-NAME>",
        }
      }
    }
  ]
}
```

### 向量化器行为

使用每个属性下的 `moduleConfig` 部分来设置属性级别的向量化器行为：

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-openai",
      "moduleConfig": {
        "text2vec-openai": {
          "model": "ada",
          "modelVersion": "002",
          "type": "text"
        }
      },
      "properties": [
        {
          "dataType": ["text"],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            "text2vec-openai": {
              "skip": false,
              "vectorizePropertyName": false
            }
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

### 提供 API 密钥

如果在`text2vec-openai`配置中未设置 API 密钥，您可以在进行查询时提供它。

您可以通过将适当的密钥添加到 HTTP 标头来实现这一点：
- `X-OpenAI-Api-Key: YOUR-OPENAI-API-KEY` 用于 OpenAI，以及
- `X-Azure-Api-Key: YOUR-AZURE-API-KEY` 用于 Azure OpenAI，并且

### 示例

import CodeNearText from '/_includes/code/graphql.filters.nearText.openai.mdx';

<CodeNearText />

## 附加信息

### 可用的模型 (OpenAI)

OpenAI提供了多个具有不同权衡的模型。所有由OpenAI提供的模型都可以在Weaviate中使用。请注意，模型产生的维度越多，您的数据占用空间就越大。要估算数据集的总大小，请使用[此计算方法](/developers/weaviate/concepts/resources.md#an-example-calculation)。

默认模型是`text-embedding-ada-002`，但您也可以在模式中指定它。以下是一个类定义的示例：

```json
{
  "classes": [
    {
      "class": "Document",
      "vectorizer": "text2vec-openai",
      "moduleConfig": {
        "text2vec-openai": {
          "model": "ada",
          "modelVersion": "002",
          "type": "text"
        }
      }
    }
  ]
}
```

对于文档嵌入，可以从以下模型中选择：
* [ada](https://platform.openai.com/docs/models/ada)
* [babbage](https://platform.openai.com/docs/models/babbage)
* [curie](https://platform.openai.com/docs/models/curie)
* [davinci](https://platform.openai.com/docs/models/davinci)

有关代码嵌入，请参阅[Codex模型](https://platform.openai.com/docs/models/codex)。

在类的`moduleConfig`中，您需要设置两个值：

1. `model` - 上述模型之一，例如 `davinci`。
2. `modelVersion` - 版本字符串，例如 `003`。
3. `type` - `text` 或 `code`。

示例（作为类定义的一部分）：

```json
{
  "classes": [
    {
      "class": "Document",
      "vectorizer": "text2vec-openai",
      "moduleConfig": {
        "text2vec-openai": {
          "model": "ada",
          "modelVersion": "002",
          "type": "text"
        }
      }
    }
  ]
}
```

### OpenAI的速率限制

由于您将使用自己的API密钥获取嵌入向量，因此与您的账户相关的任何速率限制也将适用于您在Weaviate中的使用。

如果您超过了速率限制，Weaviate将输出由OpenAI API生成的错误消息。您可以通过发送电子邮件到`support@openai.com`来描述您在Weaviate中的用例，以请求增加您的速率限制。

### 在应用程序中限制导入速度

一种处理速率限制的方法是在应用程序中进行导入节流。例如，在使用Python或Java中的Weaviate客户端时：

import CodeThrottlingExample from '/_includes/code/text2vec-api.throttling.example.mdx';

<CodeThrottlingExample />

当前速率限制将显示在错误消息中，如下所示：

```json
{
  "message": "Rate limit reached for requests. Limit: 600.000000 / min. Current: 1024.000000 / min. Contact support@openai.com if you continue to have issues."
}
```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />