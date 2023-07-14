---
image: og/docs/api.jpg
sidebar_position: 5
title: GraphQL - Additional operators
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/search.similarity.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.similarity.ts';
import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

## 语法

类级别的查询可以使用额外的参数来修改，例如 `limit`、`autocut` 和 `sort`。

<!--
例如：

import GraphQLFiltersExample from '/_includes/code/graphql.filters.example.mdx';

<GraphQLFiltersExample/> 
-->

## Limit 参数

`Get{}`、`Explore{}` 和 `Aggregate{}` 函数支持 `limit` 参数。

`limit` 参数可以限制结果的数量为指定的正整数：

import GraphQLFiltersLimit from '/_includes/code/graphql.filters.limit.mdx';

<GraphQLFiltersLimit/>

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Backs on the rack - Vast sums are wasted on treatments for back pain that make it worse"
        },
        {
          "title": "Graham calls for swift end to impeachment trial, warns Dems against calling witnesses"
        },
        {
          "title": "Through a cloud, brightly - Obituary: Paul Volcker died on December 8th"
        },
        {
          "title": "Google Stadia Reviewed \u2013 Against The Stream"
        },
        {
          "title": "Managing Supply Chain Risk"
        }
      ]
    }
  }
}
```

</details>

## 使用 `offset` 进行分页

`Get{}` 和 `Explore{}` 函数支持 `offset` 参数。

`offset` 参数与现有的 `limit` 参数配合使用。例如，要列出前十个结果，设置 `limit: 10`。然后，要"显示第二页的十个结果"，设置 `offset: 10`，`limit: 10`，依此类推。例如，要显示第9页的10个结果，设置 `offset: 80, limit: 10`，以有效地显示结果81-90。

以下是 `limit` + `offset` 的示例：

import GraphQLFiltersOffset from '/_includes/code/graphql.filters.offset.mdx';

<GraphQLFiltersOffset/>

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Through a cloud, brightly - Obituary: Paul Volcker died on December 8th"
        },
        {
          "title": "Google Stadia Reviewed \u2013 Against The Stream"
        },
        {
          "title": "Managing Supply Chain Risk"
        },
        {
          "title": "Playing College Football In Madden"
        },
        {
          "title": "The 50 best albums of 2019, No 3: Billie Eilish \u2013 When We All Fall Asleep, Where Do We Go?"
        }
      ]
    }
  }
}
```

</details>

### 性能和资源考虑以及限制

分页实现是基于偏移量的实现，而不是基于游标的实现。这有以下几个影响：

- 获取下一页的成本比上一页的成本要高。实际上，在搜索结果91-100时，Weaviate会在内部检索100个搜索结果，并在向用户提供结果之前丢弃0-90的结果。如果在多分片设置下运行，这种效果会被放大，每个分片都会检索100个结果，然后对结果进行聚合并最终截断。因此，在一个10个分片的设置中，请求结果91-100的Weaviate实际上需要检索1000个结果（每个分片100个），并且在提供之前丢弃990个结果。这意味着，较高的页码会导致较长的响应时间和更多的负载对机器/集群的负荷。
- 由于上述每页成本的增加，使用分页检索对象的数量是有限制的。默认情况下，将`offset`和`limit`的总和设置为超过10,000个对象将导致错误。如果您需要检索超过10,000个对象，可以通过设置环境变量`QUERY_MAXIMUM_RESULTS=<desired-value>`来增加此限制。警告：将此值设置为任意高值可能会导致单个查询的内存消耗急剧增加，而单个查询可能会减慢整个集群的速度。我们建议将此值设置为最低可能值，以不影响用户期望的情况下进行设置。
- 分页设置不具备状态性。如果在检索两个页面之间数据库状态发生了变化，那么不能保证您的页面包含所有结果。如果没有进行写操作，则可以使用分页来检索最大限制内的所有可能结果。这意味着请求10,000个对象的单个页面的结果与请求100个结果的100个页面的结果是相同的。

## 自动截断

从Weaviate `v1.20`版本开始，可以在通过`nearXXX`、`bm25`和`hybrid`操作符检索的类对象中添加`autocut`过滤器作为参数。 `autocut: <N>`，其中N是大于0的整数，限制了结果的数量，只返回到查询中距离/分数的第N个“跳跃”/“丢弃”的对象。例如，如果通过`nearText`返回的六个对象的距离是`[0.1899, 0.1901, 0.191, 0.21, 0.215, 0.23]`，那么`autocut: 1`将返回前三个对象，`autocut: 2`将返回除最后一个对象以外的所有对象，而`autocut: 3`将返回所有对象。默认情况下，禁用了Autocut，并且可以通过将其值设置为`0`或负数来明确禁用它。

如果将`autocut`与`limit: N`结合使用，那么`autocut`的输入将被限制为前`N`个对象。

<!-- TODO: Update with link to blog:
For more `autocut` examples and to learn about the motivation behind this filter, see the [v1.20 release blog post](/blog). -->

可以按以下方式使用`autocut`：

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
      startMarker="# START Autocut GraphQL"
      endMarker="# END Autocut GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成以下类似的响应:

<FilteredTextBlock
  text={PythonCode}
  startMarker="# START Expected nearText results"
  endMarker="# END Expected nearText results"
  language="json"
/>

</details>

对于每个操作符类别的更多客户端代码示例，请参阅[相似性搜索的自动切割](../../search/similarity.md#autocut)，[使用`bm25`的自动切割](../../search/bm25.md#autocut)和[使用`hybrid`的自动切割](../../search/hybrid.md#autocut)。

## 使用`after`进行游标操作

从版本`v1.18`开始，可以使用`after`参数按顺序从Weaviate中检索类对象。这对于从Weaviate中检索整个对象集合可能很有用，例如。

`after`参数依赖于ID的顺序。因此，它只能应用于没有任何搜索运算符的列表查询。换句话说，`after`与`where`、`near<Media>`、`bm25`、`hybrid`等不兼容。

对于这些情况，请使用带有`offset`的分页。

下面是`after`参数的使用示例：

import GraphQLFiltersAfter from '/_includes/code/graphql.filters.after.mdx';

<GraphQLFiltersAfter/>

<details>
  <summary>预期的响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "id": "00313a4c-4308-30b0-af4a-01773ad1752b"
          },
          "title": "Managing Supply Chain Risk"
        },
        {
          "_additional": {
            "id": "0042b9d0-20e4-334e-8f42-f297c150e8df"
          },
          "title": "Playing College Football In Madden"
        },
        {
          "_additional": {
            "id": "0047c049-cdd6-3f6e-bb89-84ae20b74f49"
          },
          "title": "The 50 best albums of 2019, No 3: Billie Eilish \u2013 When We All Fall Asleep, Where Do We Go?"
        },
        {
          "_additional": {
            "id": "00582185-cbf4-3cd6-8c59-c2d6ec979282"
          },
          "title": "How artificial intelligence is transforming the global battle against human trafficking"
        },
        {
          "_additional": {
            "id": "0061592e-b776-33f9-8109-88a5bd41df78"
          },
          "title": "Masculine, feminist or neutral? The language battle that has split Spain"
        }
      ]
    }
  }
}
```

</details>

:::note
The `after` cursor is available on both single-shard and multi-shard set-ups.
:::


## 排序

:::info
Support for sorting was added in `v1.13.0`.
:::

您可以按任何基本属性对结果进行排序，通常是`text`、`string`、`number`或`int`属性。当查询具有自然顺序时（例如，由于`near<Media>`向量搜索），添加排序运算符将覆盖该顺序。

### 排序的成本 / 架构

Weaviate的排序实现方式不会导致内存占用过大；它不需要完全将所有待排序的对象加载到内存中。只有被排序的属性值被保留在内存中。

截至目前，Weaviate在磁盘上没有针对排序的特定数据结构，例如列式存储机制。因此，当一个对象需要排序时，整个对象会被在磁盘上进行识别，并提取相关属性。这在小规模的情况下效果还不错（数十万或数百万），但在需要对大量对象进行排序（数亿）时，代价非常高。未来可能会引入列式存储机制，以克服这种性能限制。

### 排序决策

#### 布尔值排序
`false` 被认为比 `true` 小。在升序中，`false` 排在 `true` 之前，在降序中排在 `true` 之后。

#### 空值排序
`null` 值被认为比任何非 `null` 值小。在升序中，`null` 值排在最前面，在降序中排在最后面。

#### 数组排序
数组通过逐个元素进行比较。同一位置上的元素相互比较，从数组的开头开始。第一个元素小于其对应元素会使整个数组变小。

如果两个数组大小相同且所有元素都相等，则认为它们相等。如果一个数组是另一个数组的子集，则认为它比较小。

示例：
- `[1, 2, 3] = [1, 2, 3]`
- `[1, 2, 4] < [1, 3, 4]`
- `[2, 2] > [1, 2, 3, 4]`
- `[1, 2, 3] < [1, 2, 3, 4]`

### 排序 API

import GraphQLGetSorting from '/_includes/code/graphql.get.sorting.mdx';

### 附加属性

有时需要按照其他属性进行排序，例如 `id`、`creationTimeUnix` 或 `lastUpdateTimeUnix`。可以通过在属性名前加下划线来实现这一点。

例如：
```graphql
{
  Get {
    Article(sort: [{path: ["_creationTimeUnix"], order: asc}]) {
      title
    }
  }
}
```

<GraphQLGetSorting/>

<details>
  <summary>期望的响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "#DesignforATL: This Instagram Fundraiser Is Raffling Off Home Goods to Help the Atlanta Spa Shooting\u2019s Victims and Families",
          "url": "https://www.vogue.com/article/designforatl-instagram-fundraiser",
          "wordCount": 366
        },
        {
          "title": "$400 for a Five Guys meal? Welcome to New Year's Eve in Dubai",
          "url": "https://edition.cnn.com/travel/article/new-year-eve-dubai-most-expensive-restaurants/index.html",
          "wordCount": 1203
        },
        ...
      ]
    }
  }
}
```

</details>

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />