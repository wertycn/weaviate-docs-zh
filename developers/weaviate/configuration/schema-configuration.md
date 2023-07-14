---
image: og/docs/configuration.jpg
sidebar_position: 1
title: Schema
---

import Badges from '/_includes/badges.mdx';

<Badges/>

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/configure.schema.py';
import TSCode from '!!raw-loader!/_includes/code/howto/configure.schema.ts';

# 如何配置模式

## 概述

本页包含关于如何在Weaviate中配置模式的信息。有关其他与模式相关的信息，请参见下面的相关页面。

:::info Related pages
- [Tutorial: Schema](../tutorials/schema.md)
- [References: Schema](../config-refs/schema.md)
- [References: REST API: Schema](../api/rest/schema.md)
- [Concepts: Data Structure](../concepts/data.md)
:::

### 自动模式

当数据导入的类定义缺失或不完整时，自动模式功能会根据对象属性和默认值进行推断（[了解更多](../config-refs/schema.md#auto-schema)）。

然而，您可能更倾向于手动定义模式，以确保模式与您的特定要求相符。

## 创建一个类

:::info Capitalization
Class and property names are treated equally no matter how the first letter is cased, eg "Article" == "article".

Generally, however, Weaviate follows GraphQL conventions where classes start with a capital letter and properties start with a lowercase letter.
:::

一个类描述了一组数据对象。它们被定义为模式的一部分，如下面的示例所示。

### 最简例子

至少，您必须为类名指定`class`参数。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CreateClass"
      endMarker="# END CreateClass"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START CreateClass"
      endMarker="// END CreateClass"
      language="ts"
    />
  </TabItem>
</Tabs>


### 属性定义

您可以使用 `properties` 来指定属性。类定义可以包含任意数量的属性。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START PropertyDefinition"
      endMarker="# END PropertyDefinition"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START PropertyDefinition"
      endMarker="// END PropertyDefinition"
      language="ts"
    />
  </TabItem>
</Tabs>


除了属性名称外，您还可以配置参数，例如数据类型、倒排索引标记化等。

- [属性对象配置参考](../config-refs/schema.md#property-object)
- [可用的数据类型](../config-refs/datatypes.md)


### 指定一个向量化器

您可以为每个类设置一个可选的 `vectorizer`，它将覆盖配置中存在的任何默认值（例如，在[环境变量](../config-refs/env-vars.md)中）。以下示例将 `text2vec-openai` 模块设置为 `Article` 类的向量化器。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START Vectorizer"
      endMarker="# END Vectorizer"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START Vectorizer"
      endMarker="// END Vectorizer"
      language="ts"
    />
  </TabItem>
</Tabs>

- [可用的向量化器](../modules/retriever-vectorizer-modules/index.md)
- [Vectorizer配置参考](../config-refs/schema.md#vectorizer)

### 类级别的模块设置

您可以在类级别上设置`moduleConfig`参数，以设置模块行为的类级别设置。例如，可以配置矢量化器来设置使用的模型(`model`)，或者是否对类名进行矢量化(`vectorizeClassName`)。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ModuleSettings"
      endMarker="# END ModuleSettings"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ModuleSettings"
      endMarker="// END ModuleSettings"
      language="ts"
    />
  </TabItem>
</Tabs>

可用参数根据模块的不同而变化（[了解更多](../modules/index.md)）。

### 模块级别的设置

您还可以在属性级别上设置`moduleConfig`参数，以设置模块行为的属性级别设置。例如，您可以设置是否对属性名称进行向量化(`vectorizePropertyName`)，或者完全跳过属性的向量化(`skip`)。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START PropModuleSettings"
      endMarker="# END PropModuleSettings"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START PropModuleSettings"
      endMarker="// END PropModuleSettings"
      language="ts"
    />
  </TabItem>
</Tabs>

可用参数根据模块而异（[了解更多](../modules/index.md)）。

### 索引、分片和复制设置

您还可以通过模式设置索引、分片和复制设置。例如，可以为一个类设置向量索引距离度量，并设置复制因子，如下所示。

:::note
You will need a [multi-node setup](../installation/docker-compose.md#multi-node-setup) to test locally replication factors greater than 1.
:::

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START IndexReplicationSettings"
      endMarker="# END IndexReplicationSettings"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START IndexReplicationSettings"
      endMarker="// END IndexReplicationSettings"
      language="ts"
    />
  </TabItem>
</Tabs>


您可以在下面了解更多关于各种参数的信息：

- [向量索引配置参考](../config-refs/schema.md#vectorindexconfig)
- [倒排索引配置参考](../config-refs/schema.md#invertedindexconfig--stopwords-stopword-lists)
- [分片配置参考](../config-refs/schema.md#shardingconfig)
- [复制配置参考](../config-refs/schema.md#replicationconfig)

### 多租户

:::info Available from `v1.20` onwards
:::

为了启用多租户功能，您必须在类定义中将`multiTenancyConfig`键设置为`{"enabled": true}`。

```json
{
  "class": "MultiTenancyClass",
  // highlight-start
  "multiTenancyConfig": {"enabled": true}
  // highlight-end
}
```

有关多租户操作的更多详细信息，请参阅[多租户操作页面](../manage-data/multi-tenancy.md)。

## 删除一个类

import CautionSchemaDeleteClass from '/_includes/schema-delete-class.mdx'

<CautionSchemaDeleteClass />

## 更新类定义

类定义的某些部分可以更新，而其他部分是不可变的。

以下部分描述了如何在类中添加属性或修改参数。

### 添加属性

一个新属性可以添加到现有的类中。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START AddProp"
      endMarker="# END AddProp"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START AddProp"
      endMarker="// END AddProp"
      language="ts"
    />
  </TabItem>
</Tabs>

:::info Property removal/change currently not possible
Currently, a property cannot be removed from a class definition or renamed once it has been added. This is due to the high compute cost associated with reindexing the data in such scenarios.
:::

### 修改参数

您可以修改模式的一些参数，如下所示。但是，许多参数是不可变的，一旦设置就无法更改。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ModifyParam"
      endMarker="# END ModifyParam"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">

  > 即将推出（请为[功能请求](https://github.com/weaviate/typescript-client/issues/72)投票）

</TabItem>
</Tabs>

## 查看模式

如果您想查看模式，可以按照下面的示例检索它。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START SchemaGet"
      endMarker="# END SchemaGet"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START SchemaGet"
      endMarker="// END SchemaGet"
      language="ts"
    />
  </TabItem>
</Tabs>

响应将是一个JSON对象，例如下面的示例。

<details>
  <summary>示例模式</summary>

```json
{
  "classes": [
    {
      "class": "Article",
      "invertedIndexConfig": {
        "bm25": {
          "b": 0.75,
          "k1": 1.2
        },
        "cleanupIntervalSeconds": 60,
        "stopwords": {
          "additions": null,
          "preset": "en",
          "removals": null
        }
      },
      "moduleConfig": {
        "text2vec-openai": {
          "model": "ada",
          "modelVersion": "002",
          "type": "text",
          "vectorizeClassName": true
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "moduleConfig": {
            "text2vec-openai": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "name": "title",
          "tokenization": "word"
        },
        {
          "dataType": [
            "text"
          ],
          "moduleConfig": {
            "text2vec-openai": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "name": "body",
          "tokenization": "word"
        }
      ],
      "replicationConfig": {
        "factor": 1
      },
      "shardingConfig": {
        "virtualPerPhysical": 128,
        "desiredCount": 1,
        "actualCount": 1,
        "desiredVirtualCount": 128,
        "actualVirtualCount": 128,
        "key": "_id",
        "strategy": "hash",
        "function": "murmur3"
      },
      "vectorIndexConfig": {
        "skip": false,
        "cleanupIntervalSeconds": 300,
        "maxConnections": 64,
        "efConstruction": 128,
        "ef": -1,
        "dynamicEfMin": 100,
        "dynamicEfMax": 500,
        "dynamicEfFactor": 8,
        "vectorCacheMaxObjects": 1000000000000,
        "flatSearchCutoff": 40000,
        "distance": "cosine",
        "pq": {
          "enabled": false,
          "bitCompression": false,
          "segments": 0,
          "centroids": 256,
          "encoder": {
            "type": "kmeans",
            "distribution": "log-normal"
          }
        }
      },
      "vectorIndexType": "hnsw",
      "vectorizer": "text2vec-openai"
    }
  ]
}
```

</details>

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />