---
image: og/docs/howto.jpg
sidebar_position: 25
title: Image search
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.image.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.image.ts';

## 概述

本页面介绍了使用图像作为输入进行相似性搜索的其他独特方面。

如果您想使用矢量或其他对象搜索图像，请参考[如何：相似性搜索](./similarity.md)页面。

:::info Not available in WCS
Image-based search is currently not available in WCS, as the required modules are not available.
:::

### 目标对象类型

要使用图像作为输入进行搜索，您必须使用`img2vec-neural`或`multi2vec-clip`的向量化模块。具体来说：
- 要查找相似图像，可以使用`img2vec-neural`或`multi2vec-clip`
- 要查找相关的文本和图像对象（即多模态搜索），必须使用`multi2vec-clip`

## 要求

要使用输入图像进行搜索，您必须：
* 配置Weaviate与图像向量化模块（`img2vec-neural`或`multi2vec-clip`），以
* 配置目标类别以使用图像向量化模块

<details>
  <summary>我如何使用图像向量化模块配置Weaviate？</summary>

您必须在相关的配置文件（例如`docker-compose.yml`）中启用所需的向量化模块，并指定推理API地址。您可以使用[Weaviate配置工具](../installation/docker-compose.md#configurator)生成此文件。

下面是一个`img2vec-neural`配置示例：

```yaml
services:
  weaviate:
    environment:
      IMAGE_INFERENCE_API: "http://i2v-neural:8080"
      DEFAULT_VECTORIZER_MODULE: 'img2vec-neural'
      ENABLE_MODULES: 'img2vec-neural'
  i2v-neural:
    image: semitechnologies/img2vec-pytorch:resnet50
```

下面是一个示例`multi2vec-clip`配置：

```yaml
services:
  weaviate:
    environment:
      CLIP_INFERENCE_API: 'http://multi2vec-clip:8080'
      DEFAULT_VECTORIZER_MODULE: 'multi2vec-clip'
      ENABLE_MODULES: 'multi2vec-clip'
  multi2vec-clip:
    image: semitechnologies/multi2vec-clip:sentence-transformers-clip-ViT-B-32-multilingual-v1
    environment:
      ENABLE_CUDA: '0'
```

</details>

<details>
  <summary>如何使用图像矢量化模块配置目标类？</summary>

您必须配置目标类以便：
- 确保目标类配置为使用图像矢量化模块，例如通过将其显式设置为类的矢量化器。
- 在 `imageFields` 属性中指定将存储图像的 [blob](../config-refs/datatypes.md#datatype-blob) 字段。


要使用`img2vec-neural`，一个示例的类定义可能如下所示: 

```json
{
  "classes": [
    {
      "class": "ImageExample",
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
        }
      ],
      "vectorizer": "img2vec-neural"
    }
  ]
}
```

要使用`multi2vec-clip`，一个示例类定义可能如下所示：

```json
{
  "classes": [
    {
      "class": "ClipExample",
      "moduleConfig": {
        "multi2vec-clip": {
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
          "name": "image"
        }
      ],
      "vectorizer": "multi2vec-clip"
    }
  ]
}
```

请注意，对于 [multi2vec-clip 向量化模块](../modules/retriever-vectorizer-modules/multi2vec-clip.md)，还有其他可用的设置，例如如何平衡文本和图像派生的向量。

</details>

:::info For more detail
See the relevant module page for:
- [img2vec-neural](../modules/retriever-vectorizer-modules/img2vec-neural.md)
- [multi2vec-clip](../modules/retriever-vectorizer-modules/multi2vec-clip.md)
:::

## 基于base64的近似图像搜索

您可以通过对图像的base64编码表示进行[`nearImage`](../modules/retriever-vectorizer-modules/img2vec-neural.md#nearimage-search)搜索来找到相似的图像。

您可以按照以下方式获取此表示（一个长字符串）：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  ```python
  base64_string = base64.b64encode(content).decode('utf-8')  # 标准库模块
  ```
  </TabItem>
  <TabItem value="js" label="TypeScript">

  ```typescript
  base64String = content.toString('base64');
  ```
  </TabItem>
  <TabItem value="curl" label="Shell">

  ```shell
  base64 -i Corgi.jpg
  ```
  </TabItem>
</Tabs>


然后，您可以按照以下方式搜索相似的图像：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START base64"
      endMarker="# END base64"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START base64"
      endMarker="// END base64"
      language="ts"
    />
  </TabItem>
</Tabs>


<details>
  <summary>示例响应</summary>

  <FilteredTextBlock
    text={PyCode}
    startMarker="# START Expected base64 results"
    endMarker="# END Expected base64 results"
    language="json"
  />

</details>


## 指定图像文件名

如果您的目标图像存储在文件中，您可以使用Python客户端通过文件名搜索图像。您可以在[这里](https://weaviate-python-client.readthedocs.io/en/stable/weaviate.gql.html#weaviate.gql.get.GetBuilder.with_near_image)找到相关信息。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ImageFileSearch"
      endMarker="# END ImageFileSearch"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="TypeScript">

  > 目前还没有提供。请为 [功能请求](https://github.com/weaviate/typescript-client/issues/65) 进行投票。下面是自定义的代码示例。

  <FilteredTextBlock
    text={TSCode}
    startMarker="// START ImageFileSearch"
    endMarker="// END ImageFileSearch"
    language="ts"
  />

  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

  <FilteredTextBlock
    text={PyCode}
    startMarker="# START Expected base64 results"
    endMarker="# END 期望的 base64 结果"
    language="json"
  />

</details>

## 距离阈值

您可以通过设置最大 `distance` 来为相似性搜索设置一个阈值。距离表示两个图像之间的相异程度。
语法与[其他 `nearXXX` 操作符](./similarity.md#distance-threshold)相同。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />