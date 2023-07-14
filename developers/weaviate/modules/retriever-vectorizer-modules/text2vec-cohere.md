---
image: og/docs/modules/text2vec-cohere.jpg
sidebar_position: 1
title: text2vec-cohere
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

* 此模块使用第三方API可能会产生费用。
* 在对大量数据进行向量化之前，请确保查看Cohere的[定价页面](https://cohere.com/pricing)。
* 当使用批处理端点时，Weaviate会自动并行化向Cohere-API发出的请求。

## 简介

`text2vec-cohere`模块使您能够在Weaviate中使用[Cohere嵌入](https://docs.cohere.com/docs/embeddings)来表示数据对象并运行语义（`nearText`）查询。

## 如何启用

通过[Cohere仪表板](https://dashboard.cohere.com/welcome/login)申请Cohere API密钥。

### Weaviate云服务

此模块在WCS上默认启用。

### Weaviate开源版本

您可以在下面找到一个示例的Docker-compose文件，它将使用Cohere模块启动Weaviate。

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
      ENABLE_MODULES: text2vec-cohere
      COHERE_APIKEY: sk-foobar # request a key on cohere.com, setting this parameter is optional, you can also provide the API key at runtime
      CLUSTER_HOSTNAME: 'node1'
...
```

import T2VInferenceYamlNotes from './_components/text2vec.inference.yaml.notes.mdx';

<T2VInferenceYamlNotes apiname="COHERE_APIKEY"/>

## 如何配置

在您的Weaviate模式中，您必须定义您希望该模块如何对数据进行向量化。如果您对Weaviate模式还不熟悉，您可能想先查阅[Weaviate模式教程](/developers/weaviate/tutorials/schema.md)。

下面的模式配置告诉Weaviate使用`text2vec-cohere`对`Document`类进行向量化，使用`multilingual-22-12`模型，并且不通过Cohere API进行输入截断。

:::info
The multilingual models use dot product, and the English model uses cosine. Make sure to set this accordingly in your Weaviate schema. You can see supported distance metrics [here](../../config-refs/distances.md).
:::

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-cohere",
      "vectorIndexConfig": {
        "distance": "dot" // <== Cohere models use dot product instead of the Weaviate default cosine
      },
      "moduleConfig": {
        "text2vec-cohere": {
          "model": "multilingual-22-12", // <== defaults to multilingual-22-12 if not set
          "truncate": "RIGHT" // <== defaults to RIGHT if not set
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            "text2vec-cohere": {
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

## 使用方法

* 如果`text2vec-cohere`模块中未设置Cohere API密钥，则可以在查询时通过将以下内容添加到HTTP头部来设置API密钥: `X-Cohere-Api-Key: YOUR-COHERE-API-KEY`。
* 使用此模块将启用[GraphQL向量搜索操作符](/developers/weaviate/api/graphql/vector-search-parameters.md#neartext)。

### 示例

import GraphQLFiltersNearNextCohere from '/_includes/code/graphql.filters.nearText.cohere.mdx';

<GraphQLFiltersNearNextCohere/>

## 附加信息

### 可用的模型

除非另有指定，Weaviate默认使用Cohere的`multilingual-22-12`嵌入模型。

例如，以下模式配置将设置Weaviate将`Document`类使用`text2vec-cohere`和`multilingual-22-12`模型进行向量化。

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-cohere",
      "vectorIndexConfig": {
        "distance": "dot"
      },
      "moduleConfig": {
        "text2vec-cohere": {
          "model": "multilingual-22-12"
        }
```

### 截断

如果输入文本包含太多的标记并且没有进行截断，API将会抛出一个错误。Cohere API可以设置自动截断输入文本。

您可以使用`truncate`参数将截断选项设置为`RIGHT`或`NONE`。传递RIGHT将丢弃输入的右侧部分，剩余的输入恰好是模型的最大输入标记长度。[来源](https://docs.cohere.com/reference/embed)

* 截断的好处是批量导入总是成功的。
* 截断的缺点（即 `NONE`）是在用户没有意识到截断的情况下对大文本进行部分向量化。

### Cohere 速率限制

由于您将根据自己的 API 密钥获取嵌入向量，因此您将面对适用于您帐户的速率限制。有关 Cohere 速率限制的更多信息，请参阅[此处](https://docs.cohere.com/docs/going-live)。

### 在应用程序中限制导入速率

如果遇到速率限制，您也可以决定在应用程序中限制导入速率。

例如，在使用Weaviate客户端的Python和Go中。

import CodeThrottlingExample from '/_includes/code/text2vec-api.throttling.example.mdx';

<CodeThrottlingExample />

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />