---
image: og/docs/configuration.jpg
sidebar_position: 1
title: Environment variables
---

<!-- TODO - 创建OG图片 -->

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

本页面包含了一个全面的环境变量列表，可以用来配置Weaviate在[Docker](../installation/docker-compose.md)或[Kubernetes](../installation/kubernetes.md)部署中的使用。

## 环境变量列表

### 通用

| 变量 | 描述 | 类型 | 示例值 |
| --- | --- | --- | --- |
| <code>ENABLE_MODULE<wbr />S</code> | 在设置中启用哪些模块？ | `字符串 - 逗号分隔的列表` | `text2vec-openai,generative-openai` |
| <code>DEFAULT_VECTORIZER<wbr />_MODULE</code> | 默认的词向量化模块 - 将被模式中定义的任何类级别值覆盖 | `字符串` | `text2vec-contextionary` |
| <code>AUTOSCHEMA_ENABLED</code> | 是否在必要时使用autoschema推断模式（默认值：`true`） | `string - true/false` | `true` |
| <code>QUERY_MAXIMUM_RESULTS</code> | 设置可以检索的对象的最大总数。 | `string - number` | `10000` |
| <code>QUERY_DEFAULTS_LIMIT</code> | 设置在查询中返回的对象的默认数量。 | `string - number` | `25` |
| `GOMEMLIMIT` | 设置Go运行时的内存限制。这应该与您的可用内存相匹配，例如Weaviate的总内存的10-20%。当内存使用接近限制时，Go运行时会通过使垃圾收集器更加积极来确保长期和临时内存分配不超过此值。[了解更多关于GOMEMLIMIT的信息](/blog/gomemlimit-a-game-changer-for-high-memory-applications)。 | `string - 内存限制的SI单位` | `4096MiB` |
| `GODEBUG` | 控制运行时的调试变量。[查看官方Go文档](https://pkg.go.dev/runtime)。 | `字符串 - 逗号分隔的name=val对列表` | `gctrace=1` |
| `LOG_LEVEL` | 设置Weaviate日志级别。<br/><br/>默认值：InfoLevel。常规操作记录。<br/>`debug`：非常详细的日志记录。<br/>`trace`：更细粒度的信息事件。 | `字符串` | |
| `LOG_FORMAT` | 设置 Weaviate 的日志格式 <br/><br/>默认值：将日志数据输出为 JSON。例如：`{"action":"startup","level":"debug","msg":"finished initializing modules","time":"2023-04-12T05:07:43Z"}` <br/>`text`：将日志数据输出为字符串。例如：`time="2023-04-12T04:54:23Z" level=debug msg="finished initializing modules" action=startup` | `string` |  |
| `ORIGIN` | 设置 Weaviate 的 HTTP(S) 起源 | `string - HTTP 起源` | `https://my-weaviate-deployment.com` |
| <code>PERSISTENCE<wbr />_DATA<wbr />_PATH</code> | Weaviate Standalone应将其数据存储在何处？ | `string - 文件路径` | `/var/lib/weaviate` |
| <code>DISK_USE<wbr />_WARNING<wbr />_PERCENTAGE</code> | 如果磁盘使用率高于给定的百分比，受影响节点磁盘上的所有分片将记录警告。有关详细信息，请参阅[磁盘压力警告和限制](/developers/weaviate/configuration/persistence.md#disk-pressure-warnings-and-limits)。 | `string - 数字` | `80` |
| <code>DISK_USE<wbr />_READONLY<wbr />_PERCENTAGE</code> | 如果磁盘使用率高于给定百分比，受影响节点上的所有分片将被标记为`READONLY`，意味着所有未来的写入请求将失败。有关详细信息，请参阅[磁盘压力警告和限制](/developers/weaviate/configuration/persistence.md#disk-pressure-warnings-and-limits)。 | `string - number` | `90` |
| <code>REINDEX_SET_TO_ROARINGSET_AT_STARTUP</code> | 允许Weaviate进行一次性重新索引，以[使用Roaring Bitmaps](../concepts/prefiltering.md#migration-to-roaring-bitmaps)。<br/><br/>在版本`1.18`及更高版本中可用。 | `string - true/false` | `true` |
| <code>PROMETHEUS<wbr />_MONITORING<wbr />_ENABLED</code>  | 如果设置，Weaviate将以兼容Prometheus的格式收集[指标数据](/developers/weaviate/configuration/monitoring.md) | `string - true/false` | `false` |
| <code>PROMETHEUS<wbr />_MONITORING<wbr />_GROUP</code> | 如果设置，Weaviate将跨所有分片对相同类别的指标进行分组。 | `string - true/false` | `true` |
| `BACKUP_*` | 备份提供程序模块的各种配置变量。它们在[备份页面](/developers/weaviate/configuration/backups.md)上有详细说明。 | |

### 模块特定

| 变量 | 描述 | 类型 | 示例值 |
| --- | --- | --- | --- |
| <code>CONTEXTIONARY<wbr />_URL</code> | 上下文词典容器的服务发现 | `string - URL` | `http://contextionary` |
| <code>TRANSFORMERS_INFERENCE_API</code> | 如果启用，可以访问transformers模块的端点 | `string` | `http://t2v-transformers:8080` |
| <code>CLIP_INFERENCE_API</code> | 如果启用，可以访问clip模块的端点 | `string` | `http://multi2vec-clip:8000` |
| <code>IMAGE_INFERENCE_API</code> | 如果启用，可以访问img2vec-neural模块的端点 | `string` | `http://localhost:8000` |

### 认证与授权

| 变量 | 描述 | 类型 | 示例值 |
| --- | --- | --- | --- |
| <code>AUTHENTICATION<wbr/>_ANONYMOUS<wbr/>_ACCESS<wbr/>_ENABLED</code> | 允许用户在没有身份验证的情况下与Weaviate进行交互 | `字符串 - true/false` | `true` |
| <code>AUTHENTICATION<wbr/>_APIKEY<wbr/>_ENABLED</code> | 启用基于API密钥的身份验证 | `字符串 - true/false` | `false` |
| <code>AUTHENTICATION_APIKEY_ALLOWED_KEYS</code> | 允许的 API 密钥。 <br/><br/> 每个密钥对应下面的特定用户身份。 | `string - 逗号分隔的列表` | `jane-secret-key,ian-secret-key` |
| <code>AUTHENTICATION_APIKEY_USERS</code> | 基于 API 密钥的身份。 <br/><br/> 每个身份对应上面的特定密钥。 | `string - 逗号分隔的列表` | `jane@doe.com,ian-smith` |
| <code>AUTHENTICATION<wbr />_OIDC<wbr />_ENABLED</code> | 启用基于OIDC的身份验证 | `string - true/false` | `false` |
| <code>AUTHENTICATION<wbr />_OIDC<wbr />_ISSUER</code> | OIDC令牌发行者 | `string - URL` | `https://myissuer.com` |
| <code>AUTHENTICATION<wbr />_OIDC<wbr />_CLIENT<wbr />_ID</code> | OIDC客户端ID | `string` | `my-client-id` |
| <code>AUTHENTICATION<wbr />_OIDC<wbr />_USERNAME<wbr />_CLAIM</code> | OIDC用户名声明 | `string` | `email` |
| <code>AUTHENTICATION<wbr />_OIDC<wbr />_GROUPS<wbr />_CLAIM</code> | OIDC组声明 | `string` | `groups` |
| <code>AUTHORIZATION<wbr />_ADMINLIST<wbr />_ENABLED</code> | 启用AdminList授权模式 | `string - true/false` | `true` |
| <code>AUTHORIZATION<wbr />_ADMINLIST<wbr />_USERS</code> | 具有管理员权限的用户 | `string - 逗号分隔的列表` | <code>jane<wbr />@example.com,<wbr />john<wbr />@example.com</code> |
| <code>AUTHORIZATION<wbr />_ADMINLIST<wbr />_READONLY<wbr />_USERS</code> | 具有只读权限的用户 | `string - 逗号分隔的列表` | <code>alice<wbr />@example.com,<wbr />dave<wbr />@example.com</code> |

### 多节点设置

| 变量 | 描述 | 类型 | 示例值 |
| --- | --- | --- | --- |
| <code>CLUSTER<wbr />_HOSTNAME</code> | 节点的主机名 | `string` | `node1` |
| <code>CLUSTER<wbr />_GOSSIP<wbr />_BIND<wbr />_PORT</code> | 用于交换网络状态信息的端口 | `string - number` | `7102` |
| <code>CLUSTER<wbr />_DATA<wbr />_BIND<wbr />_PORT</code> | 用于交换数据的端口 | `string - number` | `7103` |
| <code>CLUSTER<wbr />_JOIN</code> | 集群设置中“创始”成员节点的服务名称 | `string` | `weaviate-node-1:7100` |

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />