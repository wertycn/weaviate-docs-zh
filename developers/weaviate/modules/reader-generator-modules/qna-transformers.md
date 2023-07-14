---
image: og/docs/modules/qna-transformers.jpg
sidebar_position: 20
title: Question Answering - transfomers
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

* 问答（Q&A）模块是一个用于从数据中提取答案的Weaviate模块。
* 该模块依赖于一个应该与Weaviate一起运行的文本向量化模块。
* 该模块在GraphQL的`Get {}`查询中添加了一个`ask {}`参数。
* 该模块在GraphQL的`_additional {}`字段中返回最多1个答案。
* 返回具有最高`certainty`（置信水平）的答案。

问答（Q&A）模块是一个用于从数据中提取答案的Weaviate模块。它使用与BERT相关的模型来查找和提取答案。该模块可以在GraphQL的`Get{...}`查询中使用，作为一个搜索操作符。`qna-transformers`模块尝试在指定类的数据对象中找到答案。如果在给定的`certainty`范围内找到答案，则会在GraphQL的`_additional { answer { ... } }`字段中返回。最多只返回一个答案，如果这个数量超过了可选设置的`certainty`值。将返回具有最高`certainty`（置信水平）的答案。

目前有五个不同的问答模块可供选择（来自[Hugging Face](https://huggingface.co/)）：[`distilbert-base-uncased-distilled-squad (uncased)`](https://huggingface.co/distilbert-base-uncased-distilled-squad), [`bert-large-uncased-whole-word-masking-finetuned-squad (uncased)`](https://huggingface.co/bert-large-uncased-whole-word-masking-finetuned-squad), [`distilbert-base-cased-distilled-squad (cased)`](https://huggingface.co/distilbert-base-cased-distilled-squad), [`deepset/roberta-base-squad2`](https://huggingface.co/deepset/roberta-base-squad2) 和 [`deepset/bert-large-uncased-whole-word-masking-squad2 (uncased)`](https://huggingface.co/deepset/bert-large-uncased-whole-word-masking-squad2)。请注意，并非所有模型在每个数据集和用例上表现良好。我们推荐使用`bert-large-uncased-whole-word-masking-finetuned-squad (uncased)`，它在大多数数据集上表现最佳（尽管它相对较重）。

自`v1.10.0`版本开始，答案分数可以作为搜索结果的重新排序因素。

## 如何启用（模块配置）

### Docker-compose

Q&A模块可以作为一个服务添加到Docker-compose文件中。您必须运行一个文本向量化器，比如`text2vec-contextionary`或`text2vec-transformers`。以下是一个使用`qna-transformers`模块（`bert-large-uncased-whole-word-masking-finetuned-squad (uncased)`）与`text2vec-transformers`结合使用的示例Docker-compose文件:

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
      TRANSFORMERS_INFERENCE_API: 'http://t2v-transformers:8080'
      QNA_INFERENCE_API: "http://qna-transformers:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-transformers'
      ENABLE_MODULES: 'text2vec-transformers,qna-transformers'
      CLUSTER_HOSTNAME: 'node1'
  t2v-transformers:
    image: semitechnologies/transformers-inference:sentence-transformers-msmarco-distilbert-base-v2
    environment:
      ENABLE_CUDA: '1'
      NVIDIA_VISIBLE_DEVICES: all
    deploy:
      resources:
        reservations:
          devices:
          - capabilities: [gpu]
  qna-transformers:
    image: semitechnologies/qna-transformers:bert-large-uncased-whole-word-masking-finetuned-squad
    environment:
      ENABLE_CUDA: '1'
      NVIDIA_VISIBLE_DEVICES: all
    deploy:
      resources:
        reservations:
          devices:
          - capabilities: [gpu]
...
```

变量解释：
* `QNA_INFERENCE_API`：qna模块运行的位置
* `ENABLE_CUDA`：如果设置为1，则使用GPU（如果主机上可用）

_注意：目前，文本向量化模块不能在单个设置中组合。这意味着您只能启用`text2vec-contextionary`、`text2vec-transformers`中的一个或者不启用任何文本向量化模块。_

## 如何使用（GraphQL）

### GraphQL Ask搜索

该模块为GraphQL的`Get{...}`查询添加了一个搜索参数：`ask{}`。这个新的搜索参数接受以下参数：

| 字段 	| 数据类型 	| 是否必需 	| 示例值 	| 描述 	|
|-	|-	|-	|-	|-	|
| `question` 	| 字符串 	| 是 	| `"荷兰国王的名字是什么？"` 	| 要回答的问题。 	|
| `certainty` 	| float 	| 否 	| `0.75` | 问题答案的期望最小确定度或置信度。值越高，搜索越严格。值越低，搜索越模糊。如果没有设置确定度，将返回任何可能的答案|
| `properties` 	| 字符串列表 	| 否 	| `["summary"]` 	| 包含文本的查询类的属性。如果没有设置属性，将考虑所有属性。	|
| `rerank` | bool | no | `true` | 如果启用，qna模块将根据答案的分数重新排序结果。例如，如果第3个结果-根据先前（语义）搜索确定-包含最可能的答案，则结果3将被推到位置1，依此类推。*在v1.10.0之前不支持* |

注释：
* GraphQL的`Explore { }`函数支持`ask`搜索器，但结果只是一个包含答案的对象的信标。因此，它与使用问题进行近似文本语义搜索没有任何区别。没有进行提取操作。
* 不能同时使用`'ask'`参数和`'near'`参数！

### 示例查询

import CodeQnaTransformer from '/_includes/code/qna-transformers.ask.mdx';

<CodeQnaTransformer />

### GraphQL响应

答案包含在一个名为`answer`的新GraphQL `_additional`属性中。它包含以下字段：
* `hasAnswer`（`boolean`类型）：是否找到答案？
* `result`（可为空的`string`类型）：如果找到答案，则为答案。如果`hasAnswer==false`，则为`null`。
* `certainty`（可为空的`float`类型）：返回答案的确信度。如果`hasAnswer==false`，则为`null`。
* `property`（可为空的`string`类型）：包含答案的属性。如果`hasAnswer==false`，则为`null`。
* `startPosition`（`int`）：答案开始的字符偏移量。如果`hasAnswer==false`，则为`0`。
* `endPosition`（`int`）：答案结束的字符偏移量。如果`hasAnswer==false`，则为`0`。

注意：响应中的`startPosition`、`endPosition`和`property`不能保证一定存在。它们是通过对输入文本进行不区分大小写的字符串匹配函数计算得出的。如果转换模型对输出进行了不同的格式化（例如，在原始输入中引入了标记之间不存在的空格），则位置的计算和属性的确定将失败。

### 示例响应

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "answer": {
              "certainty": 0.73,
              "endPosition": 26,
              "hasAnswer": true,
              "property": "summary",
              "result": "king willem - alexander",
              "startPosition": 48
            }
          },
          "title": "Bruised Oranges - The Dutch royals are botching covid-19 etiquette"
        }
      ]
    }
  },
  "errors": null
}
```

## 自定义问答转换器模块

您可以使用与`text2vec-transformers`相同的方法，参见[这里](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md#option-3-custom-build-with-a-private-or-local-model)，即选择预构建的容器之一，或者使用`semitechnologies/qna-transformers:custom`基础镜像从您自己的模型构建自己的容器。请确保您的模型与Hugging Face的`transformers.AutoModelForQuestionAnswering`兼容。

## 工作原理（内部实现）

在内部，该模型采用了两步方法。首先，它执行语义搜索，以找到最有可能包含答案的文档（例如句子、段落、文章等）。然后，在文档的所有`text`和`string`属性上执行BERT风格的答案提取。现在有三种可能的结果：
1. 未找到答案，因为问题无法回答，
2. 找到了一个答案，但没有达到用户指定的最低确定性，因此被丢弃（通常是当文档与主题相关，但没有实际回答问题时），以及
3. 找到了一个符合期望确定性的答案。将其返回给用户。

该模块在内部执行语义搜索，因此需要一个`text2vec-...`模块。它不需要与`qna-...`模块相同类型。例如，您可以使用`text2vec-contextionary`模块执行语义搜索，然后使用`qna-transformers`模块提取答案。

### 长文档的自动滑动窗口处理

如果数据对象中的文本值超过512个标记，问答转换器模块会自动将文本分割成较小的文本。该模块使用滑动窗口，即重叠的文本片段，以避免如果答案位于边界上时无法找到答案的情况。如果答案在边界上，问答模块将返回得分最高的结果（答案），因为滑动机制可能会导致重复。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />