---
image: og/docs/api.jpg
sidebar_position: 4
title: GraphQL - Conditional filters
---

import Badges from '/_includes/badges.mdx';

<Badges/>

import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

## 概述

在类级别的查询中可以添加条件筛选器。用于筛选的运算符也被称为 `where` 筛选器。
<!--
import GraphQLFiltersExample from '/_includes/code/graphql.filters.example.mdx';

<GraphQLFiltersExample/> -->

:::info Related pages
- [How-to search: Filters](../../search/filters.md)
:::

## 单个操作数（条件）

每组代数条件被称为一个“操作数”。对于每个操作数，需要的属性有：
- GraphQL属性路径，
- 操作符类型，以及
- 值类型和值。

例如，此过滤器只允许来自`Article`类且`wordCount`大于`1000`的对象。

import GraphQLFiltersWhereSimple from '/_includes/code/graphql.filters.where.simple.mdx';

<GraphQLFiltersWhereSimple/>

<details>
  <summary>期望的响应</summary>

```
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Anywhere but Washington: an eye-opening journey in a deeply divided nation"
        },
        {
          "title": "The world is still struggling to implement meaningful climate policy"
        },
        ...
      ]
    }
  }
}
```

</details>

## 过滤器结构

由[`Get{}`](./get.md)和[`Aggregate{}`](./aggregate.md)函数支持。

`where`过滤器是一个[代数对象](https://en.wikipedia.org/wiki/Algebraic_structure)，它接受以下参数：

- `Operator`（取以下值之一）
  - `And`
  - `Or`
  - `Equal`
  - `NotEqual`
  - `GreaterThan`
  - `GreaterThanEqual`
  - `LessThan`
  - `LessThanEqual`
  - `Like`
  - `WithinGeoRange`
  - `IsNull`
- `操作数`：是一个由相同结构的`Operator`对象组成的列表，只在父`Operator`设置为`And`或`Or`时使用。
- `路径`：是一个以[XPath](https://en.wikipedia.org/wiki/XPath#Abbreviated_syntax)风格表示的字符串列表，表示类的属性名称。
  如果属性是一个信标（即交叉引用），则应按照路径到达信标的属性，该属性应被指定为字符串列表。对于如下的架构结构：
 ```json
 {
   "inPublication": {
     "Publication": {
       "name": "Wired"
     }
   }
 }
 ```
 这里，`name` 的路径选择器将是 `["inPublication", "Publication", "name"]`。

- `valueType`

### 示例过滤器结构

```graphql
{
  Get {
    <Class>(where: {
        operator: <operator>,
        operands: [{
          path: [path],
          operator: <operator>
          <valueType>: <value>
        }, {
          path: [<matchPath>],
          operator: <operator>,
          <valueType>: <value>
        }]
      }) {
      <propertyWithBeacon> {
        <property>
        ... on <ClassOfWhereBeaconGoesTo> {
          <propertyOfClass>
        }
      }
    }
  }
}
```

### 可用的 `valueType` 值

- `valueInt`: 应该与 `Path` 选择器中的最后一个属性进行比较的整数值。
- `valueBoolean`: 应该与 `Path` 中的最后一个属性进行比较的布尔值。
- `valueString`: 应该与 `Path` 中的最后一个属性进行比较的字符串值。（注意：`string` 已被弃用。）
- `valueText`: 应该与 `Path` 中的最后一个属性进行比较的文本值。
- `valueNumber`: 应与`Path`中的最后一个属性进行比较的数字（浮点数）值。
- `valueDate`: 应与`Path`中的最后一个属性进行比较的日期（ISO 8601时间戳，格式为[RFC3339](https://datatracker.ietf.org/doc/rfc3339/)）值。

### `Equal`运算符在多词文本属性中的过滤行为

在`where`过滤器中，`Equal`运算符对多词文本属性的行为取决于属性的`tokenization`。

请查看[架构属性标记化部分](../../config-refs/schema.md#property-tokenization)以了解可用的标记化类型之间的区别。

### `text`/`string`过滤器值中的停用词

从`v1.12.0`开始，您可以为倒排索引配置自己的[停用词列表](/developers/weaviate/config-refs/schema.md#invertedindexconfig--stopwords-stopword-lists)。

### 示例响应

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Opinion | John Lennon Told Them ‘Girls Don't Play Guitar.' He Was So Wrong."
        }
      ]
    }
  },
  "errors": null
}
```

## 通过id筛选

您可以通过对象的唯一id或uuid进行筛选，其中将`id`作为`valueText`提供。

import GraphQLFiltersWhereId from '/_includes/code/graphql.filters.where.id.mdx';

<GraphQLFiltersWhereId/>

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Backs on the rack - Vast sums are wasted on treatments for back pain that make it worse"
        }
      ]
    }
  }
}
```

</details>

## 按时间戳过滤

也可以使用内部时间戳进行过滤，例如`creationTimeUnix`和`lastUpdateTimeUnix`。这些值可以表示为Unix纪元毫秒或[RFC3339](https://datatracker.ietf.org/doc/rfc3339/)格式的日期时间。请注意，纪元毫秒应该作为`valueText`传入，而RFC3339日期时间应该作为`valueDate`传入。

:::info
Filtering by timestamp requires the target class to be configured to index  timestamps. See [here](/developers/weaviate/config-refs/schema.md#invertedindexconfig--indextimestamps) for details.
:::

import GraphQLFiltersWhereTimestamps from '/_includes/code/graphql.filters.where.timestamps.mdx';

<GraphQLFiltersWhereTimestamps />

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Army builds new body armor 14-times stronger in the face of enemy fire"
        },
        ...
      ]
    }
  }
}
```

</details>

## 根据属性长度进行筛选

可以通过属性的长度进行筛选。

属性的长度计算方式取决于类型：
- 数组类型：使用数组中的条目数量，其中 null（属性不存在）和空数组都具有长度为 0 的特性。
- 字符串和文本：字符的数量（如世界中的世视为一个字符）。
- 数字、布尔值、地理坐标、电话号码和数据 blob 不支持筛选。

```graphql
{
  Get {
    <Class>(where: {
        operator: <Operator>,
        valueInt: <value>
        path: [len(<property>)]
  }
}
```
支持的运算符是`(不)等于`和`大于/小于（等于）`，值需要为0或更大。

:::note
Filtering by property length requires the target class to be [configured to index the length](/developers/weaviate/config-refs/schema.md#invertedindexconfig--indexpropertylength).
:::


## 多个操作数

您可以通过提供一个数组来设置多个操作数，并且您还可以[嵌套条件](../../search/filters.md#nested-multiple-conditions)。

例如，这些筛选器根据文章类选择单词数大于1000且在2020年1月1日之前发布的文章。

:::tip
You can filter datetimes similarly to numbers, with the `valueDate` given as `string` in [RFC3339](https://datatracker.ietf.org/doc/rfc3339/) format.
:::

import GraphQLFiltersWhereOperands from '/_includes/code/graphql.filters.where.operands.mdx';

<GraphQLFiltersWhereOperands />

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "China\u2019s long-distance lorry drivers are unsung heroes of its economy"
        },
        {
          "title": "\u2018It\u2019s as if there\u2019s no Covid\u2019: Nepal defies pandemic amid a broken economy"
        },
        {
          "title": "A tax hike threatens the health of Japan\u2019s economy"
        }
      ]
    }
  }
}
```

</details>

## Like 操作符

使用 `Like` 操作符可以根据部分匹配进行字符串搜索。该操作符的功能如下：

- `?` -> 代表一个未知字符
  - `car?` 匹配 `cart`、`care`，但不匹配 `car`
- `*` -> 代表零个或多个未知字符
  - `car*` 匹配 `car`、`care`、`carpet` 等
  - `*car*` 匹配 `car`、`healthcare` 等

import GraphQLFiltersWhereLike from '/_includes/code/graphql.filters.where.like.mdx';

<GraphQLFiltersWhereLike/>

### 注意事项
使用`Like`操作符的每个查询都会遍历该属性的整个倒排索引。搜索时间会随着数据集大小的增加而线性增加。请注意，可能会达到一个查询过于昂贵而无法再使用的点。我们将在未来的版本中改进这个实现。您可以在[GitHub问题](https://github.com/weaviate/weaviate/issues)中提供反馈或功能请求。

<details>
  <summary>预期回应</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "name": "The New York Times Company"
        },
        {
          "name": "International New York Times"
        },
        {
          "name": "New York Times"
        },
        {
          "name": "New Yorker"
        }
      ]
    }
  }
}
```

</details>

## Beacon（参考）筛选器

您还可以根据信标的属性值进行搜索。

例如，这些筛选器根据类别为Article，但`inPublication`设置为New Yorker进行选择。

import GraphQLFiltersWhereBeacon from '/_includes/code/graphql.filters.where.beacon.mdx';

<GraphQLFiltersWhereBeacon/>

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "inPublication": [
            {
              "name": "New Yorker"
            }
          ],
          "title": "The Hidden Costs of Automated Thinking"
        },
        {
          "inPublication": [
            {
              "name": "New Yorker"
            }
          ],
          "title": "The Real Deal Behind the U.S.\u2013Iran Prisoner Swap"
        },
        ...
      ]
    }
  }
}
```

</details>

## 按引用计数筛选对象

上面的示例展示了如何通过引用来解决简单的问题，比如“找到所有由New Yorker出版的文章”。但是像“找到所有由至少写了两篇文章的作者写的文章”这样的问题，无法通过上述查询结构来回答。然而，可以通过引用计数进行筛选。只需提供其中一个现有的比较运算符（`Equal`、`LessThan`、`LessThanEqual`、`GreaterThan`、`GreaterThanEqual`）并直接在引用元素上使用它。例如：

import GraphQLFiltersWhereBeaconCount from '/_includes/code/graphql.filters.where.beacon.count.mdx';

<GraphQLFiltersWhereBeaconCount/>

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Author": [
        {
          "name": "Agam Shah",
          "writesFor": [
            {
              "name": "Wall Street Journal"
            },
            {
              "name": "Wall Street Journal"
            }
          ]
        },
        {
          "name": "Costas Paris",
          "writesFor": [
            {
              "name": "Wall Street Journal"
            },
            {
              "name": "Wall Street Journal"
            }
          ]
        },
        ...
      ]
    }
  }
}
```

</details>

## GeoCoordinates过滤器

`Where`过滤器的一个特殊情况是使用`geoCoordinates`。此过滤器仅由`Get{}`函数支持。如果您设置了`geoCoordinates`属性类型，您可以根据千米在一个区域内进行搜索。

例如，以下示例返回特定地理位置周围2公里范围内的所有内容：

import GraphQLFiltersWhereGeocoords from '/_includes/code/graphql.filters.where.geocoordinates.mdx';

<GraphQLFiltersWhereGeocoords/>

<details>
  <summary>预期的响应</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "headquartersGeoLocation": {
            "latitude": 51.512737,
            "longitude": -0.0962234
          },
          "name": "Financial Times"
        },
        {
          "headquartersGeoLocation": {
            "latitude": 51.512737,
            "longitude": -0.0962234
          },
          "name": "International New York Times"
        }
      ]
    }
  }
}
```

</details>

## 按空状态过滤

使用`IsNull`操作符可以根据对象的属性是否为`null`进行过滤。请注意，长度为零的数组和空字符串等同于`null`值。

```graphql
{
  Get {
    <Class>(where: {
        operator: IsNull,
        valueBoolean: <true/false>
        path: [<property>]
  }
}
```

:::note
Filtering by null-state requires the target class to be configured to index this. See [here](../../config-refs/schema.md#invertedindexconfig--indexnullstate) for details.
:::

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />