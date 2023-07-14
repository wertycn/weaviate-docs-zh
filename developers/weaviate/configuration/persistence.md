---
image: og/docs/configuration.jpg
sidebar_position: 45
title: Persistence
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Related pages
- [Configuration: Backups](./backups.md)
:::

## 概述

在使用Docker或Kubernetes运行Weaviate时，您可以通过挂载卷来持久化数据，将数据存储在容器之外。这样做将导致当Weaviate实例重新启动时，它也会从挂载的卷加载数据。

请注意，Weaviate现在提供了本地备份模块，从`v1.15`版本开始适用于单节点实例，以及`v1.16`版本开始适用于多节点实例。对于旧版本的Weaviate，按照下面描述的方法持久化数据可以让您备份Weaviate。

## Docker Compose

### 持久化

在使用docker-compose运行Weaviate时，您可以在`weaviate`服务下设置`volumes`变量，并将唯一的集群主机名作为环境变量。

```yaml
services:
  weaviate:
    volumes:
      - /var/weaviate:/var/lib/weaviate
    environment:
      CLUSTER_HOSTNAME: 'node1'
```

* 关于卷
  * `/var/weaviate` 是您希望在本地机器上存储数据的位置
  * `/var/lib/weaviate`（冒号后面）是容器内的位置，请勿更改
* 关于主机名
  * `CLUSTER_HOSTNAME` 可以是任意选择的名称

如果您想要更详细的输出，可以更改环境变量 `LOG_LEVEL`

```yaml
services:
  weaviate:
    environment:
      LOG_LEVEL: 'debug'
```

一个完整的Weaviate示例，没有模块，但具有外部挂载的卷和更详细的输出：

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
    volumes:
      - /var/weaviate:/var/lib/weaviate # <== set a volume here
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'none'
      ENABLE_MODULES: ''
      CLUSTER_HOSTNAME: 'node1' # <== this can be set to an arbitrary name
...
```

### 备份

查看[备份](./backups.md)。

## Kubernetes

对于Kubernetes的设置，唯一需要注意的是Weaviate需要通过`PersistentVolumeClaims`来创建`PersistentVolumes`（[更多信息](/developers/weaviate/installation/kubernetes.md#requirements)），但Helm chart已经配置好将数据存储在外部卷上。

## 磁盘压力警告和限制

从 `v1.12.0` 开始，可以通过环境变量配置两个级别的磁盘使用情况通知和操作。这两个变量都是可选的。如果未设置，它们将默认为下面的值：

| 变量 | 默认值 | 描述 |
| --- | --- | --- |
| `DISK_USE_WARNING_PERCENTAGE` | `80` | 如果磁盘使用率高于给定的百分比，受影响节点上的所有分片都会记录警告信息 |
| `DISK_USE_READONLY_PERCENTAGE` | `90` | 如果磁盘使用率高于给定的百分比，受影响节点上的所有分片将被标记为`READONLY`，意味着所有未来的写请求将失败。 |

如果由于磁盘压力而将分片标记为`READONLY`，并且您希望再次将分片标记为可用（无论是因为您已经提供了更多的可用空间还是更改了阈值），您可以使用[Shards API](../api/rest/schema.md#inspect-the-shards-of-a-class)来执行此操作。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />