---
image: og/docs/api.jpg
sidebar_position: 2
title: GraphQL - Aggregate{}
---

import Badges from '/_includes/badges.mdx';

<Badges/>

import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

## Aggregate{} 语法和查询结构

该示例展示了如何对整个数据库进行聚合。在下面的部分中，您将找到使用向量搜索动态检索对象并仅聚合匹配项的示例。`Aggregate{}`函数的结构如下：

```graphql
{
  Aggregate {
    <Class> (groupBy:[<property>]) {
      groupedBy { # requires `groupBy` filter
          path
          value
      }
      meta {
        count
      }
      <propertyOfDatatypeString> {
          count
          type
          topOccurrences {
              value
              occurs
          }
      }
      <propertyOfDatatypeText> {
          count
          type
          topOccurrences {
              value
              occurs
          }
      }
      <propertyOfDatatypeNumberOrInteger> {
          count
          type
          minimum
          maximum
          mean
          median
          mode
          sum
      }
      <propertyOfDatatypeBoolean> {
          count
          type
          totalTrue
          totalFalse
          percentageTrue
          percentageFalse
      }
      <propertyWithReference>
        pointingTo
        type
    }
  }
}
```

以下是一个示例查询，用于获取关于`Article`类中数据的元信息。请注意，数据尚未分组，元信息是关于所有在`Article`类中找到的数据对象的。

import GraphQLAggregateSimple from '/_includes/code/graphql.aggregate.simple.mdx';

<GraphQLAggregateSimple/>

上述查询将得到类似以下的结果：

```json
{
  "data": {
    "Aggregate": {
      "Article": [
        {
          "inPublication": {
            "pointingTo": [
              "Publication"
            ],
            "type": "cref"
          },
          "meta": {
            "count": 4403
          },
          "wordCount": {
            "count": 4403,
            "maximum": 16852,
            "mean": 966.0113558937088,
            "median": 680,
            "minimum": 109,
            "mode": 575,
            "sum": 4253348,
            "type": "int"
          }
        }
      ]
    }
  }
}
```

import HowToGetObjectCount from '/_includes/how.to.get.object.count.mdx';

:::tip `meta { count }` will return the query object count
As such, this `Aggregate` query will retrieve the total object count in a class.

<HowToGetObjectCount/>
:::

### groupBy参数

您可以使用groupBy参数来获取关于数据对象组的元信息。

对于Aggregate{}函数，groupBy参数的结构如下所示：

```graphql
{
  Aggregate {
    <Class> ( groupBy: ["<propertyName>"] ) {
      groupedBy {
          path
          value
      }
      meta {
        count
      }
      <propertyName> {
        count
      }
    }
  }
}
```

在下面的示例中，文章根据`inPublication`属性进行分组，该属性指示文章的发布者。

import GraphQLAggGroupby from '/_includes/code/graphql.aggregate.groupby.mdx';

<GraphQLAggGroupby/>

<details>
  <summary>预期的响应</summary>

```json
{
  "data": {
    "Aggregate": {
      "Article": [
        {
          "groupedBy": {
            "path": [
              "inPublication"
            ],
            "value": "weaviate://localhost/Publication/16476dca-59ce-395e-b896-050080120cd4"
          },
          "meta": {
            "count": 829
          },
          "wordCount": {
            "mean": 604.6537997587454
          }
        },
        {
          "groupedBy": {
            "path": [
              "inPublication"
            ],
            "value": "weaviate://localhost/Publication/c9a0e53b-93fe-38df-a6ea-4c8ff4501783"
          },
          "meta": {
            "count": 618
          },
          "wordCount": {
            "mean": 917.1860841423949
          }
        },
        ...
      ]
    }
  }
}
```

</details>

### 附加筛选器

`Aggregate{}`函数可以通过搜索筛选器进行扩展。由于这些筛选器适用于多个核心函数（如`Get{}`），因此有一个专门的文档页面专门介绍筛选器(filters.md)。

### `topOccurrences`属性

聚合数据使得`topOccurrences`子属性可用。请注意，计数不依赖于分词。`topOccurrences`计数是基于整个属性或者属性为数组时的某个值的出现次数。

### 多租户

:::info Available from `v1.20` onwards
:::

在配置了多租户的情况下，可以配置`Aggregate{}`函数来聚合特定租户的结果。

您可以通过在GraphQL查询中指定`tenant`参数，如下所示，或使用等效的客户端函数来实现。

```graphql
{
  Aggregate {
    Article (
      tenant: "tenantA"
    ) {
      meta {
        count
      }
    }
  }
}
```

:::tip See HOW-TO guide
For more information on using multi-tenancy, see the [Multi-tenancy operations guide](../../manage-data/multi-tenancy.md).
:::

## 聚合向量搜索 / 分面向量搜索

:::note
This feature was added in `v1.13.0`
:::

您可以将向量搜索（例如`nearObject`，`nearVector`，`nearText`，`nearImage`等）与聚合操作结合使用。在内部，这是一个两步过程，其中向量搜索首先找到所需的对象，然后将结果进行聚合。

### 限制搜索空间

矢量搜索与基于关键字的搜索不同，它们不会过滤结果集，只是以不同的顺序返回对象。想象一下，有1,000个对象和一个矢量搜索的查询向量为`"apple iphone"`。如果没有明确的限制，数据库中的每个对象都有可能是一个潜在的匹配项。一些匹配项可能会有很高的分数（确定性），而最后的匹配项很可能会有很低的分数。但是，所有1,000个对象都有可能被评分。这种搜索的价值在于顺序。如果我们只看前10个结果，它们将与查询向量非常相关。同样地，列表中的最后10个对象将是非常不相关的。然而，在聚合中无法看到顺序。

因此，每当目标是聚合向量搜索结果时，需要有一些限制搜索空间的方法。否则，聚合结果（针对所有匹配项）将与没有任何额外`near<Media>`参数的聚合结果完全相同。

您可以通过两种不同的方式实现对搜索空间的限制：

* 设置一个明确的`objectLimit`，例如`objectLimit: 100`。这告诉Weaviate检索与您的向量搜索查询相关的前100个对象，然后对它们进行聚合。*当您事先知道要提供多少结果时，这是非常有用的，例如在推荐场景中，您想要生成100个推荐。*

* 设置一个明确的`certainty`，例如 `certainty: 0.7`。这告诉Weaviate检索所有可能匹配的对象，其确信度为0.7或更高。该列表没有固定的长度，它取决于有多少对象是良好的匹配。*这在用户界面的搜索场景中非常有用，比如电子商务。用户可能对与“苹果手机”在语义上相似的所有搜索结果感兴趣，然后生成分面。*

如果既没有设置`objectLimit`，也没有设置`certainty`，则查询将出错。

### API

以下是`nearObject`，`nearVector`和`nearText`的示例。
任何`near<Media>`都可以使用。

#### nearObject

import GraphQLAggNearObject from '/_includes/code/graphql.aggregate.nearObject.mdx';

<GraphQLAggNearObject/>

#### nearVector

:::tip Replace placeholder vector
To run this query, replace the placeholder vector with a real vector from the same vectorizer that used to generate object vectors.
:::

import GraphQLAggNearVector from '/_includes/code/graphql.aggregate.nearVector.mdx';

<GraphQLAggNearVector/>

#### nearText

:::note
For `nearText` to be available, a `text2vec-*` module must be installed with Weaviate.
:::

import GraphQLAggNearText from '/_includes/code/graphql.aggregate.nearText.mdx';

<GraphQLAggNearText/>

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />