---
image: og/docs/howto.jpg
sidebar_position: 10
title: Search basics
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/search.basics.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.basics.ts';

## 概述

本节包括使用`Get`函数执行搜索和检索对象的基本知识。

:::info Related pages
- [API References: GraphQL: Get](../api/graphql/get.md)
:::

## `Get`函数要求

要从Weaviate检索对象，您必须使用[`Get`函数](../api/graphql/get.md)，并至少指定以下内容：
- 要搜索的目标`class`，
- 以及要检索的一个或多个`properties`。

## 简单的`Get`示例

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# BasicGetPython"
  endMarker="# END BasicGetPython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// BasicGetJS"
  endMarker="// END BasicGetJS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# BasicGetGraphQL"
  endMarker="# END BasicGetGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成一个类似下面的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="// BasicGet Expected Results"
  endMarker="// END BasicGet Expected Results"
  language="json"
/>

</details>

:::tip `objects` endpoint != search
The [`objects` endpoint](../api/rest/objects.md) in Weaviate is designed for CRUD operations and is not capable of performing searches.
:::

## `limit`返回的对象

通常，您只希望从查询中获取前`n`个结果。可以通过设置`limit`来实现，如下所示。

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithLimitPython"
  endMarker="# END GetWithLimitPython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithLimitJS"
  endMarker="// END GetWithLimitJS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithLimitGraphQL"
  endMarker="# END GetWithLimitGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="// GetWithLimit Expected Results"
  endMarker="// END GetWithLimit Expected Results"
  language="json"
/>

</details>


## 使用 `limit` 和 `offset` 进行分页

如果您只想获取查询结果中第 `m` 个之后的 `n` 个结果，可以使用 `limit` 和 `offset`，如下所示。

请注意，尽管您只会看到 `n` 个结果，但随着 `m` 的增大，这可能会变得更加昂贵，因为 Weaviate 必须获取 `n+m` 个结果。

:::tip For exhaustive retrieval, use `after` instead.
If you want to list and retrieve all objects from a `class`, use the cursor API instead with the `after` parameter. Read [this guide](../manage-data/read-all-objects.mdx) for more information on how.
:::

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# 获取具有限制偏移的Python"
  endMarker="# 结束 获取具有限制偏移的Python"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// 获取具有限制偏移的JS"
  endMarker="// 结束 获取具有限制偏移的JS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithLimitOffsetGraphQL"
  endMarker="# END GetWithLimitOffsetGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="// GetWithLimitOffset Expected Results"
  endMarker="// END GetWithLimitOffset Expected Results"
  language="json"
/>

</details>


## 指定获取的属性

您可以指定要获取的属性，只要指定一个或多个即可。

### 对象 `properties`

您可以按如下方式指定对象属性。

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetPropertiesPython"
  endMarker="# END GetPropertiesPython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetPropertiesJS"
  endMarker="// END GetPropertiesJS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetPropertiesGraphQL"
  endMarker="# END GetPropertiesGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="// GetProperties Expected Results"
  endMarker="// END GetProperties Expected Results"
  language="json"
/>

</details>

### 检索对象`vector`

要检索对象的向量，请求 `_additional` 属性和 `vector` 子属性。您可以按照下面的示例进行操作。

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetObjectVectorPython"
  endMarker="# END GetObjectVectorPython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetObjectVectorJS"
  endMarker="// END GetObjectVectorJS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetObjectVectorGraphQL"
  endMarker="# END GetObjectVectorGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该会生成以下类似的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="// GetObjectVector Expected Results"
  endMarker="// END GetObjectVector Expected Results"
  language="json"
/>

</details>

### 检索对象的`id`

要检索对象的ID，请请求`_additional`属性和`id`子属性。可以按照以下示例进行操作。

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetObjectIdPython"
  endMarker="# END GetObjectIdPython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetObjectIdJS"
  endMarker="// END GetObjectIdJS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetObjectIdGraphQL"
  endMarker="# END GetObjectIdGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成类似下面的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="// GetObjectId Expected Results"
  endMarker="// END GetObjectId Expected Results"
  language="json"
/>

</details>


### 检索交叉引用的属性

您可以通过指定以下内容来检索交叉引用对象的任何属性：
- 交叉引用属性，
- 目标交叉引用对象的类，以及
- 要检索的期望属性（交叉引用对象的属性）。

下面的示例中，对于每个`JeopardyQuestion`对象，检索交叉引用的`JeopardyCategory`对象，并返回`JeopardyCategory`对象的`title`属性。使用[内联片段](http://spec.graphql.org/June2018/#sec-Inline-Fragments) GraphQL语法访问属性。

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithCrossRefsPython"
  endMarker="# END GetWithCrossRefsPython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithCrossRefs"
  endMarker="// END GetWithCrossRefs"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithCrossRefsGraphQL"
  endMarker="# END GetWithCrossRefsGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成以下类似的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GetWithCrossRefs Expected Results"
  endMarker="# END GetWithCrossRefs Expected Results"
  language="json"
/>

</details>

## 多租户

对于启用了[multi-tenancy](../concepts/data.md#multi-tenancy)的类，您必须在每个查询中指定租户参数。

以下示例展示了如何从租户`tenantA`中的`MultiTenancyClass`类中获取一个对象：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  ```python
  results = (
      client.query.get("MultiTenancyClass", ["property1", "property2"])
      .with_limit(1)
      # highlight-start
      .with_tenant("tenantA")
      # highlight-end
      .do()
  )
  ```

  </TabItem>
  <TabItem value="js" label="TypeScript">

  ```ts
  result = await client
    .graphql
    .get()
    .withClassName('MultiTenancyClass')
    .withFields(['property1', 'property2'])
    .withTenant('TenantA')
    .do();

console.log(JSON.stringify(result, null, 2));
```

</TabItem>
</Tabs>

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />