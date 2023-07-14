---
image: og/docs/modules/sum-transformers.jpg
sidebar_position: 80
title: Summarization
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简而言之

* 摘要（`sum-transformers`）模块是一个 Weaviate 模块，用于将整个段落摘要成短文本。
* 该模块将一个专注于摘要的 transformers 模型容器化，以供 Weaviate 连接使用。我们在这里提供了预构建的模型，但您也可以连接来自 Hugging Face 的其他 transformer 模型，甚至是自定义模型。
* 该模块在GraphQL的`_additional{}`字段中添加了一个`summary{}`过滤器。
* 该模块将结果返回到GraphQL的`_additional{ summary{} }`字段中。

## 简介

正如名称所示，摘要模块可以在查询时生成Weaviate文本对象的摘要。

**例如**，它允许我们在Weaviate中对我们的数据运行查询，可以使用以下文本：

> <em>"这座塔高324米（1,063英尺），与一座81层楼高的建筑物相同高度，是巴黎最高的建筑物。它的底座呈正方形，每边长125米（410英尺）。在建造期间，埃菲尔铁塔超过了华盛顿纪念碑，成为世界上最高的人造结构，这个头衔保持了41年，直到1930年纽约的克莱斯勒大厦竣工。它是第一个达到300米高度的建筑物。由于1957年在塔顶增设了一个广播天线，它现在比克莱斯勒大厦高出5.2米（17英尺）。除了发射器，埃菲尔铁塔是法国第二高的独立支撑结构，仅次于米洛高架桥。"</em>

并将其转换为一个类似这样的简短句子：

> <em>“埃菲尔铁塔是法国巴黎的地标。”</em>

:::note GPUs preferred
For maximum performance of your queries, transformer-based models should run with GPUs.
CPUs can be used, however, this will significantly slow down your queries.
:::

### 可用模块

以下是当前可用的`SUM`模块列表 - 来自[Hugging Face](https://huggingface.co/)：
* [`bart-large-cnn`](https://huggingface.co/facebook/bart-large-cnn)
* [`pegasus-xsum`](https://huggingface.co/google/pegasus-xsum)

## 如何启用（模块配置）

### Docker-compose

`sum-transformers`模块可以作为一个服务添加到Docker-compose文件中。您必须运行一个文本向量化器，例如`text2vec-contextionary`或`text2vec-transformers`。

以下是一个示例的Docker-compose文件，使用`sum-transformers`模块（使用`facebook-bart-large-cnn`模型）与`text2vec-contextionary`向量化器模块结合使用的情况：

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
    environment:
      CONTEXTIONARY_URL: contextionary:9999
      SUM_INFERENCE_API: "http://sum-transformers:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-contextionary'
      ENABLE_MODULES: 'text2vec-contextionary,sum-transformers'
      CLUSTER_HOSTNAME: 'node1'
  contextionary:
    environment:
      OCCURRENCE_WEIGHT_LINEAR_FACTOR: 0.75
      EXTENSIONS_STORAGE_MODE: weaviate
      EXTENSIONS_STORAGE_ORIGIN: http://weaviate:8080
      NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE: 5
      ENABLE_COMPOUND_SPLITTING: 'false'
    image: semitechnologies/contextionary:en0.16.0-v1.0.2
    ports:
    - 9999:9999
  sum-transformers:
    image: semitechnologies/sum-transformers:facebook-bart-large-cnn-1.2.0
    # image: semitechnologies/sum-transformers:google-pegasus-xsum-1.2.0  # Could be used instead
...
```

变量解释：
* `SUM_INFERENCE_API`：摘要模块运行的位置

## 如何使用（GraphQL）

为了利用模块的功能，可以在查询中扩展以下新的 `_additional` 属性：

### GraphQL 令牌

该模块在 GraphQL 查询的 `_additional` 字段中添加了一个搜索过滤器：`summary{}`。这个新的过滤器接受以下参数：

| 字段 | 数据类型 | 是否必需 | 示例值 | 描述 |
| `properties` | 字符串列表 | 是 | `["description"]` | 查询类的属性，其中包含文本（`text`或`string`数据类型）。您必须提供至少一个属性。|

### 查询示例

import CodeSumTransformer from '/_includes/code/sum-transformers-module.mdx';

<CodeSumTransformer />

### GraphQL响应

答案包含在一个名为`summary`的新的GraphQL `_additional`属性中，它返回一个令牌列表。它包含以下字段：
* `property` (`string`): 被总结的属性 - 当您总结多个属性时，这非常有用
* `result` (`string`): 输出的总结

### 示例响应

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "summary": [
              {
                "property": "summary",
                "result": "Finding the perfect pair of jeans can be a challenge."
              }
            ]
          },
          "title": "The Most Comfortable Gap Jeans to Shop Now"
        }
      ]
    }
  },
  "errors": null
}
```

## 使用Hugging Face的另一个摘要模块

您可以使用两行Dockerfile构建一个支持[Hugging Face Model Hub](https://huggingface.co/models?pipeline_tag=summarization)中任何摘要模型的Docker映像。在以下示例中，我们将构建一个自定义映像，用于[`google/pegasus-pubmed`模型](https://huggingface.co/google/pegasus-pubmed)。

#### 步骤1：创建`Dockerfile`

创建一个新的 `Dockerfile`。我们将其命名为 `my-model.Dockerfile`。将以下行添加到其中：
```
FROM semitechnologies/sum-transformers:custom
RUN chmod +x ./download.py
RUN MODEL_NAME=google/pegasus-pubmed ./download.py
```

#### 第2步：构建和标记您的Dockerfile。

我们将把Dockerfile标记为`google-pegasus-pubmed`：
```
docker build -f my-model.Dockerfile -t google-pegasus-pubmed .
```

#### 第三步：在Weaviate中使用图像

您现在可以将图像推送到您喜欢的注册表，或者在您的Weaviate `docker-compose.yaml`中使用Docker标签`google-pegasus-pubmed`本地引用它。

## 工作原理（在幕后）

`sum-transformers`模块使用基于transformer的摘要模型。它们是生成式的，即从输入文本中生成新的文本，而不是提取特定的句子。例如，模型可以接收这样的文本：

<details>
  <summary>查看原始文本</summary>

> *尼斯湖水怪（苏格兰盖尔语：Uilebheist Loch Nis），亲切地被称为尼西，是苏格兰民间传说中栖息在苏格兰高地尼斯湖的一种生物。它常被描述为体型庞大、长脖子，并且从水中突出一个或多个隆起。自从1933年引起全球关注以来，对这一生物的兴趣和信仰一直有所不同。对其存在的证据是凭证性的，包括一些有争议的照片和声纳读数。*
> *科学界将所谓的尼斯湖水怪目击事件解释为恶作剧、一厢情愿的想法以及对平凡物体的误认。神秘科学和神秘动物学的亚文化对这种生物特别重视。*

</details>

并总结出一个类似的文本:

> *尼斯湖水怪据说是一种又大又长脖子的生物。自1933年全球范围内引起关注以来，人们对这个生物的信仰一直不一致。关于它的存在证据存在争议，有许多有争议的照片和声纳读数。神秘科学和神秘动物学的次文化对这个生物特别重视。*

请注意，大部分的输出内容并非直接复制输入内容，而是基于输入内容生成的。然后，`sum-transformers` 模块将这个输出作为响应返回。

:::note Input length
Note that like many other language models, summarizer models can only process a limited amount of text. The `sum-transformers` module will be limited to the maximum length of the model it is using. For example, the `facebook/bart-large-cnn` model can only process 1024 tokens.

On the other hand, be aware that providing an input of insufficient length and detail may cause the transformer model to [hallucinate](https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)).
:::

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />