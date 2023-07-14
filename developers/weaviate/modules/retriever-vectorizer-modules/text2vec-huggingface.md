---
image: og/docs/modules/text2vec-huggingface.jpg
sidebar_position: 2
title: text2vec-huggingface
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

`text2vec-huggingface` 模块允许您在 Weaviate 中直接使用[Hugging Face 模型](https://huggingface.co/models)作为向量化模块。当您创建一个使用该模块的 Weaviate 类时，它将自动使用所选模型对您的数据进行向量化。

* 注意：该模块使用第三方 API。
* 注意：在对大量数据进行向量化之前，请确保查看推理[定价页面](https://huggingface.co/inference-api#pricing)。
* 注意：当使用批处理端点时，Weaviate会自动并行化对推理API的请求。
* 注意：此模块仅支持[句子相似度](https://huggingface.co/models?pipeline_tag=sentence-similarity)模型。

## 如何启用

通过[Hugging Face网站](https://huggingface.co/settings/tokens)申请Hugging Face API令牌。

### Weaviate云服务

该模块在WCS上默认启用。

### Weaviate开源版

以下是一个示例的Docker-compose文件，可以使用Hugging Face模块启动Weaviate。

```yaml
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
      DEFAULT_VECTORIZER_MODULE: text2vec-huggingface
      ENABLE_MODULES: text2vec-huggingface
      HUGGINGFACE_APIKEY: sk-foobar # request a key on huggingface.co, setting this parameter is optional, you can also provide the API key at runtime
      CLUSTER_HOSTNAME: 'node1'
```

import T2VInferenceYamlNotes from './_components/text2vec.inference.yaml.notes.mdx';

<T2VInferenceYamlNotes apiname="HUGGINGFACE_APIKEY"/>

## 如何配置

在您的Weaviate模式中，您必须定义如何将数据向量化的方式。如果您对Weaviate模式还不熟悉，可以先查看[Weaviate模式教程](/developers/weaviate/tutorials/schema.md)。

例如，下面的模式配置将设置Weaviate将`Document`类使用`text2vec-huggingface`和`all-MiniLM-L6-v2`模型进行向量化。

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "moduleConfig": {
        "text2vec-huggingface": {
          "model": "sentence-transformers/all-MiniLM-L6-v2",
          "options": {
            "waitForModel": true,
            "useGPU": true,
            "useCache": true
          }
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            "text2vec-huggingface": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "name": "content"
        }
      ],
      "vectorizer": "text2vec-huggingface"
    }
  ]
}
```

## 使用方法

* 如果在 `text2vec-huggingface` 模块中未设置 Hugging Face API 密钥，您可以在查询时通过添加以下内容到 HTTP 标头来设置 API 密钥: `X-Huggingface-Api-Key: YOUR-HUGGINGFACE-API-KEY`。
* 使用此模块将启用 [GraphQL 向量搜索运算符](/developers/weaviate/api/graphql/vector-search-parameters.md#neartext)。

### 示例

import CodeNearText from '/_includes/code/graphql.filters.nearText.huggingface.mdx';

<CodeNearText />

## 附加信息

### 支持 Hugging Face 推理端点

`text2vec-huggingface` 模块还支持[Hugging Face推断端点](https://huggingface.co/inference-endpoints)，您可以将自己的模型部署为端点。要在 `text2vec-huggingface` 模块中使用自己的 Hugging Face 推断端点进行向量化，只需将端点 URL 作为 `endpointURL` 设置传递给类配置即可。请注意，仅支持`特征提取`推断端点类型。

### 可用设置

在模式中，在类级别上，可以添加以下设置：

| 设置项 | 类型 | 描述 | 示例 |
| --- | --- | --- | --- |
| `model` | `string` | 这可以是任何公开或私有的Hugging Face模型，[句子相似性模型](https://huggingface.co/models?pipeline_tag=sentence-similarity&sort=downloads)在向量化方面效果最佳。<br/><br/>不要与`queryModel`或`passageModel`一起使用。 | `"bert-base-uncased"` |
| `passageModel` | `string` | DPR段落模型。<br/><br/>应该与`queryModel`一起设置，但不需要`model`。 | `"sentence-transformers/facebook-dpr-ctx_encoder-single-nq-base"` |
| `queryModel` | `string` | DPR查询模型。<br/><br/>应该与`passageModel`一起设置，但不需要`model`。 | `"sentence-transformers/facebook-dpr-question_encoder-single-nq-base"` |
| `options.waitForModel` | `boolean` | 如果模型还没有准备好，等待它而不是返回503。 | |
| `options.useGPU` | `boolean` | 是否使用GPU进行推理，而不是CPU。<br/>(需要Hugginface的[启动计划](https://huggingface.co/inference-api#pricing)或更高级别的计划) | |
| `options.useCache` | `boolean` | 推理 API 上有一个缓存层，可以加速已经看过的请求。大多数模型可以直接使用这些结果，因为模型是确定性的（即结果总是相同的）。但是，如果您使用的是非确定性模型，您可以设置此参数，以防止使用缓存机制，从而得到一个真正的新查询。 | |
| `endpointURL` | `string` | 这可以是任何公共或私有的Hugging Face推理URL。要了解如何部署自己的Hugging Face推理端点，请点击[这里](https://huggingface.co/inference-endpoints)。<br/><br/>注意：当设置了这个变量时，模块将忽略模型设置，如`model`、`queryModel`和`passageModel`。 | |

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />