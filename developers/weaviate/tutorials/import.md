---
image: og/docs/tutorials.jpg
sidebar_position: 20
title: Imports in detail
---

import Badges from '/_includes/badges.mdx';
import { DownloadButton } from '/src/theme/Buttons';

<Badges/>

## 概述

在本节中，我们将探讨数据导入的概述，包括批量导入过程的详细信息。我们将讨论向量如何导入，什么是批量导入，如何管理错误以及一些建议的优化方法。

## 先决条件

我们建议您先完成[快速入门教程](../quickstart/index.md)。

在开始本教程之前，你应该按照教程中的步骤完成以下准备工作：

- 运行一个Weaviate实例（例如在[Weaviate云服务](https://console.weaviate.cloud)上），
- 获取你首选的推理API（如OpenAI、Cohere或Hugging Face）的API密钥，
- 安装你首选的Weaviate客户端库，以及
- 在你的模式中设置一个`Question`类。
    - 如果您还没有构建Question类，您可以按照快速入门指南或[模式教程](./schema.md)进行操作。

我们将使用下面的数据集。建议您将其下载到工作目录中。

<p>
  <DownloadButton link="https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json">下载 jeopardy_tiny.json</DownloadButton>
</p>

## 导入设置

如在[schema教程](./schema.md)中提到的，`schema`指定了Weaviate的数据结构。

因此，数据导入必须将每个记录的属性映射到模式中相关类的属性。在本例中，相关类是在前一节中定义的**Question**。

### 数据对象结构

每个Weaviate数据对象的结构如下：

```json
{
  "class": "<class name>",  // as defined during schema creation
  "id": "<UUID>",     // optional, must be in UUID format.
  "properties": {
    "<property name>": "<property value>", // specified in dataType defined during schema creation
  }
}
```

通常情况下，Weaviate用户通过Weaviate客户端库导入数据。

值得注意的是，数据最终是通过RESTful API添加的，可以通过[`objects`端点](../api/rest/objects.md)或[`batch`端点](../api/rest/batch.md)来进行。

正如名称所示，使用这些端点取决于是批量导入对象还是逐个导入对象。

### 批量还是逐个导入

对于导入数据，**强烈建议您使用批量导入**，除非有特定原因不使用。批量导入可以通过一次请求发送多个对象来大大提高性能。

我们注意到批量导入是通过[`batch` REST端点](../api/rest/batch.md)来执行的。

### 批量导入过程

批量导入过程通常如下所示：

1. 连接到您的Weaviate实例
2. 从数据文件中加载对象
3. 准备批量处理
1. 遍历记录
   1. 解析每个记录并构建一个对象
   1. 通过批处理将对象推送
2. 刷新批处理 - 以防缓冲区中还有剩余的对象

这是您需要导入**Question**对象的完整代码：

import CodeImportQuestions from '/_includes/code/quickstart.import.questions.mdx';

<CodeImportQuestions />

这里有几点需要注意。

#### 批处理大小

一些客户端将其作为参数包含在内（例如Python客户端中的`batch_size`），或者可以通过定期刷新批处理来手动设置。

通常，20到100之间的大小是一个合理的起点，但这取决于每个数据对象的大小。对于较大的数据对象，较小的大小可能更合适，例如如果每个对象上传中包含向量。

#### 向量在哪里？

您可能已经注意到，我们没有提供一个向量。由于在我们的模式中指定了一个`vectorizer`，Weaviate将向适当的模块（在本例中为`text2vec-openai`）发送请求来对数据进行向量化，响应中的向量将作为数据对象的一部分进行索引和保存。

### 使用自己的向量

如果您想要上传自己的向量，可以使用Weaviate进行操作。请参考[`batch`数据对象API文档](../api/rest/batch.md#batch-create-objects)。对象字段对应于[单个对象](../api/rest/objects.md#parameters-1)的字段。

您还可以手动上传现有的向量，并使用矢量化模块对查询进行矢量化。

## 确认数据导入

您可以通过在浏览器中打开`<weaviate-endpoint>/v1/objects`来快速检查导入的对象，如下所示（请替换为您的端点）：

```
https://some-endpoint.semi.network/v1/objects
```

或者您可以像这样读取项目中的对象：

import CodeImportGet from '/_includes/code/quickstart.import.get.mdx';

<CodeImportGet />

结果应该类似于以下内容：

```json
{
    "deprecations": null,
    "objects": [
        ...  // Details of each object
    ],
    "totalResults": 10  // You should see 10 results here
}
```

## 数据导入 - 最佳实践

在导入大型数据集时，计划一个优化的导入策略可能是值得的。以下是几个需要记住的事项。

1. 最有可能成为瓶颈的是导入脚本。因此，要尽量利用所有可用的CPU。
  1. 在导入时使用`htop`命令查看是否所有CPU都达到最大利用率。
1. 使用[并行化](https://www.computerhope.com/jargon/p/parallelization.htm#:~:text=Parallelization%20is%20the%20act%20of,the%20next%2C%20then%20the%20next.)；如果CPU没有达到最大使用率，可以添加另一个导入进程。
2. 对于Kubernetes，较少的大型机器比较多的小型机器更快（由于网络延迟）。

我们的经验法则是：
* 您应该始终使用批量导入。
* 如上所述，充分利用您的CPU（在Weaviate集群上）。通常导入脚本是瓶颈。
* 处理错误消息。
* 一些客户端（例如Python）内置了一些逻辑，以有效地控制批量导入。

### 错误处理

我们建议您在对象级别实现错误处理，例如在[此示例](../api/rest/batch.md#error-handling)中。

:::tip `200` status code != 100% batch success
It is important to note that an HTTP `200` status code only indicates that the **request** has been successfully sent to Weaviate. In other words, there were no issues with the connection or processing of the batch and no malformed request.

A request with a `200` response may still include object-level errors, which is why error handling is critical.
:::

## 总结

* 导入的数据应该符合数据库模式
* 除非有充分的理由，否则应该使用批量导入
* 对于导入大型数据集，确保考虑和优化导入策略。

## 推荐阅读

- [教程：详细了解模式](./schema.md)
- [教程：详细了解查询](./query.md)
- [教程：模块介绍](./modules.md)
- [教程：Weaviate控制台介绍](../../wcs/guides/console.mdx)

### 其他对象操作

所有其他的CRUD对象操作都可以在[对象RESTful API文档](../api/rest/index.md)和[批量RESTful API文档](../api/rest/batch.md)中找到。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />