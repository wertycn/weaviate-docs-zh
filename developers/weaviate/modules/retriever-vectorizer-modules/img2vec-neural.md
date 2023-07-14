---
image: og/docs/modules/img2vec-neural.jpg
sidebar_position: 5
title: img2vec-neural
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

该模块使用神经网络对图像进行向量化。可以使用预训练的模块。`resnet50`是第一个支持的模型，其他模型即将发布。[`resnet50`](https://arxiv.org/abs/1512.03385)是一个具有2550万参数的残差卷积神经网络，训练于来自[ImageNet数据库](https://www.image-net.org/)的超过一百万张图像。顾名思义，它总共有50层：48个卷积层，1个最大池化层和1个平均池化层。

## 可用的img2vec-neural模型

有两个不同的推理模型可以选择。根据您的机器（`arm64`或其他）以及是否希望使用多线程提取特征向量，您可以在`keras`和`pytorch`之间进行选择。两个模型之间没有其他区别。
- `resnet50`（`keras`）：
  - 支持`amd64`，但不支持`arm64`。
  - 尚不支持`CUDA`。
  - 支持多线程推理
- `resnet50`（`pytorch`）：
  - 支持 `amd64` 和 `arm64`。
  - 支持 `CUDA`
  - 不支持多线程推理

## 如何在Weaviate中启用

注意：您也可以使用[Weaviate配置工具](/developers/weaviate/installation/docker-compose.md#configurator)。

### Docker-compose文件
您可以在下面找到一个示例的Docker-compose文件，它将使用图像向量化模块启动Weaviate。这个示例只会启动一个向量化模块，即`pytorch`的`img2vec-neural`模块，并且使用`resnet50`模型。

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
      IMAGE_INFERENCE_API: "http://i2v-neural:8080"
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'img2vec-neural'
      ENABLE_MODULES: 'img2vec-neural'
      CLUSTER_HOSTNAME: 'node1'
  i2v-neural:
    image: semitechnologies/img2vec-pytorch:resnet50
```

如果您想使用`keras`模块，可以将`semitechnologies/img2vec-pytorch:resnet50`替换为`semitechnologies/img2vec-keras:resnet50`。

您可以将图像矢量化模块与文本矢量化模块结合使用。在下面的示例中，我们同时使用了[`text2vec-contextionary`](./text2vec-contextionary.md)模块和`img2vec-neural`模块。我们将`text2vec-contextionary`设置为默认的矢量化模块，这意味着当我们希望使用`img2vec-neural`模块而不是`text2vec-contextionary`模块来进行类的矢量化时，需要在模式中进行指定。

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
        IMAGE_INFERENCE_API: "http://i2v-neural:8080"
        QUERY_DEFAULTS_LIMIT: 25
        AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
        PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
        DEFAULT_VECTORIZER_MODULE: 'text2vec-contextionary'
        ENABLE_MODULES: 'text2vec-contextionary,img2vec-neural'
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
    i2v-neural:
      image: semitechnologies/img2vec-pytorch:resnet50
...
```


### 其他方法
如果您不想使用Docker-compose（而是在生产环境中使用例如[Kubernetes](../../installation/kubernetes.md)），那么您可以按照以下步骤使用`img2vec-neural`模块：
1. 启用 `img2vec-neural` 模块。确保设置了 `ENABLE_MODULES=img2vec-neural` 环境变量。可以与文本向量化模块一起使用：`ENABLE_MODULES: 'text2vec-contextionary,img2vec-neural'`。另外，您还可以将其中一个模块设置为默认的向量化器，这样您就不必在每个模式类上指定它：`DEFAULT_VECTORIZER_MODULE=text2vec-contextionary`。
2. 运行`img2vec-neural`模块，例如使用`docker run -itp "8000:8080" semitechnologies/img2vec-neural:resnet50-61dcbf8`。
3. 告诉Weaviate去哪里找推理模块。将Weaviate环境变量`IMAGE_INFERENCE_API`设置为您的推理容器所在的位置，例如`IMAGE_INFERENCE_API="http://localhost:8000"`。
4. 您现在可以正常使用Weaviate，并且在导入和搜索时所有的图像向量化将使用所选的图像向量化模型进行处理（前提是模式配置正确）。

## 模式配置

您可以在模式中为每个类别指定使用图像向量化器。有关如何配置数据模式的详细信息，请转到[这里](/developers/weaviate/configuration/schema-configuration.md)。当您将类别的`vectorizer`设置为`img2vec-neural`时，只有在`moduleConfig`中指定的属性字段才会被计算为向量。

当将类别向量化器设置为`img2vec-neural`时，模块配置必须包含关于哪个字段保存图像的信息。在`imageFields`中指定的字段的数据类型应为[`blob`](/developers/weaviate/config-refs/datatypes.md#datatype-blob)。可以通过以下配置在类对象中实现这一点:

```json
  "moduleConfig": {
    "img2vec-neural": {
      "imageFields": [
        "image"
      ]
    }
  }
```

如果指定了多个字段，模块将分别对它们进行向量化，并使用它们的平均向量。

下面是一个使用`img2vec-neural`模块的完整示例。该模块使用了`blob`数据类型。


```json
{
  "classes": [
    {
      "class": "FashionItem",
      "description": "Each example is a 28x28 grayscale image, associated with a label from 10 classes.",
      "moduleConfig": {
        "img2vec-neural": {
          "imageFields": [
            "image"
          ]
        }
      },
      "properties": [
        {
          "dataType": [
            "blob"
          ],
          "description": "Grayscale image",
          "name": "image"
        },
        {
          "dataType": [
            "number"
          ],
          "description": "Label number for the given image.",
          "name": "labelNumber"
        },
        {
          "dataType": [
            "text"
          ],
          "description": "label name (description) of the given image.",
          "name": "labelName"
        }
      ],
      "vectorIndexType": "hnsw",
      "vectorizer": "img2vec-neural"
    }
  ]
}
```

:::note
Other properties, for example the name of the image that is given in another field, will not be taken into consideration. This means that you can only find the image with semantic search by [another image](#nearimage-search), [data object](/developers/weaviate/api/graphql/vector-search-parameters.md#nearobject), or [raw vector](/developers/weaviate/api/graphql/vector-search-parameters.md#nearvector). Semantic search of images by text field (using `nearText`) is not possible, because this requires a `text2vec` vectorization module. Multiple modules cannot be combined at class level yet (might become possible in the future, since `image-text-combined transformers` exists). We recommend to use one of the following workarounds:
1. Best practice for multi-module search: create an image class and a text class in which you refer to each other by cross-reference. This way you can always hop along the reference and search either by "text labels" (using a `text2vec-...` module) or by image (using a `img2vec-...` module).
2. If you don't want to create multiple classes, you are limited to using a `where` filter to find images by other search terms than an `image`, `data object`, or `vector`. A `where` filter does not use semantic features of a module.
:::

## 添加图像数据对象

在添加数据时，请确保指定的字段填充有效的图像数据（例如jpg，png等），并将其编码为具有`blob`数据类型的属性中的`base64`（字符串）值。blob类型本身（见下文）要求所有blob都是base64编码的。要获取图像的base64编码值，您可以使用Weaviate客户端中的辅助方法，或者运行以下命令：

```bash
cat my_image.png | base64
```

然后，您可以按照以下方式将数据以`blob`数据类型导入到Weaviate中：

import CodeImg2Vec from '/_includes/code/img2vec-neural.create.mdx';

<CodeImg2Vec />

## 附加的GraphQL API参数

### nearImage搜索

您可以使用向量搜索运算符`nearVector`和`nearObject`来搜索相似的图像。此外，您还可以在搜索时将新图像转换为向量，并通过图像的向量进行搜索。为此，您可以使用带有`base64`编码的`image`参数的`nearImage`搜索运算符：

import CodeNearImage from '/_includes/code/img2vec-neural.nearimage.mdx';

<CodeNearImage />

或者，您可以在Python、Java或Go客户端中使用一个辅助函数（不适用于TypeScript客户端）。使用编码器函数，您可以将图像作为`png`文件输入，并将其编码为`base64`编码的值。

import CodeNearImageEncode from '/_includes/code/img2vec-neural.nearimage.encode.mdx';

<CodeNearImageEncode />


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />