---
image: og/docs/tutorials.jpg
sidebar_position: 50
title: Wikipedia with custom vectors
---

## 概述

本教程将向您展示如何导入一个大型数据集（来自维基百科的25,000篇文章），其中已经包含了由OpenAI生成的向量（嵌入）。
我们将会：
* 下载和解压包含维基百科文章的CSV文件
* 创建一个Weaviate实例
* 创建一个模式
* 使用Python和JavaScript代码解析文件并批量导入记录
* 确保数据已正确导入
* 运行一些查询以展示语义搜索的能力


## 先决条件

import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />

在开始本教程之前，请确保具备以下条件：

- 一个[OpenAI API密钥](https://platform.openai.com/account/api-keys)。尽管我们已经有了OpenAI生成的向量嵌入，但我们仍需要一个OpenAI密钥来对搜索查询进行向量化，并重新计算更新对象内容的向量嵌入。
- 安装了您首选的Weaviate [客户端库](../client-libraries/index.md)。

<details>
  <summary>
    查看如何删除先前教程的数据（或此教程的先前运行）。
</summary>

import CautionSchemaDeleteClass from '/_includes/schema-delete-class.mdx'

<CautionSchemaDeleteClass />

</details>

## 下载数据集

我们将使用这个[Simple English](https://simple.wikipedia.org/wiki/Simple_English_Wikipedia)维基百科数据集[由OpenAI托管](https://cdn.openai.com/API/examples/data/vector_database_wikipedia_articles_embedded.zip)（压缩后约700MB，1.7GB的CSV文件），其中包括向量嵌入。这些是感兴趣的列，其中`content_vector`是一个具有[1536个元素（维度）](https://openai.com/blog/new-and-improved-embedding-model)，使用OpenAI的`text-embedding-ada-002`模型生成的[向量嵌入](/blog/vector-embeddings-explained)：

| id | url | title | text | content_vector |
|----|-----|-------|------|----------------|
| 1 | https://simple<wbr/>.wikipedia.org<wbr/>/wiki/April | 四月 | "四月是一年中的第四个月..." | [-0.011034, -0.013401, ..., -0.009095] |

如果您还没有下载数据集并解压文件，请确保这样做。您应该在工作目录中找到`vector_database_wikipedia_articles_embedded.csv`文件。记录大多数情况下（但并不严格）按标题排序。

<p>
  <DownloadButton link="https://cdn.openai.com/API/examples/data/vector_database_wikipedia_articles_embedded.zip">下载维基百科数据集ZIP</DownloadButton>
</p>


## 创建一个Weaviate实例

我们可以在本地使用Linux上的[嵌入式](../installation/embedded.md)选项（透明和最快）、任何操作系统上的Docker（导入和搜索最快），或者使用Weaviate云服务在云端创建Weaviate实例（安装最简单，但由于网络速度的原因，导入可能较慢）。每个选项在其[安装](../installation/index.md)页面上都有解释。

:::caution text2vec-openai
If using the Docker option, make sure to select "With Modules" (instead of standalone), and the `text2vec-openai` module when using the Docker configurator, at the "Vectorizer & Retriever Text Module" step. At the "OpenAI Requires an API Key" step, you can choose to "provide the key with each request", as we'll do so in the next section.
:::


## 连接到实例并打开OpenAI

为了在后续的查询中使用OpenAI，让我们确保向客户端提供OpenAI API密钥。

import ProvideOpenAIAPIKey from '/_includes/provide-openai-api-key-headers.mdx'

<ProvideOpenAIAPIKey />


## 创建模式

[schema](./schema.md) 定义了给定 Weaviate 类中对象的数据结构。我们将为 Wikipedia 的 `Article` 类创建一个模式，将 CSV 列映射，使用 [text2vec-openai vectorizer](../configuration/schema-configuration.md#specify-a-vectorizer)。该模式将具有两个属性:
* `title` - 文章标题，不进行向量化处理
* `content` - 文章内容，对应于 CSV 的 `text` 列

从 Weaviate 1.18 开始，默认情况下 `text2vec-openai` 向量化器使用与 OpenAI 数据集相同的模型 `text-embedding-ada-002`。为了确保教程在默认情况下的变化情况下能够正常工作（即如果 OpenAI 发布了性能更好的模型，并且 Weaviate 将其作为默认模型切换），我们将明确配置模式向量化器使用相同的模型：

```json
{
  "moduleConfig": {
    "text2vec-openai": {
      "model": "ada",
      "modelVersion": "002",
      "type": "text"
    }
  }
}
```

要特别注意的另一个细节是如何存储`content_vector`嵌入。[Weaviate对整个对象进行矢量化](../config-refs/schema.md#configure-semantic-indexing)（而不是属性），并且默认情况下，在将要进行矢量化的对象的字符串序列化中包含类名。由于OpenAI仅为`text`（内容）字段提供了嵌入，我们需要确保Weaviate以相同的方式对`Article`对象进行矢量化。这意味着我们需要禁用在矢量化中包含类名，因此我们必须在`moduleConfig`的`text2vec-openai`部分中设置`vectorizeClassName: false`。这些模式设置将如下所示：

import CreateSchema from '/_includes/code/tutorials.wikipedia.schema.mdx';

<CreateSchema />

为了快速检查模式是否正确创建，您可以导航到 `<weaviate-endpoint>/v1/schema`。例如，在Docker安装场景中，转到 `http://localhost:8080/v1/schema` 或运行命令,

```bash
curl -s http://localhost:8080/v1/schema | jq
```

:::tip jq
The [`jq`](https://stedolan.github.io/jq/) command used after `curl` is a handy JSON preprocessor. When simply piping some text through it, `jq` returns the text pretty-printed and syntax-highlighted.
:::tip


## 导入文章

现在我们可以开始导入文章了。为了达到最佳性能，我们将通过[批量导入](../api/rest/batch.md)的方式将文章加载到Weaviate中。

import ImportArticles from '/_includes/code/tutorials.wikipedia.import.mdx';

<ImportArticles />


### 检查导入是否正确

进行两个快速的检查，确保导入操作如预期进行：

1. 获取文章数量
2. 获取5篇文章

前往[Weaviate GraphQL控制台](https://console.weaviate.io)，连接到您的Weaviate端点（例如`http://localhost:8080`或`https://some-endpoint.weaviate.network`），然后运行下面的GraphQL查询：

```graphql
query {
  Aggregate { Article { meta { count } } }

  Get {
    Article(limit: 5) {
      title
      url
    }
  }
}
```

您应该会看到`Aggregate.Article.meta.count`字段等于您导入的文章数量（例如25,000），以及五篇随机文章的`title`和`url`字段。

## 查询

现在我们已经导入了文章，让我们运行一些查询！

### nearText

[`nearText` 过滤器](../api/graphql/vector-search-parameters.md#neartext) 允许我们搜索与一个或多个概念的向量表示在向量空间中接近的对象。例如，查询"欧洲的现代艺术"的向量将接近于文章 [Documenta](https://simple.wikipedia.org/wiki/Documenta) 的向量，该文章描述了
> "世界上最重要的现代艺术展览之一... 在德国卡塞尔举办"。

import NearText from '/_includes/code/tutorials.wikipedia.nearText.mdx';

<NearText />

### 混合式

尽管`nearText`使用稠密向量来查找与搜索查询意思相似的对象，但在关键词搜索方面表现不佳。例如，在这个简单英语维基百科数据集中，对"jackfruit"进行`nearText`搜索，将会找到"cherry tomato"作为最佳结果。对于这些（事实上，大多数）情况，我们可以通过使用[`hybrid`筛选器](../api/graphql/vector-search-parameters.md#hybrid)来获得更好的搜索结果，它将稠密向量搜索与关键词搜索结合起来：

import Hybrid from '/_includes/code/tutorials.wikipedia.hybrid.mdx';

<Hybrid />


## 概述

在本教程中，我们学习了以下内容：
* 如何使用Weaviate批处理和CSV延迟加载以高效导入大型数据集，使用`pandas` / `csv-parser`
* 如何导入现有的向量（"Bring Your Own Vectors"）
* 如何快速检查所有记录是否已导入
* 如何使用`nearText`和`hybrid`搜索


## 推荐阅读

- [教程：详细了解模式（Schemas）](./schema.md)
- [教程：详细了解查询](./query.md)
- [教程：模块入门](./modules.md)


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />