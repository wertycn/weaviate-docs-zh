---
image: og/docs/modules/text2vec-cohere.jpg
sidebar_position: 10
title: reranker-cohere
---

## 简介

`reranker-cohere` 模块使得可以将[Cohere reranking](https://txt.cohere.com/rerank/)作为向量、bm25和混合搜索的[第二阶段重新排序](../../search/rerank.md)结果。该模型支持[100+种语言](https://docs.cohere.com/docs/supported-languages?ref=txt.cohere.com)。

该模块使用第三方API，可能会产生费用。在对大量数据应用重新排序之前，请务必查看Cohere的[定价页面](https://cohere.com/pricing)。

## 如何启用

对Cohere的请求需要一个API密钥。如果您想要在Weaviate实例中提供API密钥，您需要一个通过[其仪表板](https://dashboard.cohere.com)获得的Cohere API密钥。如果您希望客户自己提供Cohere API密钥（推荐），则此步骤是不必要的。

### Weaviate云服务

此模块在WCS上默认启用。

### Weaviate开源版

将 `reranker-cohere` 添加到 `ENABLE_MODULES` 环境变量中。

以下是一个示例的Docker Compose文件，它将启动Weaviate，并使用[Cohere text2vec](./text2vec-cohere.md)和reranker模块。

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
      DEFAULT_VECTORIZER_MODULE: text2vec-cohere
      ENABLE_MODULES: text2vec-cohere,reranker-cohere
      COHERE_APIKEY: sk-...  # optional, as described above
      CLUSTER_HOSTNAME: 'node1'
...
```

import T2VInferenceYamlNotes from './_components/text2vec.inference.yaml.notes.mdx';

<T2VInferenceYamlNotes apiname="COHERE_APIKEY"/>


## 使用方法

* 如果未设置`COHERE_APIKEY`环境变量，客户端可以在查询时通过添加以下HTTP头部来设置API密钥：`X-Cohere-Api-Key: YOUR-COHERE-API-KEY`。
* 使用此模块将启用[`rerank` GraphQL _additional property](../../api/graphql/additional-properties.md#rerank)。
* 查看使用示例，请参阅[如何使用：搜索 - 重新排名](../../search/rerank.md)页面。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />