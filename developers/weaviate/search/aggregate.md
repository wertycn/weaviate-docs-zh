---
image: og/docs/howto.jpg
sidebar_position: 85
title: Aggregate data
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/search.aggregate.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.aggregate.ts';

## 概述

本节介绍如何使用`Aggregate`函数从结果集中检索聚合数据。`Aggregate`函数与`Get`函数在很大程度上相似，区别在于`Aggregate`函数返回的是结果集的摘要数据，而不是结果集中的单个对象。

:::info Related pages
- [API References: GraphQL: Aggregate](../api/graphql/aggregate.md)
:::

## `Aggregate`函数要求

要使用`Aggregate`函数，您必须至少指定以下内容：
- 要搜索的目标`class`，
- 一个或多个聚合属性。聚合属性可以包括：
    - `meta`属性，
    - 对象属性，或者
    - `groupBy`属性（如果使用`groupBy`）。

然后，您必须为每个选定的属性选择至少一个子属性。

请参考[`Aggregate`函数语法页面](../api/graphql/aggregate.md#aggregate-syntax-and-query-structure)了解详情。

## 获取`meta`属性

`meta`属性只有一个可用的子属性(`count`)。它返回查询匹配的对象数量。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# MetaCount Python"
    endMarker="# END MetaCount Python"
    language="py"
  />

  </TabItem>
  <TabItem value="js" label="TypeScript">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// MetaCount TS"
    endMarker="// END MetaCount TS"
    language="js"
  />

</TabItem>
<TabItem value="graphql" label="GraphQL">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# MetaCount GraphQL"
    endMarker="# END MetaCount GraphQL"
    language="graphql"
  />

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

  查询应该生成如下所示的响应:

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# MetaCount Expected Results"
    endMarker="# END MetaCount Expected Results"
    language="json"
  />
</details>

## 检索聚合对象的 `properties`

您可以检索 `text`、`number`、`int` 或 `boolean` 数据类型的聚合。

每种数据类型的[可用子类型](../api/graphql/aggregate.md#aggregate-syntax-and-query-structure)各不相同，除了`type`对所有类型都可用，以及`count`对所有类型都可用，但不适用于交叉引用。

### 使用`text`的示例

以下示例检索关于`question`属性中最常出现的示例的信息：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# TextProp Python"
    endMarker="# END TextProp Python"
    language="py"
  />

  </TabItem>
  <TabItem value="js" label="TypeScript">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// TextProp TS"
    endMarker="// END TextProp TS"
    language="js"
  />

  </TabItem>
  <TabItem value="graphql" label="GraphQL">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# TextProp GraphQL"
    endMarker="# END TextProp GraphQL"
    language="graphql"
  />

  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

  查询应该产生如下所示的响应：

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# TextProp Expected Results"
    endMarker="# END TextProp Expected Results"
    language="json"
  />
</details>

### 使用`int`的示例

以下示例检索`points`属性值的总和：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# IntProp Python"
    endMarker="# END IntProp Python"
    language="py"
  />

  </TabItem>
  <TabItem value="js" label="TypeScript">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// IntProp TS"
    endMarker="// END IntProp TS"
    language="js"
  />

  </TabItem>
  <TabItem value="graphql" label="GraphQL">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# IntProp GraphQL"
    endMarker="# END IntProp GraphQL"
    language="graphql"
  />

  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

  查询应该生成如下所示的响应：

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# IntProp Expected Results"
    endMarker="# END IntProp Expected Results"
    language="json"
  />
</details>

## 检索 `groupedBy` 属性

您可以使用`groupBy`变量将结果集分组为子集。然后，可以通过`groupedBy`属性检索每个组的分组聚合数据。

例如，要列出属性的所有不同值及其计数：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# groupBy Python"
    endMarker="# END groupBy Python"
    language="py"
  />

  </TabItem>
  <TabItem value="js" label="TypeScript">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// groupBy TS"
    endMarker="// END groupBy TS"
    language="js"
  />

</TabItem>
<TabItem value="graphql" label="GraphQL">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# groupBy GraphQL"
    endMarker="# END groupBy GraphQL"
    language="graphql"
  />

</TabItem>
</Tabs>


<details>
  <summary>示例响应</summary>

  查询应该生成类似下面的响应：

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# groupBy Expected Results"
    endMarker="# END groupBy Expected Results"
    language="json"
  />
</details>


## 使用`nearXXX`

当使用`Aggregate`与相似性搜索（例如`nearXXX`）参数（参见[similarity.md](./similarity.md)）时，您应该包含一种方法来[限制搜索结果](../api/graphql/aggregate.md#limiting-the-search-space)。这是因为向量搜索本身不会从结果集中排除任何对象 - 所有对象都与查询具有一定程度的相似性。

因此，为了使向量搜索影响`Aggregate`的输出，您**必须**在以下方面设置限制：
- 返回的结果数量（使用`limit`参数），
- 结果与查询的相似程度（使用`distance`参数）。

### 设置对象限制

您可以设置`objectLimit`参数来指定要聚合的结果的最大数量。

以下查询检索与`"animals in space"`最接近的10个`question`对象，并返回`point`属性的总和。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# nearTextWithLimit Python"
    endMarker="# END nearTextWithLimit Python"
    language="py"
  />

  </TabItem>
  <TabItem value="js" label="TypeScript">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// nearTextWithLimit TS"
    endMarker="// END nearTextWithLimit TS"
    language="js"
  />

  </TabItem>
  <TabItem value="graphql" label="GraphQL">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# nearTextWithLimit GraphQL"
    endMarker="# END nearTextWithLimit GraphQL"
    language="graphql"
  />

  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

  查询应该返回如下的响应:

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# nearTextWithLimit Expected Results"
    endMarker="# END nearTextWithLimit Expected Results"
    language="json"
  />
</details>


### 设置最大的 `distance`

您可以设置 `distance` 运算符来指定要聚合的结果的最大不相似度（即最小相似度）。

下面的查询检索与 `"animals in space"` 距离在 `0.19` 内的 10 个 `question` 对象，并返回 `point` 属性的总和。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# nearTextWithDistance Python"
    endMarker="# END nearTextWithDistance Python"
    language="py"
  />

  </TabItem>
  <TabItem value="js" label="TypeScript">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// nearTextWithDistance TS"
    endMarker="// END nearTextWithDistance TS"
    language="js"
  />

  </TabItem>
  <TabItem value="graphql" label="GraphQL">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# nearTextWithDistance GraphQL"
    endMarker="# END nearTextWithDistance GraphQL"
    language="graphql"
  />

  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

  查询应该产生以下类似的响应：

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# nearTextWithDistance 期望结果"
    endMarker="# END nearTextWithDistance 期望结果"
    language="json"
  />
</details>


## 添加条件筛选器 (`where`)

您可以将条件筛选器添加到任何聚合搜索查询中，以过滤结果集。

下面的示例搜索`round`属性等于`Double Jeopardy!`的对象，并返回对象计数。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# whereFilter Python"
    endMarker="# END whereFilter Python"
    language="py"
  />

  </TabItem>
  <TabItem value="js" label="TypeScript">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// whereFilter TS"
    endMarker="// END whereFilter TS"
    language="js"
  />

  </TabItem>
  <TabItem value="graphql" label="GraphQL">

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# whereFilter GraphQL"
    endMarker="# END whereFilter GraphQL"
    language="graphql"
  />

  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

  查询应该生成如下所示的响应：

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# whereFilter Expected Results"
    endMarker="# END whereFilter 期望结果"
    language="json"
  />

</details>


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />