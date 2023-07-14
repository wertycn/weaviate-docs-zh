---
image: og/docs/api.jpg
sidebar_position: 17
title: REST - /v1/nodes
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 用法

节点端点接受一个 `GET` 请求：

```js
GET /v1/nodes
```

它返回一个包含以下字段的`nodes`字段的节点数组：
- `name`：节点的名称。
- `status`：节点的状态（其中之一：HEALTHY、UNHEALTHY、UNAVAILABLE）。
- `version`：节点上运行的Weaviate的版本。
- `gitHash`：节点上运行的Weaviate的最新提交的短git哈希。
- `stats`：节点的统计信息，包含以下字段：
    - `shardCount`：节点上的分片总数。
    - `objectCount`：节点上的对象总数。
- `shards`: 包含以下字段的分片数组：
    - `name`：分片的名称。
    - `class`：存储在分片上的对象的类名。
    - `objectCount`：分片上的对象数量。

## 示例

以下命令将检索集群中所有节点的摘要信息：

import Nodes from '/_includes/code/nodes.mdx';

<Nodes/>

示例输出（格式可能因使用的客户端而略有不同）：

```json
{
  "nodes": [
    {
      "name": "weaviate-7",
      "status": "HEALTHY",
      "version": "1.16-alpha.0",
      "gitHash": "8cd2efa",
      "stats": {
        "shardCount":2,
        "objectCount": 23328
      },
      "shards": [
        {
          "name":"azuawSAd9312F",
          "class": "Class_7",
          "objectCount": 13328
        }, {
          "name":"cupazAaASdfPP",
          "class": "Foo",
          "objectCount": 10000
        }
      ]
    }, {
      "name": "weaviate-6",
      "status": "HEALTHY",
      "version": "1.16-alpha.0",
      "gitHash": "8cd2efa",
      "stats": {
        "shardCount":2,
        "objectCount": 12345
      },
      "shards": [
        {
          "name":"hh8gXiaNaO2K",
          "class": "Bar",
          "objectCount": 10000
        }, {
          "name":"zmb16QK4PYZ4",
          "class": "Baz",
          "objectCount": 2345
        }
      ]
    }
   ]
}
```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />