---
image: og/docs/client-libraries.jpg
sidebar_position: 0
title: References - Client Libraries
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述
您可以直接使用GraphQL或RESTful API与Weaviate进行交互，也可以使用其中一个可用的客户端库。

目前，Weaviate支持以下语言：

- [Python](/developers/weaviate/client-libraries/python.md)
- [TypeScript/JavaScript](/developers/weaviate/client-libraries/typescript.mdx)
- [Go](/developers/weaviate/client-libraries/go.md)
- [Java](/developers/weaviate/client-libraries/java.md)

import JavaScriptMaintenanceWarning from '/_includes/javascript-maintenance-warning.mdx';

<JavaScriptMaintenanceWarning />

:::note Don't see your preferred language?
If you want to contribute one or request for us to work on a particular client, please let us know on [the forum](https://forum.weaviate.io/)
:::

import ClientCapabilitiesOverview from '/_includes/client.capabilities.mdx'

<ClientCapabilitiesOverview />

### 社区客户端

还有一些由我们出色的社区成员准备的[社区客户端](./community.md)。这些客户端不是由Weaviate核心团队维护，而是由社区成员自己维护。如果您想为这些客户端做出贡献，请联系客户端的维护人员。

## 本地查询 vs GraphQL 查询

当查询Weaviate时，您可以选择使用GraphQL编写查询，并将原始的GraphQL查询发送到Weaviate，或者您可以使用客户端语言本地编写查询。

例如，如果您正在使用Weaviate Python客户端：

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

result = client.query.get("Article", ["title", "url", "wordCount"]).do()

print(result)
```

产生的结果与以下相同：

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

query = """
{
  Get {
    Article {
      title
      url
      wordCount
    }
  }
}
"""

result = client.query.raw(query)

print(result)
```

## 客户端特定函数

除了完整反映 RESTful 和 GraphQL API 外，客户端还具有一些客户端特定的函数。这些函数在客户端页面上有文档记录。以下是客户端功能的概述：

| 功能 | Python 客户端 | TypeScript 客户端 | Java 客户端 | Go 客户端 |
| --- | --- | --- | --- | --- |
| RESTful API 端点 | **V** | **V** | **V** | **V** |
| GraphQL 获取 | **V** | **V** | **V** | **V** |
| GraphQL 聚合 | **V** | **V** | **V** | **V** |
| GraphQL 探索 | **V** | **V** | **V** | **V** |
| 上传完整的 JSON 模式 | **V** | X | X | X |
| 删除完整的 JSON 模式 | **V** | X | X | X |
| 检查模式 | **V** | X | X | X |

## 命令行界面 (CLI)
您可以通过命令行界面与 Weaviate 进行交互。有关安装和使用的信息，请参阅[这里](./cli.md)。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />