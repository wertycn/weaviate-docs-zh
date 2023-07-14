---
image: og/docs/modules/text2vec-transformers.jpg
sidebar_position: 3
title: text2vec-transformers
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

`text2vec-transformers` 模块允许您使用预训练的语言转换模型作为 Weaviate 矢量化模块，运行自己的推理容器。请注意，这与基于 API 的模块（如 [`text2vec-openai`](./text2vec-openai.md)、[`text2vec-cohere`](./text2vec-cohere.md) 和 [`text2vec-huggingface`](./text2vec-huggingface.md)）不同，后者使用外部 API 对数据进行矢量化。

使用`text2vec-transformers`模块，您可以根据您的用例使用任意数量的预训练NLP模型。这意味着像`BERT`，`DilstBERT`，`RoBERTa`，`DilstilROBERTa`等模型可以直接在Weaviate中使用。

模型被封装在Docker容器中。这样可以实现高效的扩展和资源规划。要选择特定的模型，请选择正确的Docker容器。有一系列预构建的Docker镜像可供选择，但您也可以使用一个简单的两行Dockerfile构建自己的镜像。这种独立容器的微服务设置使您能够非常容易地在支持GPU的硬件上独立地托管（和扩展）模型，同时将Weaviate部署在廉价的仅CPU硬件上，因为Weaviate经过了CPU优化。

:::tip Significant GPU/CPU speed differences
Transformer architecture models run *much* faster with GPUs, even for inference (10x+ speeds typically). 

Without a GPU, import or `nearText` queries may become bottlenecks in production if using `text2vec-transformers`.

If this is the case, we recommend:
- An API-based module such as [`text2vec-cohere`](./text2vec-cohere.md) or [`text2vec-openai`](./text2vec-openai.md), or 
- The [`text2vec-contextionary`](./text2vec-contextionary.md) module if you prefer a local inference container.
:::

## 如何启用

### Weaviate云服务

`text2vec-transformers`模块在WCS上不可用。

### Weaviate开源版

您有三个选项来选择您想要的模型：

1. **使用[我们预先构建的任意transformers模型容器](#pre-built-images)。** 在[这个列表](#pre-built-images)中选择的模型在过去的语义搜索中表现良好。这些模型容器是由我们预先构建，并打包在一个容器中。（如果您认为我们应该支持另一个模型，请在这里打开一个问题或pull请求](https://github.com/weaviate/weaviate/issues)）。
2. **使用Hugging Face Model Hub中的任何模型**。[点击这里了解详情](#option-2-use-any-publicly-available-hugging-face-model)。`text2vec-transformers` 模块支持任何PyTorch或Tensorflow transformer模型。
3. **使用私有或本地的PyTorch或Tensorflow transformer模型**。[点击这里了解详情](#option-3-custom-build-with-a-private-or-local-model)。如果您拥有自己的transformer模型，可以在注册表或本地磁盘上使用它与Weaviate。

### 选项1：使用预构建的Transformer模型容器

#### 示例Docker-compose文件
注意：您也可以使用[Weaviate配置工具](/developers/weaviate/installation/docker-compose.md#configurator)。

您可以在下面找到一个示例的Docker-compose文件，它将启动带有transformers模块的Weaviate。在这个示例中，我们选择了 `sentence-transformers/multi-qa-MiniLM-L6-cos-v1` 这个模型，它非常适合[非对称语义搜索](https://sbert.net/examples/applications/semantic-search/README.html#symmetric-vs-asymmetric-semantic-search)。请参阅下面的内容，了解如何选择其他模型。

```yaml
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:||site.weaviate_version||
    restart: on-failure:0
    ports:
     - "8080:8080"
    environment:
      QUERY_DEFAULTS_LIMIT: 20
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: "./data"
      DEFAULT_VECTORIZER_MODULE: text2vec-transformers
      ENABLE_MODULES: text2vec-transformers
      TRANSFORMERS_INFERENCE_API: http://t2v-transformers:8080
      CLUSTER_HOSTNAME: 'node1'
  t2v-transformers:
    image: semitechnologies/transformers-inference:sentence-transformers-multi-qa-MiniLM-L6-cos-v1
    environment:
      ENABLE_CUDA: 0 # set to 1 to enable
```

:::note Have you enabled CUDA?
The `text2vec-transformer` module will benefit greatly from GPU usage. Make sure to enable CUDA if you have a compatible GPU available (`ENABLE_CUDA=1`).
:::

### 另一种选择：配置您的自定义设置

#### 步骤 1：启用`text2vec-transformers`模块
确保设置`ENABLE_MODULES=text2vec-transformers`环境变量。另外，将此模块设置为默认的向量化器，这样您就不需要在每个模式类上指定它：`DEFAULT_VECTORIZER_MODULE=text2vec-transformers`

:::info Important
This setting is now a requirement, if you plan on using any module. So, when using the `text2vec-contextionary` module, you need to have `ENABLE_MODULES=text2vec-contextionary` set. All our configuration-generators / Helm charts will be updated as part of the Weaviate `v1.2.0` support.
:::

#### 步骤2：运行您喜欢的模型

选择[我们预构建的任何transformers模型](#pre-built-images)（如果要构建自己的模型容器，请参见下文），然后启动它 - 例如使用：

```
docker run -itp "8000:8080" semitechnologies/transformers-inference:sentence-transformers-multi-qa-MiniLM-L6-cos-v1
```

:::tip
Use a CUDA-enabled machine for optimal performance. Alternatively, include this container in the same `docker-compose.yml` as Weaviate.
:::

#### 步骤 3: 告诉 Weaviate 在哪里找到推理结果

将Weaviate环境变量 `TRANSFORMERS_INFERENCE_API` 设置为识别推理容器运行位置的值，例如，如果Weaviate在Docker之外运行，请使用 `TRANSFORMERS_INFERENCE_API="http://localhost:8000"`。或者，如果Weaviate和推理容器在同一Docker网络中，例如它们在同一个 `docker-compose.yml` 文件中，您可以使用Docker网络/ DNS，例如 `TRANSFORMERS_INFERENCE_API=http://t2v-transformers:8080`。

您现在可以正常使用Weaviate，导入和搜索时的所有向量化都将使用所选的transformers模型进行。

### 预构建的镜像

您可以直接从Dockerhub下载一些预构建的镜像。我们选择了一些公开可用的模型，这些模型在我们看来非常适合语义搜索。

预构建的模型包括：

|模型名称|镜像名称|
|---|---|
|`distilbert-base-uncased`（[信息](https://huggingface.co/distilbert-base-uncased)）|`semitechnologies/transformers-inference:distilbert-base-uncased`|
|`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`（[信息](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)）|`semitechnologies/transformers-inference:sentence-transformers-paraphrase-multilingual-MiniLM-L12-v2`|
|`sentence-transformers/multi-qa-MiniLM-L6-cos-v1` ([信息](https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1))|`semitechnologies/transformers-inference:sentence-transformers-multi-qa-MiniLM-L6-cos-v1`|
|`sentence-transformers/multi-qa-mpnet-base-cos-v1` ([信息](https://huggingface.co/sentence-transformers/multi-qa-mpnet-base-cos-v1))|`semitechnologies/transformers-inference:sentence-transformers-multi-qa-mpnet-base-cos-v1`|
|`sentence-transformers/all-mpnet-base-v2` ([信息](https://huggingface.co/sentence-transformers/all-mpnet-base-v2))|`semitechnologies/transformers-inference:sentence-transformers-all-mpnet-base-v2`|
|`sentence-transformers/all-MiniLM-L12-v2` ([信息](https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2))|`semitechnologies/transformers-inference:sentence-transformers-all-MiniLM-L12-v2`|
|`sentence-transformers/paraphrase-multilingual-mpnet-base-v2`（[信息](https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2)）|`semitechnologies/transformers-inference:sentence-transformers-paraphrase-multilingual-mpnet-base-v2`|
|`sentence-transformers/all-MiniLM-L6-v2`（[信息](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)）|`semitechnologies/transformers-inference:sentence-transformers-all-MiniLM-L6-v2`|
|`sentence-transformers/multi-qa-distilbert-cos-v1`（[详情](https://huggingface.co/sentence-transformers/multi-qa-distilbert-cos-v1)）|`semitechnologies/transformers-inference:sentence-transformers-multi-qa-distilbert-cos-v1`|
|`sentence-transformers/gtr-t5-base`（[详情](https://huggingface.co/sentence-transformers/gtr-t5-base)）|`semitechnologies/transformers-inference:sentence-transformers-gtr-t5-base`|
|`sentence-transformers/gtr-t5-large` ([信息](https://huggingface.co/sentence-transformers/gtr-t5-large))|`semitechnologies/transformers-inference:sentence-transformers-gtr-t5-large`|
|`google/flan-t5-base` ([信息](https://huggingface.co/google/flan-t5-base))|`semitechnologies/transformers-inference:sentence-transformers-gtr-t5-base`|
|`google/flan-t5-large` ([信息](https://huggingface.co/google/flan-t5-large))|`semitechnologies/transformers-inference:sentence-transformers-gtr-t5-large`|
|DPR 模型|
|`facebook/dpr-ctx_encoder-single-nq-base` ([详情](https://huggingface.co/facebook/dpr-ctx_encoder-single-nq-base))|`semitechnologies/transformers-inference:facebook-dpr-ctx_encoder-single-nq-base`|
|`facebook/dpr-question_encoder-single-nq-base` ([详情](https://huggingface.co/facebook/dpr-question_encoder-single-nq-base))|`semitechnologies/transformers-inference:facebook-dpr-question_encoder-single-nq-base`|
|`vblagoje/dpr-ctx_encoder-single-lfqa-wiki` ([信息](https://huggingface.co/vblagoje/dpr-ctx_encoder-single-lfqa-wiki))|`semitechnologies/transformers-inference:vblagoje-dpr-ctx_encoder-single-lfqa-wiki`|
|`vblagoje/dpr-question_encoder-single-lfqa-wiki` ([信息](https://huggingface.co/vblagoje/dpr-question_encoder-single-lfqa-wiki))|`semitechnologies/transformers-inference:vblagoje-dpr-question_encoder-single-lfqa-wiki`|
|Bar-Ilan大学NLP实验室模型|
|`biu-nlp/abstract-sim-sentence` ([信息](https://huggingface.co/biu-nlp/abstract-sim-sentence))|`semitechnologies/transformers-inference:biu-nlp-abstract-sim-sentence`|
|`biu-nlp/abstract-sim-query` ([信息](https://huggingface.co/biu-nlp/abstract-sim-query))|`semitechnologies/transformers-inference:biu-nlp-abstract-sim-query`|

上述图像名称始终指向包含模型的推理容器的最新版本。您还可以通过追加来明确指定
`-latest` 添加到镜像名称中。此外，您还可以将版本固定为此存储库的现有git标签之一。例如，要将 `distilbert-base-uncased` 固定到版本 `1.0.0`，您可以使用 `semitechnologies/transformers-inference:distilbert-base-uncased-1.0.0`。

您最喜欢的模型没有包含在内？[提交一个问题](https://github.com/weaviate/weaviate/issues) 来包含它或按照下面的说明构建一个自定义镜像。

### 选项2：使用任何公开可用的Hugging Face模型

你可以使用一个两行的Dockerfile来构建支持[Hugging Face模型库](https://huggingface.co/models)中的任何模型的Docker镜像。在下面的示例中，我们将为[`distilroberta-base`模型](https://huggingface.co/distilroberta-base)构建一个自定义的镜像。

#### 步骤1：创建`Dockerfile`
创建一个新的`Dockerfile`，我们将其命名为`distilroberta.Dockerfile`。将以下内容添加到其中：
```
FROM semitechnologies/transformers-inference:custom
RUN MODEL_NAME=distilroberta-base ./download.py
```

#### 步骤2：构建和标记您的Dockerfile。
我们将把我们的Dockerfile标记为`distilroberta-inference`：
```
docker build -f distilroberta.Dockerfile -t distilroberta-inference .
```

#### 步骤 3: 完成！
现在，您可以将图像推送到您喜欢的注册表，或者在您的 Weaviate `docker-compose.yaml` 中使用 Docker 标签 `distilroberta-inference` 在本地引用它。

### 选项 3: 使用私有或本地模型进行自定义构建

您可以构建一个支持与 Hugging Face 的 `AutoModel` 和 `AutoTokenzier` 兼容的任何模型的 Docker 镜像。

在下面的示例中，我们将为一个非公开的模型构建一个自定义镜像。
我们在本地存储的模型位于`./my-model`目录中。

创建一个新的`Dockerfile`（您不需要克隆此存储库，任何文件夹都可以），我们将其命名为`my-model.Dockerfile`。将以下内容添加到文件中：

```
FROM semitechnologies/transformers-inference:custom
COPY ./my-model /app/models/model
```

以上步骤将确保您的模型最终出现在图像中的`/app/models/model`路径中。这个路径非常重要，以便应用程序可以找到模型。

现在，您只需要构建和标记您的Dockerfile，我们将将其标记为`my-model-inference`：

```
$ docker build -f my-model.Dockerfile -t my-model-inference .
```

完成了！现在您可以将图像推送到您喜爱的注册表中，或者在Weaviate的`docker-compose.yaml`中使用Docker标签`my-model-inference`在本地引用它。

要调试和测试推理容器是否正常工作，您可以直接向矢量化模块的推理容器发送查询，以便查看它将为哪些输入产生的向量。为此，您需要在docker-compose中公开推理容器，只需添加：

```yaml
ports:
  - "9090:8080"
```

使用`text2vec-transformers`库后，您可以直接向其发送REST请求，例如：
```shell
curl localhost:9090/vectors -H 'Content-Type: application/json' -d '{"text": "foo bar"}
```
并且它将直接打印创建的向量。

## 如何配置

在您的Weaviate模式中，您必须定义希望该模块如何将您的数据进行向量化。如果您对Weaviate模式不熟悉，您可能首先想查看[Weaviate模式教程](/developers/weaviate/tutorials/schema.md)。

例如：

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "moduleConfig": {
        "text2vec-transformers": {
          "poolingStrategy": "masked_mean",
          "vectorizeClassName": false
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            "text2vec-transformers": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "name": "content"
        }
      ],
      "vectorizer": "text2vec-transformers"
    }
  ]
}
```

## 如何使用

* 此模块提供的新的GraphQL向量搜索参数可以在[这里](/developers/weaviate/api/graphql/vector-search-parameters.md#neartext)找到。

### 示例

import CodeNearText from '/_includes/code/graphql.filters.nearText.mdx';

<CodeNearText />

## 附加信息

### 针对Transformers的模块配置（应用于类和属性）

您可以在类和属性上使用与`text2vec-contextionary`模块相同的模块配置，这包括`vectorizeClassName`、`vectorizePropertyName`和`skip`。

此外，您可以使用类级别的模块配置来选择池化策略，使用 `poolingStrategy`。允许的值为 `masked_mean` 或 `cls`。它们是根据[Sentence-BERT论文](https://arxiv.org/abs/1908.10084)中概述的从单词向量获取句向量的不同技术。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />