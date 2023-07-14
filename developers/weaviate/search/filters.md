---
image: og/docs/howto.jpg
sidebar_position: 90
title: Filters
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/search.filters.py';
import JavaScriptCode from '!!raw-loader!/_includes/code/howto/search.filters.ts';

## 概述

本页面将向您展示如何使用`where`运算符为搜索查询添加条件筛选器。

:::info Related pages
- [API References: Filters](../api/graphql/filters.md)
:::

import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />

## 单条件筛选器

要添加筛选器，您必须为查询提供至少一个`where`条件。

以下示例指定`round`属性必须等于`"Double Jeopardy!"`。请注意，由于属性的数据类型是`text`，因此使用了`valueText`参数。

:::tip Filter arguments list
See [this page](../api/graphql/filters.md#filter-structure) for the list of available filter arguments.
:::

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleFilterPython"
  endMarker="# END SingleFilterPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={JavaScriptCode}
  startMarker="// searchSingleFilter"
  endMarker="// END searchSingleFilter"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleFilterGraphQL"
  endMarker="# END SingleFilterGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成以下类似的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# Expected SingleFilter results"
  endMarker="# END Expected SingleFilter results"
  language="json"
/>

</details>

### 使用搜索参数

条件过滤器可以与搜索参数（如`nearXXX`、`hybrid`或`bm25`）结合使用。

下面的示例将一个 `points` 过滤器添加到一个 `nearText` 查询中，其中 `points` 属性必须大于200。请注意，由于属性的数据类型是 `int`，因此使用 `valueInt`。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleFilterNearTextPython"
  endMarker="# END SingleFilterNearTextPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={JavaScriptCode}
  startMarker="// searchFilterNearText"
  endMarker="// END searchFilterNearText"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleFilterNearTextGraphQL"
  endMarker="# END SingleFilterNearTextGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该产生如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 预期的 SingleFilterNearText 结果"
  endMarker="# END 预期的 SingleFilterNearText 结果"
  language="json"
/>

</details>

### 通过部分匹配（文本）

对于 `text` 数据类型的属性，您可以使用 `Like` 运算符进行部分匹配过滤。

以下示例筛选包含文本“inter”的对象，在`answer`属性的任何部分中。

:::tip `*` vs `?`
`*` matches zero or more characters, whereas `?` matches exactly one unknown character.
:::

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# LikeFilterPython"
  endMarker="# END LikeFilterPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={JavaScriptCode}
  startMarker="// searchLikeFilter"
  endMarker="// END searchLikeFilter"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# LikeFilterGraphQL"
  endMarker="# END LikeFilterGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该产生以下类似的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# Expected LikeFilter results"
  endMarker="# END Expected LikeFilter results"
  language="json"
/>

</details>

## 多条件筛选器

要添加多条件筛选器，您必须将运算符设置为`And`或`Or`，并在相应的`operands`参数下设置两个或多个条件。

以下示例指定了一个`And`条件，使得两个条件都满足:
- `round`属性必须等于`"Double Jeopardy!"`，并且
- `points`属性必须小于600。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# MultipleFiltersAndPython"
  endMarker="# END MultipleFiltersAndPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={JavaScriptCode}
  startMarker="// searchMultipleFiltersAnd"
  endMarker="// END searchMultipleFiltersAnd"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# MultipleFiltersAndGraphQL"
  endMarker="# END MultipleFiltersAndGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该产生如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 期望的多个过滤器结果"
  endMarker="# 结束期望的多个过滤器结果"
  language="json"
/>

</details>

### 嵌套多个条件

在Weaviate中可以嵌套条件过滤器。为此，将外部`operands`的`operator`设置为`And`或`Or`。然后，您可以为内部`operands`提供两个或更多条件。

以下示例指定了：
- `answer`属性必须包含子字符串`"nest"`，`And`
- `points`属性必须大于700，`Or`，`points`属性必须小于300。

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# MultipleFiltersNestedPython"
  endMarker="# END MultipleFiltersNestedPython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={JavaScriptCode}
startMarker="// searchMultipleFiltersNested"
endMarker="// END searchMultipleFiltersNested"
language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
  <FilteredTextBlock
    text={PythonCode}
    startMarker="# MultipleFiltersNestedGraphQL"
    endMarker="# END MultipleFiltersNestedGraphQL"
    language="graphql"
  />
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下的响应:

<FilteredTextBlock
  text={PythonCode}
  startMarker="# Expected MultipleFiltersNested results"
  endMarker="# END Expected MultipleFiltersNested results"
  language="json"
/>

</details>


## 使用交叉引用进行筛选

您可以使用交叉引用对象的属性来筛选对象。

以下示例使用`JeopardyCategory`对象的属性对`JeopardyQuestion`对象进行筛选，这些属性是它们之间的交叉引用。

更具体地说，该示例通过筛选从`JeopardyQuestion`对象引用的`JeopardyCategory`对象的`title`属性来实现。`title`属性必须包含子字符串`Sport`。 

:::note Case-sensitivity
The results are case-insensitive here, as the `title` property is defined with [`word` tokenization](../config-refs/schema.md#property-tokenization).
:::

<Tabs groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# CrossReferencePython"
  endMarker="# END CrossReferencePython"
  language="python"
/>
</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={JavaScriptCode}
  startMarker="// searchSingleFilter"
  endMarker="// END searchSingleFilter"
  language="js"
/>
</TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
  text={PythonCode}
  startMarker="# CrossReferenceGraphQL"
  endMarker="# END CrossReferenceGraphQL"
  language="graphql"
/>
</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# Expected CrossReferencePython results"
  endMarker="# END Expected CrossReferencePython results"
  language="json"
/>

</details>


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
