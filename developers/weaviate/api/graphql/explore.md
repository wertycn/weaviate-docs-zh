---
image: og/docs/api.jpg
sidebar_position: 3
title: GraphQL - Explore{}
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::note Vector spaces and Expore{}

The `Explore` function is currently not available on Weaviate Cloud Services (WCS) instances, or others where it is likely that multiple vector spaces will exist.

As WCS by default enables multiple inference-API modules and therefore multiple vector spaces, `Explore` is disabled by default by Weaviate.

:::

## 探索{} 查询结构和语法

`Explore{}` 函数的定义始终基于以下原则：

```graphql
{
  Explore (
    limit: <Int>,               # The maximum amount of objects to return
    nearText: {                 # Either this or 'nearVector' is required
      concepts: [<String>]!,   # Required - An array of search items. If the text2vec-contextionary is the vectorization module, the concepts should be present in the Contextionary.
      certainty: <Float>,      # Minimal level of certainty, computed by normalized distance
      moveTo: {                # Optional - Giving directions to the search
        concepts: [<String>]!, # List of search items
        force: <Float>!        # The force to apply for a particular movement. Must be between 0 (no movement) and 1 (largest possible movement).
      },
      moveAwayFrom: {          # Optional - Giving directions to the search
        concepts: [<String>]!, # List of search items
        force: <Float>!        # The force to apply for a particular movement. Must be between 0 (no movement) and 1 (largest possible movement).
      }
    },
    nearVector: {              # Either this or 'nearText' is required
      vector: [<Float>]!,      # Required - An array of search items, which length should match the vector space
      certainty: <Float>       # Minimal level of certainty, computed by normalized distance
    }
  ) {
    beacon
    certainty                # certainty value based on a normalized distance calculation
    className
  }
}
```

一个示例查询：

import GraphQLExploreVec from '/_includes/code/graphql.explore.vector.mdx';

<GraphQLExploreVec/>

结果可能如下所示：

```json
{
  "data": {
    "Explore": [
      {
        "beacon": "weaviate://localhost/7e9b9ffe-e645-302d-9d94-517670623b35",
        "certainty": 0.975523,
        "className": "Publication"
      }
    ]
  },
  "errors": null
}
```

### 驼峰式解析

Weaviate的向量化模块`text2vec-contextionary`根据驼峰式拆分单词。例如，如果用户想要搜索iPhone（苹果设备），他们应该使用`iphone`而不是`iPhone`，因为后者将被解释为`[i, phone]`。

## 探索过滤器参数

### 概念

`Concepts` 数组中的字符串是您的模糊搜索项。必须设置一个概念数组来进行 Explore 查询，并且该数组中的所有单词都应该在 Contextionary 中存在。

在 Explore 过滤器中，有三种方式可以定义 `concepts` 数组参数。

- `["New York Times"]` = 基于单词出现的次数来确定一个向量位置
- `["New", "York", "Times"]` = 所有概念具有相似的权重。
- `["纽约", "时报"]` = 上述两者的组合。

一个实际的例子是：`concepts: ["披头士", "约翰·列侬"]`

#### 距离

您可以设置一个最大允许的`距离`，用于确定要返回的数据结果。距离字段的值的解释取决于所使用的[距离度量标准](/developers/weaviate/config-refs/distances.md)。

如果距离度量标准是`余弦`，您也可以使用`确定度`来代替。
`distance`。确定性将距离归一化到0到1的范围内，其中0表示完全相反（余弦距离为2），1表示具有相同角度的向量（余弦距离为0）。确定性不适用于非余弦距离度量。

#### 移动中

由于多维存储中无法进行分页，您可以通过使用其他探索函数来改进结果，这些函数可以远离语义概念或靠近语义概念。例如，如果您正在寻找概念“纽约时报”，但不想找到纽约这个城市，您可以使用`moveAwayFrom{}`函数，并使用词语“纽约”。这也是排除概念和处理否定（类似查询语言中的`not`运算符）的一种方式。`moveAwayFrom{}`筛选器中的概念并不是定义上被排除在结果之外，而是结果中的概念与此筛选器中的概念之间更远。

## 额外的筛选器

`Explore{}` 函数可以通过搜索筛选器进行扩展（包括语义筛选器和传统筛选器）。由于筛选器适用于多个核心函数（如 `Aggregate{}`），因此有一个[专门的文档页面专门介绍筛选器](filters.md)。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />