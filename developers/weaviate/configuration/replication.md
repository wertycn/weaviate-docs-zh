---
image: og/docs/configuration.jpg
sidebar_position: 60
title: Replication
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Prerequisites
- [Concepts: Replication Architecture](../concepts/replication-architecture/index.md)
:::

Weaviate实例可以进行复制以增加可用性和读取吞吐量，以及实现零停机升级。在本页面中，您将了解如何为您的Weaviate实例配置复制。

有关在Weaviate中设计和构建复制的更多信息，请参阅[复制架构](../concepts/replication-architecture/index.md)页面。

## 如何配置：模式

默认情况下，复制功能是禁用的，并且可以在[schema](./schema-configuration.md)中为每个数据类启用。这意味着您可以在数据集中为每个类设置不同的复制因子。要在类上启用复制功能，必须设置复制因子，示例如下：


```yaml
{
  "class": "ExampleClass",
  "properties": [
    {
      "name": "exampleProperty",
      "dataType": [
        "text"
      ]
    }
  ],
  # highlight-start
  "replicationConfig": {
    "factor": 3   # Integer, default 1. How many copies of this class will be stored.
  }
  # highlight-end
}
```

以下是适用于所有客户端的示例：

import SchemaReplication from '/_includes/code/schema.things.create.replication.mdx';

<SchemaReplication/>

在添加数据之前，当您在数据模式中设置了这个复制因子，您将有3个数据副本存储。在导入数据后，Weaviate也可以处理更改此设置。然后，数据将被复制到新的副本节点（如果有足够的节点），但请注意，这是实验性的，在将来会更加稳定。

:::caution Note:
Changing the replication factor after adding data is an **experimental feature** as of v1.17 and will become more stable in the future.
:::

数据模式具有`ALL`的[写一致性级别](../concepts/replication-architecture/consistency.md#tunable-write-consistency)，这意味着当您上传或更新模式时，它将被发送到`ALL`节点（通过协调节点）。协调节点在向客户端发送成功消息之前，等待从`ALL`节点收到成功的确认。这确保了在分布式Weaviate设置中具有高度一致的模式。

## 如何使用：查询

当您添加（写入）或查询（读取）数据时，集群中的一个或多个副本节点将响应该请求。多少个节点需要向协调节点发送成功的响应和确认取决于 `consistency_level`。可用的 [一致性级别](../concepts/replication-architecture/consistency.md) 有 `ONE`、`QUORUM`（replication_factor / 2 + 1）和 `ALL`。

`consistency_level` 可以在查询时指定：

```bash
# Get an object by ID, with consistency level ONE
$ curl /v1/objects/{ClassName}/{id}?consistency_level=ONE
```

:::note
In v1.17, only [read queries that get data by ID](../api/rest/objects.md#get-a-data-object) had a tunable consistency level. All other object-specific REST endpoints (read or write) used the consistency level `ALL`. Starting with v1.18, all write and read queries are tunable to either `ONE`, `QUORUM` (default) or `ALL`. GraphQL endpoints use the consistency level `ONE` (in both versions).
:::

import QueryReplication from '/_includes/code/replication.get.object.by.id.mdx';

<QueryReplication/>


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />