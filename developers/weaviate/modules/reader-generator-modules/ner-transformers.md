---
image: og/docs/modules/ner-transformers.jpg
sidebar_position: 50
title: Named Entity Recognition
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简要介绍

* 命名实体识别（NER）模块是一个用于标记分类的Weaviate模块。
* 该模块依赖于应该与Weaviate一起运行的NER Transformers模型。有预先构建的模型可用，但您也可以连接另一个HuggingFace Transformer或自定义的NER模型。
* 该模块在GraphQL `_additional {}`字段中添加了一个`tokens {}`过滤器。
* 该模块正常返回数据对象，其中GraphQL `_additional { tokens {} }`字段中包含识别到的标记。

## 介绍

命名实体识别（NER）模块是一个Weaviate模块，可在运行时从现有的Weaviate（文本）对象中提取实体。实体提取是在查询时进行的。请注意，为了获得最佳性能，基于Transformer的模型应该在GPU上运行。可以使用CPU，但吞吐量会较低。

目前有三个不同的NER模块可供使用（来源于[Hugging Face](https://huggingface.co/)）：[`dbmdz-bert-large-cased-finetuned-conll03-english`](https://huggingface.co/dbmdz/bert-large-cased-finetuned-conll03-english)，[`dslim-bert-base-NER`](https://huggingface.co/dslim/bert-base-NER)，[`davlan-bert-base-multilingual-cased-ner-hrl`](https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl?text=%D8%A5%D8%B3%D9%85%D9%8A+%D8%B3%D8%A7%D9%85%D9%8A+%D9%88%D8%A3%D8%B3%D9%83%D9%86+%D9%81%D9%8A+%D8%A7%D9%84%D9%82%D8%AF%D8%B3+%D9%81%D9%8A+%D9%81%D9%84%D8%B3%D8%B7%D9%8A%D9%86)。

## 如何启用（模块配置）

### Docker-compose

可以将NER模块作为一个服务添加到Docker-compose文件中。您必须运行一个文本矢量化器，如`text2vec-contextionary`或`text2vec-transformers`。以下是一个示例的Docker-compose文件，用于将`ner-transformers`模块（`dbmdz-bert-large-cased-finetuned-conll03-english`）与`text2vec-contextionary`结合使用：

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
      NER_INFERENCE_API: "http://ner-transformers:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-contextionary'
      ENABLE_MODULES: 'text2vec-contextionary,ner-transformers'
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
  ner-transformers:
    image: semitechnologies/ner-transformers:dbmdz-bert-large-cased-finetuned-conll03-english
...
```

变量解释：
* `NER_INFERENCE_API`：qna模块运行的位置

## 如何使用（GraphQL）

要使用模块的功能，只需在查询中添加以下新的`_additional`属性：

### GraphQL Token

该模块在查询的GraphQL `_additional`字段中添加了一个搜索过滤器：`token{}`。这个新的过滤器接受以下参数：

| 字段 | 数据类型 | 必需 | 示例值 | 描述 |
|-|-|-|-|-|
| `properties` 	| 字符串列表 	| 是 	| `["summary"]` 	| 查询类的属性，包含文本（`text`或`string`数据类型）。您必须至少提供一个属性。	|
| `certainty` 	| 浮点数 	| 否 	| `0.75` | 所需的最小确定性或置信度，被识别的标记必须具有。值越高，标记分类越严格。如果没有设置确定性，将返回模型找到的所有标记。 |
| `limit` | int | no | `1` | 每个数据对象返回的令牌的最大数量。 |

### 查询示例

import CodeNerTransformer from '/_includes/code/ner-transformers-module.mdx';

<CodeNerTransformer />

### GraphQL 响应

答案包含在一个名为 `tokens` 的新的 GraphQL `_additional` 属性中，它返回一个令牌列表。它包含以下字段：
* `entity`（`string`）：实体组（分类的令牌）
* `word` (`string`): 被识别为实体的单词
* `property` (`string`): 在其中找到该标记的属性
* `certainty` (`float`): 模型对标记正确分类的确定性程度，范围为0.0-1.0
* `startPosition` (`int`): 该单词在属性值中的第一个字符的位置
* `endPosition` (`int`): 该单词在属性值中的最后一个字符的位置

### 示例响应

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "tokens": [
              {
                "property": "title",
                "entity": "PER",
                "certainty": 0.9894614815711975,
                "word": "Sarah",
                "startPosition": 11,
                "endPosition": 16
              },
              {
                "property": "title",
                "entity": "LOC",
                "certainty": 0.7529033422470093,
                "word": "London",
                "startPosition": 31,
                "endPosition": 37
              }
            ]
          },
          "title": "My name is Sarah and I live in London"
        }
      ]
    }
  },
  "errors": null
}
```

## 使用HuggingFace的另一个NER Transformer模块

您可以使用两行Dockerfile来构建支持[Hugging Face模型库](https://huggingface.co/models)中任何模型的Docker镜像。在下面的示例中，我们将构建一个自定义镜像用于[`Davlan/bert-base-multilingual-cased-ner-hrl`模型](https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl)。

#### 步骤1：创建一个`Dockerfile`
创建一个新的 `Dockerfile` 文件。我们将其命名为 `my-model.Dockerfile`。在文件中添加以下行：
```
FROM semitechnologies/ner-transformers:custom
RUN chmod +x ./download.py
RUN MODEL_NAME=Davlan/bert-base-multilingual-cased-ner-hrl ./download.py
```

#### 第2步：构建和标记您的Dockerfile。
我们将把我们的Dockerfile标记为`davlan-bert-base-multilingual-cased-ner-hrl`：
```
docker build -f my-model.Dockerfile -t davlan-bert-base-multilingual-cased-ner-hrl .
```

#### 步骤 3: 完成了！
现在，您可以将图像推送到您喜欢的注册表，或者在您的Weaviate `docker-compose.yaml`中使用Docker标签`davlan-bert-base-multilingual-cased-ner-hrl`进行本地引用。


## 工作原理（内部机制）

此存储库中的应用程序代码适用于接受文本输入（例如`我的名字是Sarah，我住在伦敦`）并以JSON格式返回信息的模型。

```json
[
  {
    "entity_group": "PER",
    "score": 0.9985478520393372,
    "word": "Sarah",
    "start": 11,
    "end": 16
  },
  {
    "entity_group": "LOC",
    "score": 0.999621570110321,
    "word": "London",
    "start": 31,
    "end": 37
  }
]
```

Weaviate NER模块接收此输出并将其处理为GraphQL输出。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />