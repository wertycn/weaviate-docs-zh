---
image: og/docs/howto.jpg
sidebar_position: 40
title: Hybrid search
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/search.hybrid.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.hybrid.ts';

## 概述

本页面向您展示了如何使用Weaviate执行`hybrid`搜索。

`hybrid`参数同时使用`bm25`（即稀疏向量）和向量（即稠密向量）搜索算法，并将它们的输出组合起来产生结果。

结果由这两个搜索输出的加权组合确定。

:::info Related pages
- [API References: Vector search parameters # Hybrid](../api/graphql/vector-search-parameters.md#hybrid)
:::

import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />

## 基本的混合搜索

要使用混合搜索，您必须至少提供一个搜索字符串。

下面的示例使用默认设置，查找：
- 包含关键字 `food` 的对象，在对象的任何位置，以及
- 最接近 `food` 向量的对象。

它使用 `bm25` 和向量搜索排名的组合对结果进行排序，并返回前3个结果。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridBasicPython"
  endMarker="# END HybridBasicPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridBasic"
  endMarker="// END searchHybridBasic"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridBasicGraphQL"
  endMarker="# END HybridBasicGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成以下类似的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 期望的 HybridBasic 结果"
  endMarker="# END 期望的 HybridBasic 结果"
  language="json"
/>

</details>


### 分数 / 解释分数

`score`和`explainScore`子属性旨在解释输出结果。它们可以在`_additional`属性下检索到。

下面的示例将这两个属性添加到检索到的属性列表中。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithScorePython"
  endMarker="# END HybridWithScorePython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithScore"
  endMarker="// END searchHybridWithScore"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithScoreGraphQL"
  endMarker="# END HybridWithScoreGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 预期的 HybridWithScore 结果"
  endMarker="# END 预期的 HybridWithScore 结果"
  language="json"
/>

</details>


## 限制结果数量

您可以通过 `hybrid` 搜索的方式限制返回的结果数量，
- 使用 `limit: <N>` 参数将结果限制为固定数量
- 使用 `autocut` 参数将结果限制为 `score` 中的前 N 个 "drops"

`autocut` 可以与 `limit: N` 结合使用，将 autocut 的输入限制为前 `N` 个对象。

### 限制结果数量

使用`limit`参数来指定应该返回的最大结果数：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START limit Python"
      endMarker="# END limit Python"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START limit"
      endMarker="// END limit"
      language="ts"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START limit GraphQL"
      endMarker="# END limit GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

### Autocut

另一种限制混合搜索返回结果的方法是使用[`autocut`过滤器](../api/graphql/additional-operators.md#autocut)。Autocut接受一个正整数参数`N`，检查每个结果的[分数](#score--explainscore)，并在分数的第`N`次"下降"之后停止返回结果。由于`hybrid`将向量搜索与关键词（BM25F）搜索相结合，它们的分数/距离不能直接进行比较，因此截断点可能不直观。<!-- TODO: 添加详细说明 -->

Autocut可以按如下方式使用：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START autocut Python"
      endMarker="# END autocut Python"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START autocut"
      endMarker="// END autocut"
      language="ts"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START autocut GraphQL"
      endMarker="# END autocut GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

应该生成以下类似的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START Expected autocut results"
  endMarker="# END Expected autocut results"
  language="json"
/>

</details>


## 关键词权重 vs 向量结果

您可以使用`alpha`参数对关键词（`bm25`）或向量搜索结果进行加权。`alpha`为`1`表示纯向量搜索，`0`表示纯关键词搜索。默认值为`0.75`。

以下示例使用`alpha`为`0.25`，偏向于关键词搜索结果。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithAlphaPython"
  endMarker="# END HybridWithAlphaPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithAlpha"
  endMarker="// END searchHybridWithAlpha"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithAlphaGraphQL"
  endMarker="# END HybridWithAlphaGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成以下类似的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 期望的 HybridWithAlpha 结果"
  endMarker="# 结束期望的 HybridWithAlpha 结果"
  language="json"
/>

</details>

## 融合（排名）方法

:::info Available from `v1.20` onwards
:::

您可以使用 `fusionType` 参数来选择如何组合BM25和向量搜索结果以确定排名。

默认值为 `rankedFusion`，它将BM25和向量搜索方法的倒排排名相加。或者，您可以使用 `relativeScoreFusion`，它将BM25和向量搜索方法的归一化分数（介于0-1之间）相加。

以下示例指定了 `relativeScoreFusion` 的融合类型。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithFusionTypePython"
  endMarker="# END HybridWithFusionTypePython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithFusionType"
  endMarker="// END searchHybridWithFusionType"
  language="ts"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithFusionTypeGraphQL"
  endMarker="# END HybridWithFusionTypeGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

应该会产生以下类似的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 期望的 HybridWithFusionType 结果"
  endMarker="# END 期望的 HybridWithFusionType 结果"
  language="json"
/>

</details>


## 仅选定的属性

您可以为搜索中的`bm25`部分指定对象`properties`。

以下示例在仅`question`属性中执行关键字`food`的`bm25`搜索，并将其与`food`的向量搜索结果相结合。

:::info Why does this not affect the vector search?
This is not possible as doing so will require the entire database to be re-vectorized and re-indexed with the new vectorization options.
:::

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithPropertiesPython"
  endMarker="# END HybridWithPropertiesPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithProperties"
  endMarker="// END searchHybridWithProperties"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithPropertiesGraphQL"
  endMarker="# END HybridWithPropertiesGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该产生类似下面的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# Expected HybridWithVector results"
  endMarker="# END Expected HybridWithVector results"
  language="json"
/>

</details>


## 使用自定义向量

您可以为混合查询提供自己的 `vector` 输入。在这种情况下，Weaviate 将使用查询字符串进行 `bm25` 搜索，并使用输入向量进行向量搜索。

下面的示例为“意大利食物”提供了向量，同时将“食物”作为查询文本。请注意，结果现在更偏向意大利食物。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithVectorPython"
  endMarker="# END HybridWithVectorPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithVector"
  endMarker="// END searchHybridWithVector"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithVectorGraphQL"
  endMarker="# END HybridWithVectorGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该产生如下所示的响应:

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 期望的 HybridWithVector 结果"
  endMarker="# END 期望的 HybridWithVector 结果"
  language="json"
/>

</details>

## 添加一个条件过滤器 (`where`)

您可以为任何混合搜索查询添加一个条件过滤器，它将过滤输出但不影响排序。

下面的示例在具有`Double Jeopardy!`的`round`属性的对象的任何字段中执行混合搜索，并返回前3个结果。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# HybridWithFilterPython"
  endMarker="# END HybridWithFilterPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker = "// searchHybridWithFilter"
endMarker = "// END searchHybridWithFilter"
language = "js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker = "# HybridWithFilterGraphQL"
  endMarker = "# END HybridWithFilterGraphQL"
  language = "graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该产生如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 期望的 HybridWithFilter 结果"
  endMarker="# END 期望的 HybridWithFilter 结果"
  language="json"
/>

</details>

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
