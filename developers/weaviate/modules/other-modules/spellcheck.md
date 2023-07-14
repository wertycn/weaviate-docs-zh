---
image: og/docs/modules/text-spellcheck.jpg
sidebar_position: 1
title: Spell Check
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

* 拼写检查模块是一个用于在GraphQL查询中检查原始文本拼写的Weaviate模块。
* 该模块依赖于一个Python拼写检查库。
* 该模块在GraphQL的`nearText {}`搜索参数中添加了一个`spellCheck {}`过滤器。
* 该模块在GraphQL的`_additional { spellCheck {} }`字段中返回拼写检查结果。

拼写检查模块是Weaviate的一个模块，用于检查GraphQL查询输入中原始文本的拼写。使用 [Python spellchecker](https://pypi.org/project/pyspellchecker/) 库，该模块分析文本，给出建议并可以强制自动更正。

## 如何启用（模块配置）

### Docker-compose

拼写检查模块可以作为一个服务添加到Docker-compose文件中。您必须运行一个文本向量化器，如`text2vec-contextionary`或`text2vec-transformers`。以下是使用`text2vec-contextionary`和`text-spellcheck`模块的示例Docker-compose文件:

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
    image: semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    restart: on-failure:0
    environment:
      CONTEXTIONARY_URL: contextionary:9999
      SPELLCHECK_INFERENCE_API: "http://text-spellcheck:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-contextionary'
      ENABLE_MODULES: 'text2vec-contextionary,text-spellcheck'
      CLUSTER_HOSTNAME: 'node1'
  contextionary:
    environment:
      OCCURRENCE_WEIGHT_LINEAR_FACTOR: 0.75
      EXTENSIONS_STORAGE_MODE: weaviate
      EXTENSIONS_STORAGE_ORIGIN: http://weaviate:8080
      NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE: 5
      ENABLE_COMPOUND_SPLITTING: 'false'
    image: semitechnologies/contextionary:en0.16.0-v1.0.2
    ports:
    - 9999:9999
  text-spellcheck:
    image: semitechnologies/text-spellcheck-model:pyspellchecker-d933122
...
```

变量解释:
* `SPELLCHECK_INFERENCE_API`: 拼写检查模块运行的位置

## 如何使用（GraphQL）

使用拼写检查模块在查询时验证用户提供的搜索查询拼写是否正确，并提供替代的正确拼写建议。接受查询文本的筛选器包括:

* [`nearText`](/developers/weaviate/api/graphql/vector-search-parameters.md#neartext)，如果使用了 `text2vec-*` 模块
* `ask`，如果启用了[`qna-transformers`](../reader-generator-modules/qna-transformers.md)模块

使用此模块有两种方式：拼写检查和自动纠正。

### 拼写检查

该模块提供了一个新的GraphQL `_additional`属性，可以用于检查（但不修改）提供的查询。

#### 示例查询

import SpellCheckModule from '/_includes/code/spellcheck-module.mdx';

<SpellCheckModule/>

#### GraphQL响应

结果包含在一个新的GraphQL `_additional` 属性中，名为 `spellCheck`。它包含以下字段：
* `changes`：包含以下字段的列表：
  * `corrected`（`string`）：如果找到纠正，则为纠正后的拼写
  * `original`（`string`）：查询中的原始单词
* `didYouMean`：查询中的纠正后的完整文本
* `originalText`：查询中的原始完整文本
* `location`：查询中拼写错误字符串的位置

#### 示例响应

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "spellCheck": [
              {
                "changes": [
                  {
                    "corrected": "housing",
                    "original": "houssing"
                  }
                ],
                "didYouMean": "housing prices",
                "location": "nearText.concepts[0]",
                "originalText": "houssing prices"
              }
            ]
          },
          "title": "..."
        }
      ]
    }
  },
  "errors": null
}
```

### 自动纠正

该模块通过添加一个`autoCorrect`标志来扩展现有的`text2vec-*`模块，如果查询拼写错误，可以自动纠正查询：

#### 示例查询

```graphql
{
  Get {
    Article(nearText: {
      concepts: ["houssing prices"],
      autocorrect: true
    }) {
      title
      _additional {
        spellCheck {
          changes {
            corrected
            original
          }
          didYouMean
          location
          originalText
        }
      }
    }
  }
}
```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />