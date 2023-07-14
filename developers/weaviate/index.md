---
image: og/docs/introduction.jpg
sidebar_position: 0
title: Introduction
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

欢迎来到 **Weaviate** 的文档，这是一个开源的向量数据库。

### 关于文档
大部分内容根据其主要目标被分为以下三个类别：

| | 🔧<br/>操作指南 | 📚<br/>参考文档 | 💡<br/>概念 | 🎓<br/>教程 |
| ----- | ----- | ----- | ----- | ----- |
| **目标** | 解决问题 | 查找详细信息 | 解释主题 | 有导引的教学课程 |

常见的资源请求，例如
- [基准测试](./benchmarks/index.md)
- [路线图](./roadmap/index.md)

拥有它们自己的部分，而其他资源如

- [常见问题解答](./more-resources/faq.md)
- [词汇表](./more-resources/glossary.md)

以及更多资源可以在[更多资源](./more-resources/index.md)部分找到。

:::tip Looking for Weaviate Cloud Services docs?
The Weaviate Cloud Services (WCS) documentation now has its own section! [Check it out here](../wcs/index.mdx).
:::

### 对于新用户

如果您是Weaviate的新用户，我们建议从以下几个部分开始：
1. 介绍（本页面）
2. [快速入门教程](./quickstart/index.md)
3. [安装](./installation/index.md)
4. [如何配置](./configuration/index.md)

如果您对Weaviate的工作原理感兴趣，我们建议您浏览[概念](./concepts/index.md)部分。

:::info Help us to help you!
If the documentation does not quite suit **your** needs, we would love to hear from you.

Please reach out on our [forum](https://forum.weaviate.io) - we can help you with your specific problem, and help make the documentation better. Plus you'll meet our amazing, helpful community of users just like you!
:::

:::note
Like what you see? Consider giving us a [⭐ on GitHub](https://github.com/weaviate/weaviate/stargazers).
:::

### 代码示例

在可能的情况下，我们使用我们的[客户端库](./client-libraries/index.md)展示多种编程语言的代码示例。以下示例展示了如何使用不同的客户端获取Weaviate模式。

import CodeSchemaDump from '/_includes/code/schema.dump.mdx';

<CodeSchemaDump />

## 关于本页面

这个页面是Weaviate的介绍。在继续阅读其他部分之前，我们在这里提供了一个非常高级的Weaviate概述，以便您有一些上下文信息。

## Weaviate是什么？

Weaviate是一个开源的向量数据库，可以存储对象和向量。这允许将向量搜索与结构化过滤相结合。

**Weaviate简介**：

* Weaviate是一个开源的向量数据库。
* Weaviate允许您根据语义属性存储和检索数据对象，通过使用[vectors](./concepts/vector-index.md)对它们进行索引。
* Weaviate可以独立使用（也就是所谓的“带上您的向量”），或者与各种[模块](./modules/index.md)一起使用，这些模块可以为您进行向量化并扩展核心功能。
* Weaviate具有[GraphQL-API](./api/graphql/index.md)，可以轻松访问您的数据。
* Weaviate非常快速（请查看我们的[开源基准测试](./benchmarks/index.md)）。

**Weaviate详细介绍**: Weaviate是一个低延迟的向量数据库，具有开箱即用的支持不同媒体类型（文本、图像等）的功能。它提供了语义搜索、问答提取、分类、可定制的模型（PyTorch/TensorFlow/Keras）等功能。Weaviate是使用Go语言从头开始构建的，可以存储对象和向量，实现了向量搜索与结构化过滤的结合以及云原生数据库的容错能力。可以通过GraphQL、REST和各种客户端编程语言进行访问。

### Weaviate的帮助

1. **软件工程师** - 使用Weaviate作为他们应用程序的面向机器学习的数据库。
    * 提供开箱即用的 NLP/语义搜索、自动分类和图像相似性搜索功能。
    * 与现有架构轻松集成，具有与其他开源数据库类似的完整的CRUD支持。
    * 云原生、分布式，在Kubernetes上运行良好，并能根据工作负载进行扩展。

2. **数据工程师** - 使用Weaviate作为一个基于ANN的向量数据库，与基于Lucene的搜索引擎相同的用户体验。
    * Weaviate具有模块化设置，允许您在Weaviate内部使用您的ML模型。由于其灵活性，您还可以使用现成的ML模型（例如SBERT、ResNet、fasttext等）。
    * Weaviate负责可扩展性，使您无需担心。
    * 在生产环境中可靠高效地部署和维护机器学习模型。

3. **数据科学家** - 使用Weaviate将机器学习模型无缝地移交给MLOps团队。
    * 可靠高效地在生产环境中部署和维护您的机器学习模型。
    * Weaviate的模块化设计使您可以轻松打包任何自定义训练的模型。
    * 将机器学习模型平稳快速地移交给工程师。

## 特点

Weaviate使使用最先进的AI模型变得简单，同时提供了一个专为向量数据库构建的可扩展性、易用性、安全性和成本效益。最值得注意的是：

* **快速查询**<br />
   Weaviate通常在不到100毫秒的时间内对数百万个对象进行最近邻搜索（NN）。您可以在我们的[基准测试](./benchmarks/index.md)页面上找到更多信息。

* **使用Weaviate模块接收任何媒体类型**<br />
在搜索和查询时，使用最先进的AI模型推理（例如Transformers）来访问数据（文本、图像等），让Weaviate为您管理数据向量化的过程，或者您可以提供自己的向量。

* **结合向量和标量搜索**<br />
 Weaviate允许高效地进行向量和标量的组合搜索。例如，"与COVID-19大流行相关的文章，在过去7天内发布。" Weaviate同时存储对象和向量，并确保检索两者都是高效的。无需使用第三方对象存储。

* **实时且持久**<br />
Weaviate允许您在数据正在导入或更新的情况下进行搜索。此外，每次写入都会写入一个Write-Ahead-Log（WAL）以进行即时持久化写入，即使发生崩溃也是如此。

* **水平扩展性**<br />
  根据您的实际需求对Weaviate进行扩展，例如最大摄入量、最大数据集大小、每秒最大查询次数等。

* **高可用性**<br />
  此功能在我们的[路线图](./roadmap/index.md)上，并将在今年晚些时候发布。

* **成本效益**<br />
  在Weaviate中，非常大的数据集不需要完全存储在内存中。同时，可用的内存可以用于加快查询速度。这使得可以根据每个使用情况进行有意识的速度与成本权衡。

* **对象之间的图形连接**<br />
  以类似图形的方式在对象之间建立任意连接，以模拟数据点之间的真实连接。使用GraphQL遍历这些连接。

## Weaviate的工作原理是什么？

在Weaviate中，所有的单个数据对象都基于一个类属性结构，其中每个数据对象都由一个向量表示。您可以连接数据对象（就像在传统图形中一样），并在向量空间中搜索数据对象。

您可以通过[RESTful API](./api/rest/index.md)端点向Weaviate添加数据，并通过[GraphQL接口](./api/graphql/index.md)检索数据。

Weaviate的[向量索引机制是模块化的](./concepts/vector-index.md)，当前可用的插件是Hierarchical Navigable Small World（HNSW）多层图。

## Weaviate模块是什么？

Weaviate模块用于扩展Weaviate的功能，是可选的。有一些Weaviate模块可以自动将您的内容进行向量化（即`*2vec`），或者扩展Weaviate的功能（通常与您拥有的向量类型有关）。您也可以创建自己的模块。点击[这里](./concepts/modules.md)了解更多信息。

## 什么是向量数据库？

如果你在处理数据，那么你可能会使用搜索引擎技术。最好的搜索引擎是非常出色的软件，但是由于它们的核心架构，当需要查找你需要的数据时，它们存在一些限制。

以数据对象为例：`{ "data": "巴黎的埃菲尔铁塔是一座铁艺格栅塔，位于马尔斯广场上。" }`

将这些数据存储在传统的搜索引擎中可能会利用倒排索引来索引数据。这意味着要检索数据，您需要搜索"埃菲尔铁塔"、"锻铁格栅"或其他精确的短语来找到它。但是如果你有大量的数据，并且想要找到关于埃菲尔铁塔的文档，但你搜索的是"法国的地标"，传统的搜索引擎就无法帮助你了。这就是向量数据库展示其优越性的地方。

Weaviate在其核心中使用向量索引机制来表示数据。向量化模块（例如，NLP模块）将上述数据对象在向量空间中向量化，其中数据对象位于“法国的地标”附近。这意味着Weaviate无法找到100％的匹配，但它会找到一个非常接近的结果，并返回该结果。

上面的示例是针对文本（即自然语言处理）的，但您可以将向量搜索应用于任何能进行向量化的机器学习模型，比如图像、音频、视频、基因等。

## 何时应该使用Weaviate？

有四种主要情况下，您应该考虑使用Weaviate。

- **如果您对当前搜索引擎提供的结果质量不满意。**（使用Weaviate，您可以通过语义方式搜索数据。）
- **如果您想要使用现成的最先进的机器学习模型进行文本和图像相似性搜索**（在一个Weaviate实例中同时存储和查询多种媒体类型）。
- **如果您想要结合语义（向量）和标量搜索，并使用矢量数据库以毫秒级的速度进行搜索**（Weaviate存储您的对象和向量，并确保检索效率高）。
- **如果您需要将自己的机器学习模型扩展到生产规模**（HNSW算法和水平可扩展的支持近实时数据库操作）
- **如果您需要快速而近实时地对大型数据集进行分类**（kNN、零样本或上下文分类，使用开箱即用或自定义的机器学习模型）。

人们使用Weaviate进行语义搜索、图像搜索、相似性搜索、异常检测、推荐引擎、电子商务搜索、ERP系统中的数据分类、自动化数据协调、网络安全威胁分析等众多应用领域。

## 下一步

想要开始使用或了解更多信息？以下资源可能对您有所帮助：

- 尝试使用Weaviate：
    - [快速入门教程](./quickstart/index.md)
- 了解Weaviate：
    - [概念](./concepts/index.md)

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />