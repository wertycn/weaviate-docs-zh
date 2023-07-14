---
authors:
- zain
- erika
- connor
date: 2023-02-07
description: Learn how you can customize Large Language Models prompt responses to
  your own data by leveraging vector databases.
image: ./img/hero.png
slug: generative-search
tags:
- search
- integrations
title: ChatGPT for Generative Search
---

![ChatGPT用于生成式搜索](./img/hero.png)

<!-- 截断 -->

当OpenAI在2022年底推出ChatGPT时，仅在一周内就有超过一百万人尝试了这个模型，而且这一趋势只在继续增长。根据[路透社](https://www.reuters.com/technology/chatgpt-sets-record-fastest-growing-user-base-analyst-note-2023-02-01/)和[雅虎财经](https://finance.yahoo.com/news/chatgpt-on-track-to-surpass-100-million-users-faster-than-tiktok-or-instagram-ubs-214423357.html?guccounter=1&guce_referrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8&guce_referrer_sig=AQAAAFCTz2vosCcjWFstJGkvduTSNZJrxULx8EHwbTE8mF7EV-hAlWvmMe59ex94LHlkB40zlUMUPshv5Ggq1GxyY9oDQxtoLcc0GV2E-v-0DeGuZi7dtEJT9MZF5NvUe20V64ZCVNziFtJdWUL_AAxMFoCGFxT1duBiaPbfzwkjbyNQ)的报道，这款聊天机器人服务的月活跃用户已经超过1亿，比任何其他服务都要快。毫不夸张地说，自然语言处理和生成式大型语言模型（LLMs）已经席卷了整个世界。

尽管这不是第一个向公众发布的AI聊天机器人，但这个特定服务让人们感到惊讶的是它所拥有的广度和深度的知识以及用人类般的回答表达这些知识的能力。除此之外，这个模型的生成性方面也非常明显，它可以幻想情景，并在被要求时编造生动的细节来填充描述。这使得聊天机器人服务具有某种人类般的“创造力” - 这正是为用户体验增添了惊叹的因素！

像ChatGPT的GPT-3（聊天生成预训练变压器）这样的生成型语言模型是在互联网上的大规模开放数据集上进行训练的-由于大部分人类的一般知识都被归档并且可以通过互联网访问，这些模型有很多训练材料可以学习。这使得它们能够拥有广泛的关于世界和自然语言的一般知识。

## 为LLMs提供自定义上下文

然而，尽管语言模型在很多方面都备受瞩目和吸引力，但它们确实有一个缺点：一旦训练完成，你只能在它所训练的数据上使用ChatGPT。当你询问它今天的新闻是什么时，ChatGPT无法准确回答，因为在训练过程中它没有接触到这些数据。它可能会利用其生成能力进行回答，但答案不会以事实为基础。

这一点可能显而易见，因为它不知道自己不知道什么，然而当你考虑到这一点时，这个缺点变得更加重要：如果你向ChatGPT询问特定的信息，比如公司的私密政策，而这些政策并不公开在互联网上，它也无法给出准确的答案。这是训练过程的一个限制，更具体地说，是在训练过程中缺乏相应数据的限制。目前，ChatGPT无法准确地执行其训练集之外的任务。

为了在实际应用中充分发挥像ChatGPT的GPT-3这样的语言模型的能力，如果我们能将其生成能力应用于新的或自定义的数据，那将是理想的。例如，这将使私人定制版本的ChatGPT可以根据您公司的内部文件进行训练，并充当人力资源聊天机器人。想知道新员工的入职流程是什么样的，或者如何申请健康福利？您只需向定制的ChatGPT提问！定制的ChatGPT的应用是无限且令人兴奋的！那么，百万美元的问题是，我们如何实现这样的里程碑呢？

## 生成式搜索 - Weaviate 的 OpenAI 模块
今天我们宣布发布了 Weaviate 的 `generative-openai` 模块！该模块使您能够在自定义数据集上利用 ChatGPT 的 GPT-3 模型，并用于以前无法实现的特定用例！💥

`generative-openai`模块通过与Weaviate结合，使得创建一个“定制版ChatGPT”成为可能！通过将通用的语言模型与Weaviate这样的向量数据库集成，您可以利用模型的强大功能，在Weaviate中处理自己的数据的上下文中执行任务！

## 模块的工作原理
`generative-openai` 模块可用于让 GPT-3 完成基于 Weaviate 搜索结果提供的知识上下文的任务。该过程包括两个步骤：首先，我们使用 Weaviate 通过筛选包含与特定提示相关的知识的数据子集来提取上下文。其次，我们将提示以及第一步中筛选的文档子集直接发送到 [OpenAI 完成端点](https://platform.openai.com/docs/guides/completion) 中，以完成提示中指定的任务。

![流程图](./img/flow.png)

我们将为您提供如何设置模块的指南，以及如何使用模块的示例，并向您展示如何提示GPT-3利用Weaviate的搜索结果的细微差别。因此，话不多说，让我们开始吧！

## 如何使用它
[Generative OpenAI](/developers/weaviate/modules/reader-generator-modules/generative-openai)模块是一个新的功能，可以根据您的数据生成响应。要访问此模块，您需要使用Weaviate `1.17.3`或更新版本。

### Weaviate云服务
在Weaviate云服务（WCS）中，默认启用了`Generative OpenAI`模块。如果您的实例版本为`1.17.3`或更新版本，则可以使用该功能。

:::tip Free 14-day sandbox
You can create a free 14-day sandbox on [WCS](https://console.weaviate.cloud) and create a Weaviate instance.
:::

:::note Available modules out of the box
The following modules are enabled by default:
* [text2vec-openai](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai)
* [text2vec-cohere](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere)
* [text2vec-huggingface](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface)
* [generative-openai](/developers/weaviate/modules/reader-generator-modules/generative-openai)
:::

### 使用Docker进行本地部署

要在本地部署Weaviate时启用Generative OpenAI模块，您需要配置您的`docker-compose`文件以启用`generative-openai`模块，以及您可能需要的任何其他模块。

例如，您可以像这样启用`text2vec-openai`（用于将数据向量化和运行查询）和`generative-openai`模块：

```
ENABLE_MODULES: 'text2vec-openai,generative-openai'
```

#### Docker-Compose
这是一个完整的`docker-compose`文件示例，包括`text2vec-openai`和`generative-openai`模块：

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
    image:
      semitechnologies/weaviate:1.17.3
    ports:
      - 8080:8080
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-openai'
      ENABLE_MODULES: 'text2vec-openai,generative-openai'
      OPENAI_APIKEY: sk-foobar # this parameter is optional, as you can also provide it at insert/query time
      CLUSTER_HOSTNAME: 'node1'
```
在运行docker-compose文件之前，您需要申请一个[OpenAI API密钥](https://openai.com/api/)。您可以将密钥输入到docker-compose文件的`OPENAI_APIKEY`参数中，或在插入/查询时提供密钥。

:::note
Notice in `ENABLE_MODULES`, we are enabling two modules. In the above example we are using the `text2vec-openai` vectorization module; however, you can use another module of choice (Cohere or Hugging Face). Check out the [documentation](/developers/weaviate/modules/reader-generator-modules/generative-openai#introduction) to learn more about this.
:::

### 模式配置
在模式中为每个类配置生成模块是不必要的。它已经在Weaviate中硬编码。

:::note Available Model
The generative module is using the `text-davinci-003` model.
:::

以下是使用text2vec-openai向量化器的模式示例：
```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-openai",
      "properties": [
        {
            "name": "content",
            "description": "content that will be vectorized",
            "dataType": ["text"]
        }
      ]
    }
  ]
}
```

### 查询示例
该模块在`Get`函数的`_additional { }`属性下添加了一个`generate { }`参数。

`generate { }`参数具有以下参数：

| 字段 | 数据类型 | 描述 |
| --- | --- | --- |
| `singleResult {prompt}` | 字符串 | 生成模型为每个独立的搜索结果生成一次。 |
| `groupedResult {task}` | 字符串 | 生成模型接收所有搜索结果作为输入。 |

以下是一个使用`singleResult{ prompt }`的GraphQL查询的示例。从`PodClip`类中，我们希望生成模型根据内容回答问题“什么是Ref2Vec？”。

```graphql
{
	Get {
    PodClip (
      hybrid: {
        query: "What is Ref2Vec?"
        alpha: 0.5
      },
      limit: 1
    ){
      content
      _additional {
        generate(
          singleResult: {
            prompt: """
            Question: What is Ref2Vec?
            Please answer the question based on: {content}
            """
      		}
      	){
      		singleResult
      	}
      }
    }
	}
}
```
响应的样式如下:

```GraphQL
{
  "data": {
    "Get": {
      "PodClip": [
        {
          "_additional": {
            "generate": {
              "singleResult": "Answer: Ref2Vec is a machine learning algorithm that uses natural language processing to generate vector representations of text references. It is used to create a vector representation of a text reference, which can then be used to compare and analyze the similarity between different references. Ref2Vec can be used to identify similar references, classify references, and generate recommendations."
            }
          },
          "content": "Yeah, certainly. So Ref2Vec Centroid is a new module that we released recently. And the idea of it is that an object which is set to be vectorized, so to speak, by Ref2Vec Centroid, a vector isn't produced by this object itself, but it's produced by like the aggregate of its referenced vectors. So the Ref2Vec module will take an object and then grab the vectors from all of its references, all of its referenced objects. And then we'll compute a centroid with that set of vectors to find something that's similar to all of these things at once. And so the idea is that this is really useful when you want to represent something as an aggregation of other things, right? For example, users based on their likes, right? What can we show to a user that is something that aligns with what their express interests are in Ref2Vec Centroid is something that's perfect for doing something like that. "
        }
      ]
    }
  }
}
```

## 生成提示
`prompt` 是一个常用的术语，用于描述给LLM的指令。打造理想的提示通常更多是一门艺术而非科学。这通常也是一个迭代的过程，我们从我们想让LLM做的事情开始起草，并根据我们得到的结果来调整提示。提示的调优并不是一项直截了当的任务，术语“提示工程”已经出现，以概括这个过程的复杂性。为了帮助您开始进行提示工程，我们提供了四个提示改进的例子，使用了Weaviate增强的LLM。

* 知识基础
* 不确定性探索
* 引用来源
* 逐步思考

### 知识基础
我们可以通过对LLMs进行特定提示，使其基于搜索结果来获取知识来源，这样我们可以确保生成的回答是基于我们的数据的。例如，我们可以在任务描述中添加“基于以下搜索结果”，这样一个问答提示就会变成：

```
Please answer this question: {question} based on the following search results: {search_results}.
```

### 不确定性探测
通过提示语来引导LLMs得到我们想要的行为是一种非常令人兴奋的新兴AI技术领域。在我们的用例中，另一个非常重要的提示是要求LLM明确告诉我们当它没有足够的信息时。可以通过在提示中添加类似于`如果您没有足够的信息，请输出“不足够的信息”`来实现。

### 引用来源
另一个有用的提示示例是要求LLM引用其来源。例如，在使用`generate`中的`groupedResult`参数时，LLM将接收到一些搜索结果来基于其回答。我们可以要求LLM总结每个结果与查询的相关性，或者直接告诉我们哪个结果对最终答案最有影响。

### 逐步思考
一些其他的例子包括简单地添加`让我们逐步思考`，或者对任务进行分解，例如`首先生成一个行动计划，然后执行行动计划`。

提示是LLMs和搜索领域的一个非常新的领域。作为一般建议，建议尽可能具体地描述您希望LLM执行的任务，并具有迭代调整提示的思维方式。

import WhatNext from '/_includes/what-next.mdx'

<WhatNext />