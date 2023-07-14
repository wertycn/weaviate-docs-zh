---
image: og/docs/howto.jpg
sidebar_position: 20
title: Similarity / Vector search
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/search.similarity.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.similarity.ts';

## 概述

本页面将展示如何使用Weaviate和`nearXXX`参数执行基于相似性的搜索。

:::info Related pages
- [API References: Vector search parameters](../api/graphql/vector-search-parameters.md)
:::

import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />

## 基于相似度的参数

以下是可用的参数：

* [`near<Media>`](#an-input-medium) - 查找与输入媒体最相似的对象：
    * 例如：使用它来查找与“可爱动物”最相似的文本对象，或者与特定图像最相似的图像。
* [`nearObject`](#an-object) - 查找与另一个Weaviate对象最相似的对象：
    * 例如：使用它来查找与对象 `56b9449e-65db-5df4-887b-0a4773f52aa7` 最相似的 Weaviate 对象。
* [`nearVector`](#a-vector) - 找到与输入向量最接近的对象。
    * 例如：使用它来查找与向量 `[-0.368, 0.1397, ... , 0.0971]` 最相似的 Weaviate 对象。

### 输入媒体

:::tip This is only available for classes with a [vectorizer](../modules/retriever-vectorizer-modules/index.md) configured.
:::

您可以使用这些参数来查找与原始（未矢量化）输入最相似的对象，例如文本或图像。对于文本对象，您可以提供一个输入文本给 [`nearText`](../api/graphql/vector-search-parameters.md#neartext)，对于图像对象，您可以提供一个输入图像给 [`nearImage`](./image.md)。（如果使用 [CLIP](../modules/retriever-vectorizer-modules/multi2vec-clip.md)，则可以使用其中任意一种。）

下面的示例使用`nearText`在`JeopardyQuestion`类中搜索与`"animals in movies"`最匹配的前2个对象：

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetNearTextPython"
  endMarker="# END GetNearTextPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetNearText"
  endMarker="// END GetNearText"
  language="ts"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetNearTextGraphql"
  endMarker="# END GetNearTextGraphql"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START Expected nearText results"
  endMarker="# END Expected nearText results"
  language="json"
/>

</details>

### 一个对象

您可以使用[`nearObject`参数](../api/graphql/vector-search-parameters.md#nearobject)来查找与现有Weaviate对象最相似的对象。要这样做，只需指定对象ID（例如`56b9449e-65db-5df4-887b-0a4773f52aa7`），如下所示。

:::tip How to retrieve object IDs
See [this section](./basics.md#retrieve-the-object-id)
:::

下面的示例使用`nearObject`在`JeopardyQuestion`类中搜索与ID为`56b9449e-65db-5df4-887b-0a4773f52aa7`的对象最匹配的前2个对象：

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetNearObjectPython"
  endMarker="# END GetNearObjectPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetNearObject"
  endMarker="// END GetNearObject"
  language="ts"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetNearObjectGraphQL"
  endMarker="# END GetNearObjectGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<!-- 可能添加: 您可以在集合外部传递对象的ID，以便跨集合查找相似的对象。 -->


### 一个向量

您可以使用[`nearVector`参数](../api/graphql/vector-search-parameters.md#nearvector)来查找与输入向量（例如`[-0.368, 0.1397, ... , 0.0971]`）最相似的对象。

下面的示例使用`nearVector`在`JeopardyQuestion`类中搜索与提供的向量最匹配的前2个对象:

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetNearVectorPython"
  endMarker="# END GetNearVectorPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetNearVector"
  endMarker="// END GetNearVector"
  language="ts"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetNearVectorGraphQL"
  endMarker="# END GetNearVectorGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>


## 限制结果

您可以对以下内容设置限制：
- 返回结果的数量（使用`limit`参数）
- 返回结果与查询的相似程度（使用[`distance`](#distance-threshold)参数）
- 返回结果中距离查询的“跳数”（使用[`autocut`](#autocut)过滤器）

`autocut`可以与`limit`结合使用，以设置`autocut`返回的最大结果数。

### 结果数量

您可以通过在相同的方式中使用`limit`来设置返回的最大结果数，就像在[搜索基础教程](./basics.md#limit-returned-objects)中所示的那样。

同样地，您可以使用`limit`和`offset`来检索从第`m`个结果开始的最大`n`个对象，就像在[搜索基础教程](./basics.md#paginate-with-limit-and-offset)中所示的那样。

为了限制`near...`查询返回的结果数量，添加`limit`参数。为了从给定的偏移量开始，添加`offset`参数。例如，如果我们想要从上述[`nearText`示例](#an-input-medium)中获取电影中的动物#2和#3，我们需要使用`offset: 1, limit: 2`。下面的示例在`JeopardyQuestion`类中搜索最匹配`"animals in movies"`的对象，跳过1个对象（`offset`）并返回接下来的2个对象：

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# 获取Limit和Offset（Python）"
  endMarker="# 结束 获取Limit和Offset（Python）"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// 获取Limit和Offset"
  endMarker="// 结束 获取Limit和Offset"
  language="ts"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# 获取Limit和Offset（GraphQL）"
  endMarker="# END GetLimitOffsetGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>


### 距离阈值

您可以通过设置最大`distance`来设置相似搜索的阈值。距离表示两个对象之间的不相似程度。

在Weaviate中有多种[距离度量方式](../config-refs/distances.md)可供选择。您可以在模式中进行设置，具体方法请参见[此处的示例](../config-refs/schema.md#default-distance-metric)。

下面的示例搜索`JeopardyQuestion`类中最匹配`"animals in movies"`的对象，并返回`distance`小于`0.18`的对象：

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithDistancePython"
  endMarker="# END GetWithDistancePython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithDistance"
  endMarker="// END GetWithDistance"
  language="ts"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithDistanceGraphQL"
  endMarker="# END GetWithDistanceGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

:::info Why `0.18`?
The numerical value for `distance` will depend on many factors, including the vectorization model and the distance metric used. As such, there are no hard and fast rules. In this case, we selected this value as our trial and error evaluation of this dataset indicated this value to produce relatively intuitive outputs.
:::

:::tip Using `certainty` possible for `cosine` distance metric only
If the distance metric is set as `cosine` the [`certainty`](../config-refs/distances.md#distance-vs-certainty) variable can be used, which normalizes the complement of distance to a value between 0 and 1.
:::


### 自动剪切

另一种限制相似搜索结果的方法是使用[`autocut`过滤器](../api/graphql/additional-operators.md#autocut)。Autocut接受一个正整数参数`N`，根据每个结果与查询的[距离](#distance-threshold)进行计算，并在距离的第`N`个“跳跃”后停止返回结果。例如，如果由`nearText`返回的六个对象的距离分别为`[0.1899, 0.1901, 0.191, 0.21, 0.215, 0.23]`，那么`autocut: 1`将返回前三个对象，`autocut: 2`将返回除最后一个对象外的所有对象，`autocut: 3`将返回所有对象。 

Autocut 可以按如下方式使用：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START Autocut Python"
      endMarker="# END Autocut Python"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START Autocut"
      endMarker="// END Autocut"
      language="ts"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START 自动剪切 GraphQL"
      endMarker="# END 自动剪切 GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START 预期近文本结果"
  endMarker="# END 预期近文本结果"
  language="json"
/>

</details>


## 按属性或交叉引用对结果进行分组

:::info Requires Weaviate `v1.19.0` or higher.
:::

您可以根据任意属性或交叉引用对搜索结果进行分组。

下面的示例搜索`JeopardyQuestion`类以获取最匹配`"电影中的动物"`的对象，并获取最接近的10个结果。然后，将这些结果按`round`进行分组，最多返回两个组，每个组最多包含两个结果（`hits`）:

:::tip Grouping by cross-references
To group results by a cross-reference, try replacing the `path` value from `round` to `hasCategory` in the example below.
:::

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithGroupbyPython"
  endMarker="# END GetWithGroupbyPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithGroupBy"
  endMarker="// END GetWithGroupBy"
  language="ts"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithGroupbyPython"
  startMarker="# GetWithGroupbyGraphQL"
  endMarker="# END GetWithGroupbyGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 期望的 groupBy 结果"
  endMarker="# END 期望的 groupBy 结果"
  language="json"
/>

</details>

## 添加一个条件（`where`）筛选器

您可以使用[`where`参数](../api/graphql/filters.md)为搜索结果添加条件筛选器。

下面的示例将搜索`JeopardyQuestion`类中与`"电影中的动物"`最匹配的前2个对象，条件是它们的`round`属性恰好为`"Double Jeopardy!"`：

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithWherePython"
  endMarker="# END GetWithWherePython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithFilter"
  endMarker="// END GetWithFilter"
  language="ts"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithWhereGraphQL"
  endMarker="# END GetWithWhereGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下的响应:

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 期望的结果"
  endMarker="# 结束期望的结果"
  language="json"
/>

</details>

## 查找最不相似的结果

有时候您可能想找到与给定输入最不相似的对象。对于某些距离度量来说，这是可能的：

- 对于余弦距离，可以对一个向量的负值进行相似性搜索来找到最不相似的结果。
- 对于欧几里得距离或点积距离，"最不相似"向量的定义不是那么明确。

因此，我们通常建议在这种情况下使用余弦距离，并使用 `nearVector` 来搜索*负数*的输入向量。

<details>
  <summary>更多讨论</summary>

在这里，"最不相似"的概念与在嵌入空间中找到彼此相反的向量有关。

这并不一定意味着这些“最不相似”的结果在语义上具有相反的含义，比如词语的反义词。

以"雨"和"干旱"为例。虽然它们是相反的概念，但它们都与天体物理学无关。因此，在许多模型中，"雨"和"天体物理学"之间的嵌入距离可能大于"雨"和"干旱"之间的嵌入距离。因此，在解释结果时，您应该考虑您的用例的上下文。

</details>

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />