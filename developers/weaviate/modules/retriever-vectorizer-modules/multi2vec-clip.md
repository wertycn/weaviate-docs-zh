---
image: og/docs/modules/multi2vec-clip.jpg
sidebar_position: 6
title: multi2vec-clip
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

`multi2vec-clip`模块允许您将预训练的Sentence-BERT CLIP模型用作Weaviate的向量化模块。要在Weaviate中使用CLIP，需要启用`multi2vec-clip`模块。这些模型通常使用单独的推理容器。这样可以实现高效的扩展和资源规划。基于神经网络的模型在启用GPU的服务器上运行效率最高，但Weaviate是针对CPU进行优化的。这种单独容器的微服务设置使您可以非常轻松地在启用GPU的硬件上独立地托管（和扩展）模型，同时将Weaviate保留在廉价的CPU硬件上。

要选择特定的模型，您只需选择正确的Docker容器。有一些预先构建的Docker镜像可供选择，但您也可以使用一个简单的两行Dockerfile构建自己的镜像。

## 如何使用

您有三个选项来选择您想要的模型：

1. **使用[我们任意一个预构建好的clip模型容器](#pre-built-images)。** 这些模型容器是由我们预先构建并打包成容器的。（如果您认为我们应该支持另一个模型，请在[这里打开一个问题或拉取请求](https://github.com/weaviate/weaviate/issues)）。
2. **使用Hugging Face模型库中的任何SBERT CLIP模型。** [点击这里了解如何使用](#option-2-use-any-publicly-available-hugging-face-model)。`multi2vec-clip`模块支持任何与`SentenceTransformers`兼容的基于CLIP的转换器模型。
3. **使用任何私有或者SBERT Clip模型**。[点击这里了解详情](#option-3-custom-build-with-a-private-or-local-model)。如果您拥有自己基于CLIP的`SentenceTransformers`模型，并且已经在注册表或本地磁盘上，您可以将其与Weaviate一起使用。

## 选项1：使用预先构建的transformer模型容器

### 示例docker-compose文件
注意：您也可以使用[Weaviate配置工具](/developers/weaviate/installation/docker-compose.md#configurator)。

您可以在下方找到一个示例的Docker-compose文件，它将启动带有multi2vec-clip模块的Weaviate。在这个示例中，我们选择了`sentence-transformers/clip-ViT-B-32-multilingual`模型，它非常适合将图像和文本向量化到同一向量空间中。它甚至支持多种语言。请参阅下方的说明以选择替代模型。

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
      CLIP_INFERENCE_API: 'http://multi2vec-clip:8080'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'multi2vec-clip'
      ENABLE_MODULES: 'multi2vec-clip'
      CLUSTER_HOSTNAME: 'node1'
  multi2vec-clip:
    image: semitechnologies/multi2vec-clip:sentence-transformers-clip-ViT-B-32-multilingual-v1
    environment:
      ENABLE_CUDA: '0'
...
```

请注意，在没有GPU的情况下运行带有multi2vec-clip模块的Weaviate将比在CPU上慢。如果您有可用的GPU，请启用CUDA（`ENABLE_CUDA=1`）。

### 另选方案：配置您的自定义设置

*注意：以下步骤仅在您想手动将模块添加到现有设置中时才需要。如果您从头开始，一个更方便的选择是使用我们的[配置和自定义工具](/developers/weaviate/installation/docker-compose.md#configurator)。*

#### 步骤1：启用`multi2vec-clip`模块
确保设置了 `ENABLE_MODULES=multi2vec-clip` 环境变量。另外，将该模块设置为默认的矢量化器，这样您就不需要在每个模式类中指定它：`DEFAULT_VECTORIZER_MODULE=multi2vec-clip`

#### 第二步：运行您喜欢的模型

选择[我们预先构建的任何 CLIP 模型](/developers/weaviate/installation/docker-compose.md#configurator)（如果要构建自己的模型容器，请参阅下文），并使用您的设置启动它。

:::tip
Use a CUDA-enabled machine for optimal performance.
:::

#### 第三步：告诉Weaviate从哪里获取推理结果

将Weaviate环境变量`CLIP_INFERENCE_API`设置为推理容器的位置，例如`CLIP_INFERENCE_API="http://multi2vec-clip:8000"`（根据需要调整主机名和端口）

现在您可以正常使用Weaviate，导入和搜索时的所有向量化都将使用所选的CLIP transformers模型进行。

## 选项2：使用Hugging Face Model Hub上的任何公开可用的SBERT CLIP模型

您可以使用两行Dockerfile构建支持[Hugging Face模型库](https://huggingface.co/models)中任何模型的Docker镜像。在以下示例中，我们将为[`clip-ViT-B-32`模型](https://huggingface.co/sentence-transformers/clip-ViT-B-32)构建一个自定义镜像。*注意：该模型已经存在作为预构建容器，您不必自己构建它。这只是为了概述该过程。*

#### 步骤1：创建一个`Dockerfile`
创建一个新的 `Dockerfile` 文件。我们将其命名为 `clip.Dockerfile`。将以下行添加到文件中：
```
FROM semitechnologies/multi2vec-clip:custom
RUN CLIP_MODEL_NAME=clip-ViT-B-32 TEXT_MODEL_NAME=clip-ViT-B-32 ./download.py
```

#### 步骤2：构建并标记您的Dockerfile。
我们将将我们的Dockerfile标记为`clip-inference`：
```
docker build -f clip.Dockerfile -t clip-inference .
```

#### 步骤 3: 完成了！
您现在可以将图像推送到您喜欢的注册表，或者在您的 Weaviate `docker-compose.yaml` 中本地引用它，使用 Docker 标签 `clip-inference`。


## 选项 3: 使用私有或本地模型进行自定义构建

您可以构建一个支持任何与 `SentenceTransformers` `ClIPModel` 兼容的模型的 Docker 镜像。此外，文本模型可以是一个常规的 sentence-transformers 模型，但它必须产生兼容的向量。
表示。因此，只能使用专门为与CLIP模型配套使用的模型。

在下面的示例中，我们将构建一个自定义图像，用于非公开模型，该模型已在`./my-clip-model`和`./my-text-model`中进行本地存储。这两个模型都经过训练，可以生成与彼此兼容的嵌入。

创建一个新的`Dockerfile`（您不需要克隆此存储库，任何文件夹都可以），我们将其命名为`my-models.Dockerfile`。添加以下内容：
将以下行添加到其中：

```
FROM semitechnologies/transformers-inference:custom
COPY ./my-text-model /app/models/text
COPY ./my-clip-model /app/models/clip
```

上述操作将确保您的模型分别保存在图像的`/app/models/clip`和`/app/models/text`路径下。这个路径非常重要，以便应用程序可以找到模型。

现在，您只需要构建和标记您的Dockerfile，我们将其标记为`my-models-inference`：

```
$ docker build -f my-models.Dockerfile -t my-models-inference .
```

就是这样！您现在可以将您的镜像推送到您喜欢的仓库，或者在您的Weaviate的`docker-compose.yaml`文件中使用Docker标签`my-models-inference`在本地引用它。

如果您想调试您的推理容器是否正常工作，您可以直接向向量化器模块的推理容器发送查询，这样您就可以看到它对哪个输入会生成什么向量。为了这样做，您需要暴露推理容器。在您的Docker-compose文件中添加类似以下内容：
```yaml
ports:
  - "9090:8080"
```
将其添加到您的`t2v-transformers`中。

然后，您可以直接发送REST请求，例如`curl
localhost:9090/vectorize -d '{"texts": ["foo bar"], "images":[]}'`，它将直接打印创建的向量。

## 用于CLIP向量化类的模式配置

以下是一个有效的负载，用于使用`multi2vec-clip`模块作为`vectorizer`向量化图像和文本字段的类：

```json
{
  "classes": [
    {
      "class": "ClipExample",
      "moduleConfig": {
        "multi2vec-clip": {
          "imageFields": [
            "image"
          ],
          "textFields": [
            "name"
          ],
          "weights": {
            "textFields": [0.7],
            "imageFields": [0.3]
          }
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "name": "name"
        },
        {
          "dataType": [
            "blob"
          ],
          "name": "image"
        }
      ],
      "vectorIndexType": "hnsw",
      "vectorizer": "multi2vec-clip"
    }
  ]
}
```

请注意：
- `moduleConfig.multi2vec-clip` 中的 `imageFields` 和 `textFields` 不需要同时设置。但是，至少其中一个必须设置。
- `moduleConfig.multi2vec-clip` 中的 `weights` 是可选的。如果只有一个属性，则该属性将占据全部权重。如果存在多个属性且未指定权重，则这些属性的权重相等。

然后，您可以像往常一样导入该类的数据对象。填写 `text` 或...
`string`字段用于存储文本，`blob`字段用于存储Base64编码的图片。

### 限制
- 从`v1.9.0`开始，该模块需要显式创建一个类。如果您依赖于自动模式来为您创建类，则会缺少有关哪些字段应该进行向量化的必要配置。这个问题将在未来的版本中解决。您可以随时手动更新由Auto-schema错误创建的类模式配置，并修复它。
     自己。

## 附加的GraphQL API参数

### nearText

`multi2vec-clip`向量化器模块为`Get {}`和`Explore {}` GraphQL函数添加了两个搜索操作符：`nearText: {}`和`nearImage: {}`。这些操作符可以用于在数据集中语义搜索文本和图像。

注意：在同一个查询中，您不能使用多个`'near'`过滤器，或者将`'near'`过滤器与[`'ask'`](../reader-generator-modules/qna-transformers.md)过滤器一起使用！

#### 示例 GraphQL Get(`nearText{}`) 操作符

import CodeNearText from '/_includes/code/graphql.filters.nearText.mdx';

<CodeNearText />

#### 示例 GraphQL Get(`nearImage{}`) 操作符

import CodeNearImage from '/_includes/code/img2vec-neural.nearimage.mdx';

<CodeNearImage />

或者，您可以在Python、Java或Go客户端中使用一个辅助函数（不能在JavaScript客户端中使用）。使用一个编码器函数，您可以将图像作为`png`文件输入，并将其编码为`base64`编码的值。

import CodeNearImageEncode from '/_includes/code/img2vec-neural.nearimage.encode.mdx';

<CodeNearImageEncode />

### 距离

您可以设置一个最大允许的`distance`，用于确定哪些
返回的数据结果。距离字段的值的解释取决于所使用的[距离度量](/developers/weaviate/config-refs/distances.md)。

如果距离度量是`cosine`，您还可以使用`certainty`替代`distance`。Certainty将距离归一化到0到1的范围内，其中0表示完全相反（余弦距离为2），1表示具有相同角度的向量（余弦距离为0）。Certainty在非余弦距离度量上不可用。

### 移动中

由于多维存储中无法进行分页，您可以通过使用附加的探索函数来改进结果，这些函数可以远离语义概念或朝向语义概念。例如，如果您搜索概念“纽约时报”，但不想找到纽约这个城市，您可以使用`moveAwayFrom{}`函数，并使用单词“纽约”。这也是一种排除概念并处理否定（类似查询语言中的`not`运算符）的方法。在`moveAwayFrom{}`筛选器中的概念并不一定被排除在结果之外，而是与该筛选器中的概念相距较远的结果概念。

移动可以基于`概念`和/或`对象`进行。
* `概念`需要提供一个或多个单词的列表。
* `对象`需要提供一个或多个对象的列表，可以使用它们的`id`或`beacon`进行指定。例如：

```graphql
{
  Get{
    Publication(
      nearText: {
        concepts: ["fashion"],
        distance: 0.6,
        moveTo: {
            objects: [{
                beacon: "weaviate://localhost/Article/e5dc4a4c-ef0f-3aed-89a3-a73435c6bbcf"
            }, {
                id: "9f0c7463-8633-30ff-99e9-fd84349018f5"
            }],
            concepts: ["summer"],
            force: 0.9
        }
      }
    ){
      name
      _additional {
        distance
        id
      }
    }
  }
}
```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />