---
image: og/docs/concepts.jpg
sidebar_position: 85
title: Interface
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Related pages
- [References: GraphQL API](../api/graphql/index.md)
- [References: RESTful API](../api/rest/index.md).
- [References: Client Libraries](../client-libraries/index.md).
:::

## 介绍

您可以通过 Weaviate 的 API 进行管理和使用。Weaviate 具有 RESTful API 和 GraphQL API。所有语言的客户端库都支持所有的 API 功能。一些客户端，例如 Python 客户端，还具有其他功能，例如完整的模式管理和批处理操作。这样，Weaviate 在自定义项目中易于使用。此外，这些 API 是直观的，因此很容易集成到您现有的数据环境中。

本页面包含有关Weaviate的API设计信息，以及如何使用Weaviate控制台通过GraphQL搜索您的Weaviate实例的信息。

## API设计

### 设计：用户体验和Weaviate功能

用户体验（UX）是我们最宝贵的原则之一。Weaviate应该易于理解，使用起来直观，对社区有价值，受欢迎且可用。与Weaviate的交互对其用户体验非常重要。Weaviate的API是根据用户需求的角度设计的，同时考虑了软件的功能。我们进行用户研究、用户测试和原型设计，以确保所有功能与我们的用户产生共鸣。用户需求在协作讨论期间不断收集。我们将用户需求与Weaviate的功能进行匹配。当用户或应用程序的需求非常强烈时，我们可能会扩展Weaviate的功能和API。当有新的Weaviate功能时，这自然而然地将通过（新的）API函数访问。

Weaviate的API的用户体验遵循Peter Morville定义的UX Honeycomb可用性规则。

### RESTful API和GraphQL API

Weaviate同时提供了RESTful API和GraphQL API。目前，这两个API之间还没有完全的功能对齐（这将在以后实现，GitHub上有一个[问题](https://github.com/weaviate/weaviate/issues/1540)）。RESTful API主要用于数据库管理和CRUD操作。GraphQL API主要用于访问Weaviate中的数据对象，无论是简单的查找还是标量和向量搜索的组合。API大致支持以下用户需求：

* **添加、检索、更新和删除数据（CRUD）** -> RESTful API
* **Weaviate管理操作** -> RESTful API
* **数据搜索** -> GraphQL API
* **探索性数据搜索** -> GraphQL API
* **数据分析（元数据）** -> GraphQL API
* **在生产环境中处理非常大的数据集的近实时** -> 使用客户端库（Python、Go、Java、JavaScript），底层使用两种API
* **容易集成到应用程序中** -> 使用客户端库（Python、Go、Java、JavaScript），在底层使用两个API

## GraphQL

### 为什么选择GraphQL？
我们选择使用GraphQL API，有多个原因：

* **数据结构**。
  * Weaviate中的数据遵循类-属性结构。可以通过GraphQL按类和属性查询数据对象。
  * 可以在Weaviate中使用交叉引用链接数据。GraphQL这样的图查询语言在这里非常有用。
* **性能**。
  * 使用GraphQL，不存在过度获取或不足获取的问题。您只会得到您查询的数据对象的准确信息，不多不少。这对性能有益。
  * 减少请求数量。使用GraphQL，您可以进行高效和精确的查询，通常只需进行传统RESTful API所需要的多个查询。
* **用户体验**
  * 减少复杂性。
  * 减少错误（因为有了类型化的架构）。
  * 自定义设计
  * 可以进行数据探索和模糊搜索

### GraphQL 设计原则
GraphQL 查询被设计为直观且符合 Weaviate 的特性。[这篇 Hackernoon 的文章](https://hackernoon.com/how-weaviates-graphql-api-was-designed-t93932tl)会告诉你更多关于 GraphQL API 是如何设计的（请注意，示例展示的是旧版的 Weaviate 和 GraphQL API）。下面的三点是设计的关键：

* **自然语言**。GraphQL查询尽可能地遵循自然语言的模式。查询的功能易于理解，编写和记忆。一个例子查询，您可以识别出其中的人类语言是： "*获取*文章的*标题*，其中*字数*大于*1000*。这个查询中最重要的词也在GraphQL查询中使用：

```graphql
{
  Get {
    Article(where: {
        path: ["wordCount"],    # Path to the property that should be used
        operator: GreaterThan,  # operator
        valueInt: 1000          # value (which is always = to the type of the path property)
      }) {
      title
    }
  }
}
```

目前，在GraphQL请求中有三个主要的函数："Get{}"、"Explore{}"和"Aggregate{}"。

* **类和属性**。在Weaviate中，数据具有类-属性结构，其中数据对象之间可能存在交叉引用。要返回的数据的类名写在比"主函数"更深的一层。下一层包含要返回的每个类的属性和交叉引用属性：

```graphql
{
  <Function> {
      <Class> {
        <property>

        <cross_reference-property> {
            ... on <ClassOfBeacon> {
                <property>
            }
        }

        _<additional-property> {
            <additional-field>
        }
      }
  }
}
```

* **依赖于数据库设置的查询过滤器（搜索参数）**。您可以在类级别上添加过滤器来过滤对象。标量（`where`过滤器）可以与向量（`near<...>`过滤器）组合使用。根据您的Weaviate设置（您连接了哪些模块），可能会使用额外的过滤器。一个过滤器可以是这样的（使用[`qna-transformers`模块](/developers/weaviate/modules/reader-generator-modules/qna-transformers.md)）：

```graphql
{
  Get {
    Article(
      ask: {
        question: "Who is the king of the Netherlands?",
        properties: ["summary"]
      },
      limit: 1
    ) {
      title
      _additional {
        answer {
          result
        }
      }
    }
  }
}
```

### 主要功能的GraphQL设计

1. **数据搜索：`Get {}`**：用于在已知数据对象的类名时搜索数据对象。
2. **探索性和模糊搜索：`Explore {}`**：用于模糊搜索，当您不知道数据模式和类名时。
3. **数据分析（元数据）：`Aggregate {}`**：用于搜索元数据，并对数据聚合进行数据分析。

## 支持gRPC API

从版本 `1.19` 开始，Weaviate 引入了对 gRPC（gRPC 远程过程调用）API 的支持，旨在使 Weaviate 在未来变得更快。

这不会导致任何用户界面的 API 更改。截至2023年5月，gRPC 已经以非常小的规模添加，目标是随着时间的推移将其进一步扩展到核心库和客户端。

## Weaviate 控制台

[Weaviate控制台](https://console.weaviate.cloud)是一个用于管理来自WCS的Weaviate集群和访问其他地方运行的Weaviate实例的仪表板。您可以使用查询模块进行GraphQL查询。

![Weaviate控制台中的GraphQL查询模块](./img/console-capture.png)

## Weaviate客户端和CLI

Weaviate有几个客户端库：[Go](/developers/weaviate/client-libraries/go.md)，[Java](/developers/weaviate/client-libraries/java.md)，[Python](/developers/weaviate/client-libraries/python.md)和[TypeScript/JavaScript](/developers/weaviate/client-libraries/typescript.mdx)。所有语言的客户端库都支持所有API功能。一些客户端，如Python客户端，具有额外的功能，例如完整的模式管理和批处理操作。这样，Weaviate在自定义项目中使用起来非常方便。这些API易于使用，因此将Weaviate集成到现有的数据环境中非常容易。

Weaviate还具有一个[命令行界面](/developers/weaviate/client-libraries/cli.md)，可以从命令行对Weaviate实例进行基本管理。

## 更多资源
import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />