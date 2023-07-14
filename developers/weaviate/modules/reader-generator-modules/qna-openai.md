---
image: og/docs/modules/qna-openai.jpg
sidebar_position: 21
title: Question Answering - OpenAI
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

* OpenAI问答（Q&A）模块是一个用于通过OpenAI[完成端点](https://platform.openai.com/docs/api-reference/completions)或Azure OpenAI等进行数据提取的Weaviate模块。
* 该模块依赖于应该与Weaviate一起运行的文本矢量化模块。
* 该模块在GraphQL的`Get {}`查询中添加了一个`ask {}`参数。
* 该模块在GraphQL的`_additional {}`字段中返回最多1个答案。
* 返回具有最高置信度(`certainty`)的答案。
* 在Weaviate版本`v1.16.6`中添加。

import OpenAIOrAzureOpenAI from '/_includes/openai.or.azure.openai.mdx';

<OpenAIOrAzureOpenAI/>

## 简介

问答(Q&A) OpenAI模块是一个用于从数据中提取答案的Weaviate模块。它使用OpenAI的完成端点来尝试从最相关的文档中提取答案。

该模块可以在GraphQL的`Get{...}`查询中作为搜索操作符使用。`qna-openai`模块尝试在指定类的数据对象中找到一个答案。如果在给定的`certainty`范围内找到答案，则将在GraphQL的`_additional { answer { ... } }`字段中返回它。如果返回的答案超过可选设置的`certainty`值，将最多返回1个答案。返回的答案将是具有最高`certainty`（置信水平）的答案。

## 推理API密钥

`qna-openai` 需要来自OpenAI或Azure OpenAI的API密钥。

:::tip
You only need to provide one of the two keys, depending on which service (OpenAI or Azure OpenAI) you are using.
:::

### 提供 Weaviate 的密钥

您可以通过两种方式提供 API 密钥：

1. 在 Docker 实例的**配置**过程中，通过将 `OPENAI_APIKEY` 或 `AZURE_APIKEY`（根据需要选择）添加到 `docker-compose` 文件的 `environment` 部分，如下所示：

  ```yaml
  environment:
    OPENAI_APIKEY: 'your-key-goes-here'  # 用于 OpenAI。设置此参数是可选的；您也可以在运行时提供密钥。
    AZURE_APIKEY: 'your-key-goes-here'  # 用于Azure OpenAI。设置此参数是可选的；您也可以在运行时提供密钥。
...

```

2. 在**运行时**（推荐），通过在请求头中提供`"X-OpenAI-Api-Key"`或`"X-Azure-Api-Key"`来提供。您可以使用Weaviate客户端来提供它，像这样：

import ClientKey from '/_includes/code/core.client.openai.apikey.mdx';

<ClientKey />

## 模块配置

:::tip Not applicable to WCS
This module is enabled and pre-configured on Weaviate Cloud Services.
:::

### 配置文件（仅限Weaviate开源版）

您可以在配置文件（例如`docker-compose.yaml`）中启用OpenAI Q&A模块。将`qna-openai`模块（以及您可能需要的任何其他模块）添加到`ENABLE_MODULES`属性中，如下所示：

```
ENABLE_MODULES: 'text2vec-openai,qna-openai'
```

这是一个完整的Docker配置示例，其中结合使用了`qna-openai`模块和`text2vec-openai`模块：

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
      semitechnologies/weaviate:||site.weaviate_version||
    ports:
      - 8080:8080
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-openai'
      ENABLE_MODULES: 'text2vec-openai,qna-openai'
      OPENAI_APIKEY: sk-foobar  # For use with OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      AZURE_APIKEY: sk-foobar  # For use with Azure OpenAI. Setting this parameter is optional; you can also provide the key at runtime.
      CLUSTER_HOSTNAME: 'node1'
```

## 模式配置

您可以在模式中定义此模块的设置。

### OpenAI vs Azure OpenAI

- **OpenAI** 用户可以选择设置 `model` 参数。
- **Azure OpenAI** 用户必须设置 `resourceName` 和 `deploymentId` 参数。

### 模型参数

您还可以通过下面显示的参数配置模型的其他参数。

### 示例模式

例如，以下模式配置将设置 Weaviate 使用 `qna-openai` 模型和 `Document` 类。

以下模式配置使用 `text-davinci-002` 模型。

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "vectorizer": "text2vec-openai",
      "moduleConfig": {
        "qna-openai": {
          "model": "text-davinci-002", // For OpenAI
          "resourceName": "<YOUR-RESOURCE-NAME>",  // For Azure OpenAI
          "deploymentId": "<YOUR-MODEL-NAME>",  // For Azure OpenAI
          "maxTokens": 16, // Applicable to both OpenAI and Azure OpenAI
          "temperature": 0.0,  // Applicable to both OpenAI and Azure OpenAI
          "topP": 1,  // Applicable to both OpenAI and Azure OpenAI
          "frequencyPenalty": 0.0,  // Applicable to both OpenAI and Azure OpenAI
          "presencePenalty": 0.0  // Applicable to both OpenAI and Azure OpenAI
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "name": "content"
        }
      ]
    }
  ]
}
```

有关如何使用各个参数的信息，您可以[在此处查看](https://platform.openai.com/docs/api-reference/completions)

## 如何使用

该模块在GraphQL的`Get{...}`查询中添加了一个名为`ask{}`的搜索参数。这个新的搜索参数接受以下参数：

| 字段 | 数据类型 | 是否必需 | 示例值 | 描述 |
|- |- |- |- |- |
| `question`  | 字符串 | 是 | `"荷兰国王的名字是什么？"` | 要回答的问题。 |
| `properties`  | 字符串列表 | 否 | `["summary"]` | 包含文本的查询类的属性。如果未设置属性，则会考虑所有属性。 |

注解：

* GraphQL的`Explore { }`函数支持`ask`搜索器，但结果只是指向包含答案的对象的信标。因此，它与使用问题进行近似文本语义搜索没有任何区别。没有进行任何提取操作。
* 您不能同时使用`'ask'`参数和`'near'`参数！

### 示例查询

import CodeQNAOpenAIAsk from '/_includes/code/qna-openai.ask.mdx';

<CodeQNAOpenAIAsk/>

### GraphQL响应

答案包含在一个名为`answer`的新GraphQL `_additional`属性中。它包含以下字段：

* `hasAnswer` (`boolean`)：是否找到答案？
* `result` (可为空的`string`)：如果找到答案，则为答案。如果`hasAnswer==false`，则为`null`。
* `property`（可空 `string`）：包含答案的属性。如果 `hasAnswer==false`，则为 `null`。
* `startPosition`（`int`）：答案开始的字符偏移量。如果 `hasAnswer==false`，则为 `0`。
* `endPosition`（`int`）：答案结束的字符偏移量。如果 `hasAnswer==false`，则为 `0`。

注意：响应中的`startPosition`、`endPosition`和`property`不一定存在。它们是通过对输入文本进行不区分大小写的字符串匹配函数计算得出的。如果转换模型以不同的方式格式化输出（例如，在原始输入中不存在的标记之间引入空格），则位置的计算和属性的确定将失败。

### 示例响应

```json
{
  "data": {
    "Get": {
      "Document": [
        {
          "_additional": {
            "answer": {
              "hasAnswer": true,
              "result": " Stanley Kubrick is an American filmmaker who is best known for his films, including \"A Clockwork Orange,\" \"Eyes Wide Shut,\" and \"The Shining.\""
            }
          }
        }
      ]
    }
  }
}
```

## 工作原理（底层原理）

在底层，该模型使用了两步的方法。首先，它执行语义搜索以找到最有可能包含答案的文档（例如句子、段落、文章等）。然后，在第二步中，Weaviate创建所需的提示作为对OpenAI Completions端点的外部调用的输入。Weaviate使用最相关的文档来建立一个提示，OpenAI从中提取答案。有三种可能的结果：

1. 未找到答案，因为问题无法回答。
2. 找到了一个答案，但未达到用户指定的最低可信度要求，因此被忽略（通常是文档与问题相关，但不包含实际答案的情况）。
3. 找到了一个与期望可信度匹配的答案，并返回给用户。

该模块在内部执行语义搜索，因此需要一个`text2vec-...`模块。它不需要与`qna-...`模块的类型相同。例如，您可以使用一个`text2vec-contextionary`模块来执行语义搜索，并使用一个`qna-openai`模块来提取答案。

## 附加信息

### 可用模型

OpenAI提供了多个模型用于从给定上下文中提取答案。

* 对于文档嵌入，您可以选择以下模型：
  * [ada](https://platform.openai.com/docs/models/ada)
  * [babbage](https://platform.openai.com/docs/models/babbage)
  * [curie](https://platform.openai.com/docs/models/curie)
  * [davinci](https://platform.openai.com/docs/models/davinci)

这些模型可以进行配置

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />