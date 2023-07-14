---
image: og/docs/api.jpg
sidebar_position: 11
title: REST - /v1/schema
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::note
From `v1.5.0` onwards, creating a schema is optional. Learn more about [Auto Schema](/developers/weaviate/config-refs/schema.md#auto-schema).
:::

## 获取模式

转储当前的Weaviate模式。结果包含一个对象数组。

### 方法和URL

```js
GET /v1/schema
```

### 示例请求

import CodeSchemaDump from '/_includes/code/schema.dump.mdx';

<CodeSchemaDump />

### 示例响应
<!-- TODO: 这个真的需要这么长吗？ -->

```json
{
  "classes": [
    {
      "class": "Category",
      "description": "Category an article is a type off",
      "moduleConfig": {
        "text2vec-contextionary": {
          "vectorizeClassName": false
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "category name",
          "indexFilterable": true,
          "indexSearchable": true,
          "moduleConfig": {
            "text2vec-contextionary": {
              "vectorizePropertyName": false
            }
          },
          "name": "name"
        }
      ],
      "vectorIndexType": "hnsw",
      "vectorizer": "none"
    },
    {
      "class": "Publication",
      "description": "A publication with an online source",
      "moduleConfig": {
        "text2vec-contextionary": {
          "vectorizeClassName": false
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Name of the publication",
          "name": "name"
        },
        {
          "dataType": [
            "geoCoordinates"
          ],
          "description": "Geo location of the HQ",
          "name": "headquartersGeoLocation"
        },
        {
          "dataType": [
            "Article"
          ],
          "description": "The articles this publication has",
          "name": "hasArticles"
        },
        {
          "dataType": [
            "Article"
          ],
          "description": "Articles this author wrote",
          "name": "wroteArticles"
        }
      ],
      "vectorIndexType": "hnsw",
      "vectorizer": "none"
    },
    {
      "class": "Author",
      "description": "Normalised types",
      "moduleConfig": {
        "text2vec-contextionary": {
          "vectorizeClassName": true
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Name of the author",
          "name": "name"
        },
        {
          "dataType": [
            "Publication"
          ],
          "description": "The publication this author writes for",
          "name": "writesFor"
        }
      ],
      "vectorIndexType": "hnsw",
      "vectorizer": "none"
    },
    {
      "class": "Article",
      "description": "Normalised types",
      "moduleConfig": {
        "text2vec-contextionary": {
          "vectorizeClassName": false
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "title of the article",
          "indexFilterable": true,
          "indexSearchable": true,
          "moduleConfig": {
            "text2vec-contextionary": {
              "vectorizePropertyName": false
            }
          },
          "name": "title"
        },
        {
          "dataType": [
            "text"
          ],
          "description": "url of the article",
          "indexFilterable": true,
          "indexSearchable": false,
          "moduleConfig": {
            "text2vec-contextionary": {
              "vectorizePropertyName": false
            }
          },
          "name": "url"
        },
        {
          "dataType": [
            "text"
          ],
          "description": "summary of the article",
          "indexFilterable": true,
          "indexSearchable": true,
          "moduleConfig": {
            "text2vec-contextionary": {
              "vectorizePropertyName": false
            }
          },
          "name": "summary"
        },
        {
          "dataType": [
            "date"
          ],
          "description": "date of publication of the article",
          "name": "publicationDate"
        },
        {
          "dataType": [
            "int"
          ],
          "description": "Words in this article",
          "name": "wordCount"
        },
        {
          "dataType": [
            "Author",
            "Publication"
          ],
          "description": "authors this article has",
          "name": "hasAuthors"
        },
        {
          "dataType": [
            "Publication"
          ],
          "description": "publication this article is in",
          "name": "inPublication"
        },
        {
          "dataType": [
            "Category"
          ],
          "description": "category this article is of",
          "name": "ofCategory"
        },
        {
          "dataType": [
            "boolean"
          ],
          "description": "whether the article is currently accessible through the url",
          "name": "isAccessible"
        }
      ],
      "vectorIndexType": "hnsw",
      "vectorizer": "none"
    }
  ]
}
```

## 创建一个类

在架构中创建一个新的数据对象类。

:::note
From `v1.5.0` onwards, creating a schema is optional. Learn more about [Auto Schema](/developers/weaviate/config-refs/schema.md#auto-schema).
:::

### 方法和URL

```js
POST /v1/schema
```

### 参数

了解有关模式配置的更多信息，请点击[这里](/developers/weaviate/config-refs/schema.md)。

| 名称 | 位置 | 类型 | 描述 |
| ---- | ---- | ---- | ---- |
| `class` | 请求体 | 字符串 | 类的名称。多个单词应该使用驼峰命名法连接，例如 `ArticleAuthor`。 |
| `description` | 请求体 | 字符串 | 类的描述。 |
| `vectorIndexType` | body | string | 默认为hnsw。可以在模式定义中省略，因为现在只有这一种可用类型。 |
| `vectorIndexConfig` | body | object | 特定于向量索引类型的设置。 |
| `vectorizer` | body | string | 用于添加到此类的数据对象的向量化器。默认值可以通过Weaviate环境变量进行设置。 |
| `moduleConfig` > `text2vec-contextionary`  > `vectorizeClassName` | body | object | 在向量计算中包含类名（默认为true）。了解更多关于[Weaviate中的语义索引](/developers/weaviate/config-refs/schema.md#configure-semantic-indexing)的信息。 |
| `properties` | body | array | 一个属性对象的数组。 |
| `properties` > `dataType` | body | array | 查看[可用的数据类型](/developers/weaviate/config-refs/datatypes.md)。 |
| `properties` > `description` | body | string | 属性的描述。 |
| `properties` > `moduleConfig`  > `text2vec-contextionary` > `skip` | body | boolean | 如果为true，则整个属性将不会被包含在向量化中。默认值为false，表示对象将不会被跳过。 |
| `properties` > `moduleConfig` > `text2vec-contextionary` > `vectorizePropertyName` | body | boolean | 是否在计算数据对象的向量位置时使用属性名称。默认为true。了解有关[Weaviate中的语义索引](/developers/weaviate/config-refs/schema.md#configure-semantic-indexing)的更多信息。 |
| `properties` > `name` | body | string | 属性的名称。多个单词应使用驼峰命名法连接，例如`nameOfAuthor`。 |
| `properties` > `indexFilterable`（从 `v1.19` 开始可用） | body | boolean | 是否将存储在此属性中的数据使用可过滤的 Roaring Bitmap 索引进行索引？了解更多关于 [Weaviate 中的索引](/developers/weaviate/configuration/indexes.md#inverted-index)。 |
| `properties` > `indexSearchable`（从`v1.19`版本开始可用） | body | boolean | 是否将存储在此属性中的数据索引以允许BM25/混合搜索索引？在[Weaviate配置索引](/developers/weaviate/configuration/indexes.md#inverted-index)中了解更多信息。|
| `properties` > `indexInverted`（已弃用） | body | boolean | 是否对此属性中存储的数据进行索引？了解更多关于 [Weaviate 中的索引](/developers/weaviate/configuration/indexes.md#inverted-index)。 |
| `properties` > `tokenization` | body | string | 仅适用于`string`/`text`类型的属性。在`v1.12.0`中引入。控制字段在倒排索引中的分词方式。默认为`"word"`，可以设置为`"field"`。了解更多关于[属性分词](/developers/weaviate/config-refs/schema.md#property-tokenization)的信息。|
| `invertedIndexConfig` > `stopwords` | body | object | 配置应将哪些单词视为停用词，并在查询时忽略它们（停用词仍然被索引）。<br/> 自 `v1.18` 版本以来，停用词可以在运行时进行配置。<br/>详细信息请参阅[此处的更多详情](/developers/weaviate/config-refs/schema.md#invertedindexconfig--stopwords-stopword-lists)。 |
| `invertedIndexConfig` > `indexTimestamps` | body | boolean | 通过内部时间戳维护每个对象的倒排索引，目前包括 `creationTimeUnix` 和 `lastUpdateTimeUnix`。<br/>详细信息请参阅[此处](/developers/weaviate/config-refs/schema.md#invertedindexconfig--indextimestamps)。 |
| `replicationConfig` > `factor` | body | int | 复制因子，也称为在复制的 Weaviate 设置中的副本数量。 |
| `multiTenancyConfig` > `enabled` | body | Boolean | 是否为该类启用多租户功能。 （默认为`false`。） |

### 创建类的示例请求

import CodeSchemaCreate from '/_includes/code/schema.things.create.mdx';

<CodeSchemaCreate />

或者使用所有可能的参数：

import CodeSchemaCreateElaborate from '/_includes/code/schema.things.create.elaborate.mdx';

<CodeSchemaCreateElaborate />


## 从模式中获取单个类

检索模式中单个类的配置。

### 方法和URL

```js
GET /v1/schema/{ClassName}
```

### 示例请求

import CodeSchemaGetClass from '/_includes/code/schema.get.class.mdx';

<CodeSchemaGetClass />

## 删除一个类

从模式中删除一个类（以及所有实例中的数据）。

### 方法和URL

```js
DELETE v1/schema/{class_name}
```

### URL参数

| 名称 | 位置 | 类型 | 描述 |
| ---- | ---- | ---- | ---- |
| `{class_name}` | 路径 | 字符串 | 类的名称 |

### 删除一个类的示例请求

import CodeSchemaDelete from '/_includes/code/schema.things.delete.mdx';

<CodeSchemaDelete />

## 更新一个类

更新现有模式类的设置。

使用此端点来更改模式中的现有类。请注意，并非所有设置都可更改。如果返回有关不可变字段的错误，并且您仍然需要更新此特定设置，则必须删除类（以及底层数据）并重新创建。此端点不能用于修改属性。而是使用[`POST /v1/schema/{ClassName}/properties`](#add-a-property)。此端点的典型用例是更新配置，如`vectorIndexConfig`。请注意，即使在可更改的部分（如`vectorIndexConfig`）中，某些字段也可能是不可变的。

您应该在此PUT请求中附加一个请求体，其中包含类的**完整**新配置。

### 方法和URL

```js
PUT v1/schema/{class_name}
```

### 参数

URL 必须包含以下参数：

| 名称 | 位置 | 类型 | 描述 |
| ---- | ------ | ---- | ------ |
| `{class_name}` | 路径 | 字符串 | 类的名称 |

PUT 请求体中的参数：

| 名称 | 位置 | 类型 | 描述 |
| ---- | ------ | ---- | ------ |
| `class` | 请求体 | 字符串 | 类的名称。多个单词应该使用驼峰命名法连接，例如 `ArticleAuthor`。 |
| `description` | body | string | 类的描述。 |
| `vectorIndexType` | body | string | 默认为hnsw。可以在模式定义中省略，因为这是目前唯一可用的类型。 |
| `vectorIndexConfig` | body | object | 向量索引类型特定的设置。 |
| `vectorizer` | body | string | 用于添加到此类的数据对象的向量化器。默认值可以通过Weaviate环境变量进行设置。 |
| `moduleConfig` > `text2vec-contextionary`  > `vectorizeClassName` | body | object | 在向量计算中包含类名（默认为true）。了解有关如何在Weaviate中[配置索引](/developers/weaviate/config-refs/schema.md#configure-semantic-indexing)的更多信息。 |
| `properties` | body | array | 属性对象的数组。 |
| `properties` > `dataType` | body | array | 查看[可用的数据类型](/developers/weaviate/config-refs/datatypes.md)。 |
| `properties` > `description` | body | string | 属性的描述。 |
| `properties` > `moduleConfig`  > `text2vec-contextionary` > `skip` | body | boolean | 如果为true，整个属性将不包含在向量化中。默认值为false，表示对象将不会被跳过。 |
| `properties` > `moduleConfig` > `text2vec-contextionary` > `vectorizePropertyName` | body | boolean | 是否在数据对象的向量位置计算中使用属性的名称。默认值为true。了解更多关于如何在Weaviate中配置索引的信息。 |
| `properties` > `name` | body | string | 属性的名称。多个单词应以驼峰命名方式连接，例如`nameOfAuthor`。 |
| `properties` > `indexFilterable` (从 `v1.19` 版本开始可用) | body | boolean | 是否将存储在此属性中的数据索引为可过滤的 Roaring Bitmap 索引？了解更多关于 [在 Weaviate 中进行索引](/developers/weaviate/configuration/indexes.md#configure-semantic-indexing)。 |
| `properties` > `indexSearchable`（从`v1.19`版本开始可用） | body | boolean | 是否将存储在此属性中的数据进行索引，以允许BM25/混合搜索索引？了解更多关于[Weaviate中的索引](/developers/weaviate/configuration/indexes.md#configure-semantic-indexing)的信息。 |
| `properties` > `indexInverted` (已弃用) | body | boolean | 是否应该对此属性中存储的数据进行索引？了解更多关于[Weaviate中的索引](/developers/weaviate/configuration/indexes.md#configure-semantic-indexing)的信息。 |
| `properties` > `tokenization` | body | string | 仅适用于 `string`/`text` 类型的属性。在 `v1.12.0` 中引入。控制字段在倒排索引中的分词方式。默认为 `"word"`。如果使用 `string`，可以设置为 `"field"`。了解更多关于 [属性分词](/developers/weaviate/config-refs/schema.md#property-tokenization) 的信息。 |
| `invertedIndexConfig` > `stopwords` | body | object | 配置哪些单词应该被视为停用词，因此在查询时被忽略（停用词仍然会被索引）。<br/>自`v1.18`版本以来，停用词可以在运行时进行配置。<br/>请参阅[此处的更多详细信息](/developers/weaviate/config-refs/schema.md#invertedindexconfig--stopwords-stopword-lists)。 |
| `invertedIndexConfig` > `indexTimestamps` | body | boolean | 按照内部时间戳维护每个对象的反向索引，目前包括 `creationTimeUnix` 和 `lastUpdateTimeUnix`。详细信息请参见 [此处](/developers/weaviate/config-refs/schema.md#invertedindexconfig--indextimestamps)。 |


#### 更新类的示例请求

import CodeSchemaUpdate from '/_includes/code/schema.things.put.mdx';

<CodeSchemaUpdate />

## 添加属性

### 方法和 URL

```js
POST v1/schema/{class_name}/properties
```

### 参数

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | -----| ----------- |
| `dataType` | body | array | 可用的[数据类型](/developers/weaviate/config-refs/datatypes.md)。 |
| `description` | body | string | 属性的描述。 |
| `moduleConfig`  > `text2vec-contextionary` > `skip` | body | boolean | 如果为true，则整个属性将不会被包含在矢量化中。默认值为false，意味着对象不会被跳过。 |
| `moduleConfig`  > `text2vec-contextionary` > `vectorizePropertyName` | body | boolean | 是否在计算数据对象的向量位置时使用属性的名称。默认值为true。了解更多关于如何在Weaviate中配置索引的信息，请参阅[配置语义索引](/developers/weaviate/config-refs/schema.md#configure-semantic-indexing)。 |
| `name` | body | string | 属性的名称。多个单词应该使用驼峰命名法连接，如`nameOfAuthor`。 |
| `indexFilterable`（从`v1.19`版本开始可用） | body | boolean | 是否应该使用可过滤的Roaring Bitmap索引来索引存储在此属性中的数据？了解更多关于[Weaviate中的索引](/developers/weaviate/configuration/indexes.md#configure-semantic-indexing)的信息。 |
| `indexSearchable`（从`v1.19`版本开始可用） | body | boolean | 是否应该将存储在此属性中的数据索引以允许BM25/混合搜索索引？了解更多关于[在Weaviate中进行索引](/developers/weaviate/configuration/indexes.md#configure-semantic-indexing)的信息。 |
| `indexInverted`（已弃用） | body | boolean | 是否应该将存储在此属性中的数据索引？了解更多关于[在Weaviate中进行索引](/developers/weaviate/configuration/indexes.md#configure-semantic-indexing)的信息。 |

### 添加属性的示例请求

import CodeSchemaAddProperties from '/_includes/code/schema.things.properties.add.mdx';

<CodeSchemaAddProperties />

## 检查一个类的分片

如在[架构 > 存储](/developers/weaviate/concepts/storage.md#logical-storage-units-indices-shards-stores)中所述，创建一个类会导致创建一个索引，该索引管理所有的磁盘存储和向量索引。一个索引本身可以由多个分片组成。如果一个类索引在多个Weaviate集群节点上使用，每个节点必须至少有一个分片。

您可以查看特定类的所有分片列表：

### 方法和URL

:::note
This API was added in `v1.12.0`.
:::

```js
GET v1/schema/{class_name}/shards
```

### 参数

| 名称 | 位置 | 类型 | 描述 |
| ---- | ---- | ---- | ---- |
| `{class_name}` | URL路径 | 字符串 | 类的名称 |

### 查看类的分片示例请求

import CodeSchemaShardsGet from '/_includes/code/schema.shards.get.mdx';

<CodeSchemaShardsGet />

## 更新分片状态

一个分片可能已被标记为只读，例如因为磁盘已满。您可以使用以下API手动将分片设置为`READY`。每个客户端还提供了一个方便的函数来设置所有类别的分片的状态。

### 方法和URL

:::note
This API was added in `v1.12.0`
:::

```js
PUT v1/schema/{class_name}/shards/{shard_name}
```

### 参数

| 名称 | 位置 | 类型 | 描述 |
| ---- | ---- | ---- | ---- |
| `{class_name}` | URL路径 | 字符串 | 类的名称 |
| `{shard_name}` | URL路径 | 字符串 | 分片的名称/ID |
| `status` | 请求体 | 字符串 | 更新分片的状态，可选值为 `READONLY`、`READY` 中的一个 |

### 更新分片状态的示例请求

import CodeSchemaShardsUpdate from '/_includes/code/schema.shards.put.mdx';

<CodeSchemaShardsUpdate />

## 多租户

### 添加租户

将包含租户对象数组的有效载荷传递给`[{"name": TENANT_NAME1}, {"name": TENANT_NAME2}]`以添加到类中。租户用于在不同用户或用户组之间分隔数据。

import TenantNameFormat from '/_includes/tenant-names.mdx';

<TenantNameFormat/>

```js
POST v1/schema/{class_name}/tenants
```

### 租户列表

```js
GET v1/schema/{class_name}/tenants
```

### 移除租户

传递一个包含租户名称数组的负载，形式为 `["TENANT_NAME1", "TENANT_NAME2"]`，将其从该类中移除。

```js
DELETE v1/schema/{class_name}/tenants
```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />