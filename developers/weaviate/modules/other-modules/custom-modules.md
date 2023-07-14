---
image: og/docs/modules/custom-modules.jpg
sidebar_position: 9
title: Custom modules
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

除了使用现成的向量化模型之外，您还可以将自己的机器学习模型连接到Weaviate。这样，您就可以利用Weaviate来扩展您的机器学习和自然语言处理模型，因为Weaviate会负责高效的数据存储和检索。自定义的向量化模块是指您在自己的训练数据上训练的模型，它能够将数据（例如文本或图像数据）转换为嵌入向量。

如果您已经有一个适用于现有模型架构（例如Transformers）的模型，您无需编写任何自定义代码，只需使用现有的 [`text2vec-transformer`模块](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md) 运行该Transformer模型即可。

本页面包含有关如何将自己的ML模型附加到Weaviate的信息。您将需要将自己的ML模型作为模块附加到Weaviate的模块API上。首先，有关Weaviate中（向量化器/嵌入器）模块的工作原理的一些信息。

快速链接：
* 要构建自己的推理容器（使用现有的Weaviate模块API），请点击[这里](/developers/weaviate/modules/other-modules/custom-modules.md#a-replace-parts-of-an-existing-module)。
* 要构建一个全新的模块（例如创建自己的Weaviate模块API以添加GraphQL字段等），请点击[这里](/developers/contributor-guide/weaviate-modules/how-to-build-a-new-module.md)。

## 视频：如何在Weaviate中创建自定义模块？

<iframe width="100%" height="375" src="https://www.youtube.com/embed/uKYDHzjEsbU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

_在Weaviate meetup期间记录 - 自定义模块部分从13:30分钟开始_

## 背景：Weaviate中的模块架构

要了解如何创建一个新模块，您需要了解Weaviate的模块系统的工作原理。

Weaviate对模块在特定生命周期钩子中获取所需值的方式完全不关心。例如，对于一个向量化模块，Weaviate与模块之间的合约如下：在导入时，每个对象都会传递给（配置好的）向量化模块，模块必须用向量（嵌入）对其进行扩展。Weaviate不关心模块如何实现这一点。例如，如果模块的目的是使用预先存在的ML模型进行推理，模块可以决定提供一个第二个推理服务，并在"vectorize"生命周期钩子的一部分与该推理服务进行通信。Weaviate对通信方式不关心。例如，`text2vec-contextionary`模块在其推理服务上使用了gRPC API，而`text2vec-transformers`模块则使用了相同目的的REST API。

通常一个（向量化器）模块由两部分组成：
1. **用Go编写的Weaviate模块代码**，它钩入特定的生命周期并提供各种功能（如控制API函数），以将模块集成到Weaviate的常规流程中。
2. **推理服务**，通常是一个容器化的应用程序，它使用一个模块特定的API封装了一个ML模型，该API由在Weaviate中执行的模块代码（第1部分）使用。

下面的可视化图表展示了模块如何构成Weaviate并与之连接。黑色边框表示Weaviate核心，灰色方框表示内部组件。红色部分涉及Weaviate如何使用连接的模块以及通用的模块系统API。红色模块API跨越了两个内部“层”，因为它可以影响Weaviate的API（例如通过扩展GraphQL或提供额外的属性），还可以影响业务逻辑（例如通过获取对象的属性并设置向量）。

所有蓝色的内容都属于特定的模块（可以附加多个模块，但这里只展示一个模块）。这是一个使用`text2vec-transformers`模块`bert-base-uncased`的Weaviate示例。属于`text2vec-transformers`模块的所有内容都以蓝色显示。Weaviate核心内部的蓝色框是模块的第一部分：Weaviate的模块代码。Weaviate核心外部的蓝色框是独立的推理服务，即第二部分。

图中显示了三个API：
* 第一个灰色框位于Weaviate Core内部，是面向用户的RESTful和GraphQL API。
* 红色框是模块系统API，它们是用Go编写的接口。
* 第三个API完全由模块拥有，用于与独立的模块容器通信。在这种情况下，这是一个Python容器，显示在左侧。

要在Weaviate中使用自定义的机器学习模型，您有两个选项：（[下面进一步解释](#如何构建和使用自定义模块)）
* A：替换现有模块的部分，只需替换推理服务（第2部分）。这里不需要修改Weaviate核心。
* B: 构建一个全新的模块，并替换所有现有的（蓝色）模块部分（包括1和2）。您可以配置自定义行为，比如扩展GraphQL API，只要该模块可以连接到“红色”模块系统API。请记住，您需要编写一些Go代码来实现这一点。

<!-- ![Weaviate模块API概览](/img/weaviate-module-apis.svg "Weaviate模块API概览") -->

让我们以一个更详细的示例来说明如何配置Weaviate来使用特定的模块：如果我们查看[`text2vec-transformers`](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md)模块，您需要在docker-compose配置中设置`ENABLE_MODULES=text2vec-transformers`，这将指示Weaviate加载相应的Go代码（第一部分）。此外，您还需要在`docker-compose.yml`中包含另一个包含用于推理的实际模型的服务（第二部分）。更详细地说，让我们看一下[`text2vec-transformers`](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md)模块中特定（GraphQL）功能的实现方式：

1. **Weaviate的模块代码，使用Go语言编写：**
   * 告诉Weaviate GraphQL API，该模块提供了一个特定的`nearText`方法。
   * 验证特定的配置和模式设置，并使它们可用于API。
   * 当需要时，告诉Weaviate如何获取向量（例如单词或图像嵌入）（通过向第三方服务发送HTTP请求，这里是围绕推理模型的Python应用程序）。
2. **推理服务：**
   * 提供能够进行模型推断的服务。
  * 实现与 A（而不是与 Weaviate 本身）合同一致的 API。

请注意，这只是一个示例，只要第1部分和第2部分都存在，就可以进行变化。第1部分包含了与Weaviate的连接代码（使用Go语言），第2部分包含了第1部分使用的推理模型。您还可以对Weaviate的`text2vec-transformers`模块（第1部分）进行修改，以使用Hugging Face API或其他第三方托管的推理服务，而不是使用自己的容器（现在在第2部分中）。

一个模块完全控制与其所依赖的任何容器或服务的通信。因此，例如，在`text2vec-transformers`模块中，推理容器的API是一个REST API。但是，对于`text2vec-contextionary`模块，它使用的是gRPC，而不是REST API或其他协议。

### 模块特点

模块是一种自定义代码，可以通过连接到特定的生命周期钩子来扩展Weaviate。由于Weaviate是用Go语言编写的，因此模块代码也必须用Go语言编写。然而，一些现有的模块使用独立的服务，这些服务可以用任何语言编写，通常是用Python编写的向量化模块，它们会携带模型推断容器。

模块可以是“向量化器”（定义从数据中选择向量中的数字的方式）或其他提供额外功能的模块，例如问答、自定义分类等。模块具有以下特点：
- 命名约定：
  - 向量化器：`<媒体>2vec-<名称>-<可选项>`，例如 `text2vec-contextionary`、`image2vec-RESNET` 或 `text2vec-transformers`。
  - 其他模块：`<功能>-<名称>-<可选项>`。
  - 模块名必须是URL安全的，也就是说不能包含需要URL编码的字符。
  - 模块名不区分大小写。`text2vec-bert`和`text2vec-BERT`是相同的模块。
- 可以通过[`v1/modules/<module-name>/<module-specific-endpoint>` RESTful端点](/developers/weaviate/api/rest/modules.md)访问模块信息。
- 通用模块信息（附加的模块，版本等）可以通过Weaviate的[`v1/meta`端点](/developers/weaviate/api/rest/meta.md)访问。
- 模块可以在RESTful API中添加`additional`属性，在GraphQL API中添加[`_additional`](/developers/weaviate/api/graphql/additional-properties.md)属性。
- 模块可以在GraphQL查询中添加[过滤器](/developers/weaviate/api/graphql/filters.md)。
- 哪些向量化器和其他模块应用于哪些数据类在[schema](/developers/weaviate/configuration/schema-configuration.md)中进行配置。

## 如何构建和使用自定义模块

有两种不同的方法可以扩展Weaviate的自定义向量化能力：您可以构建一个完全定制的模块（部分1 + 2），或者仅替换现有模块的推理服务（仅替换部分2，选项A）。后者是快速原型设计和概念证明的好选择。在这种情况下，您只需替换推理模型（部分2），但保留与Weaviate的接口（使用Go语言）。这是一种快速集成完全不同模型类型的方法。您还可以选择构建一个完全新的模块（选项B）。这是最灵活的选择，但这意味着您需要编写一个使用Go语言的Weaviate接口。我们建议仅在满意原型结果的情况下选择选项B。通过选项B，您可以将概念验证转化为完整的模块，因为您可以在选择选项B时控制所有配置和命名。

### A. 替换现有模块的部分内容

集成一个完全不同的推理模型的最快方法是替换现有模块的部分内容。您可以重用第一部分（与Weaviate的接口），从而遵守第一部分的API契约，并仅对第二部分进行更改或替换。

由于您没有修改Go Weaviate接口代码，所以无法为您的模块推理引入特定于您的模块的新配置到Weaviate的API中，这些API由现有模块提供和消费，这些模块在第一部分中不存在（即`text2vec-transformers`的所有配置参数，例如）。这也意味着您无法更改或引入新的（GraphQL）API函数或过滤器。
**请注意，Weaviate API不保证稳定性。即使在非破坏性的Weaviate发布版本中，'internal' API也可能会发生变化。**

要在现有的Weaviate接口（第一部分）中使用新的推理模型（第二部分），您可以重用现有模块的所有Go代码，只需将其指向不同的推理容器即可。以下是使用`text2vec-transformers` Go代码使用自定义推理模块的示例：
1. 在一个有效的 `docker-compose.yml` 文件中，配置了使用 transformers（例如通过 [配置配置器](/developers/weaviate/installation/docker-compose.md#configurator) 进行配置），你会找到一个像这样的环境变量：`TRANSFORMERS_INFERENCE_API: 'http://t2v-transformers:8080'`，你可以将其指向任何你喜欢的应用程序。你应该保持变量名 `TRANSFORMERS_INFERENCE_API` 不变。
2. 在您的模型周围构建一个小型的HTTP API包装器，它至少应具有以下列出的端点（在此示例中完全特定于`text2vec-transformers`模块，并完全受其控制）：
   1. `GET /.well-known/live` -> 当应用程序处于活动状态时回复`204`
   2. `GET /.well-known/ready` -> 当应用程序准备好提供流量时回复`204`
   3. `GET /meta` -> 回复有关推理模型的元信息
   4. `POST /vectors` -> 请参考下面的示例请求和响应有效负载。（请注意，通过在docker-compose文件中添加`ports: ["8090:8080"]`，该应用程序在我的机器上以端口`8090`本地公开）。

请求：
```bash
curl localhost:8090/vectors/ -H "Content-Type: application/json" -d '{"text":"hello world"}'
```
响应:
```bash
{"text":"hello world","vector":[-0.08469954133033752,0.4564870595932007, ..., 0.14153483510017395],"dim":384}
```

### B. 构建一个全新的模块

通过同时实现第一部分和第二部分，可以更加灵活地实现一个全新的模块，因为您可以控制命名、API、行为等。为了实现这一点，您实际上是在为Weaviate做贡献。请注意，对于这个选项，您需要至少了解Weaviate的架构的一部分，以及一个模块可以控制和不能控制的内容（即什么是“固定的”）。您可以fork [Weaviate的代码库](https://github.com/weaviate/weaviate) 并在其中创建一个全新的[模块](https://github.com/weaviate/weaviate/tree/master/modules)。这个新模块也可以依赖于任意数量的其他容器（您需要提供），并且可以使用任何API与其依赖进行通信（它也可以不依赖任何其他模块）。

详细的说明在[贡献者指南](/developers/contributor-guide/weaviate-modules/how-to-build-a-new-module)中有描述。

如果您选择构建一个包括Weaviate Go接口的全新模块，您可以通过[论坛](https://forum.weaviate.io)或通过[GitHub上的问题](https://github.com/weaviate/weaviate/issues)与我们联系，我们会帮助您入门。

## 重要提示
- 向量化器的向量长度会影响后续的使用，例如，如果您使用GraphQL探索过滤器按向量探索数据，这个向量的长度应该与数据点的向量长度匹配。
- Weaviate模块内部的API不能保证稳定。即使在非破坏性的Weaviate版本中，'内部' API也可能会发生变化。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />