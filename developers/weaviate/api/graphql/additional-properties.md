---
image: og/docs/api.jpg
sidebar_position: 9
title: GraphQL - Additional properties
---

import Badges from '/_includes/badges.mdx';

<Badges/>

import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

## 介绍

GraphQL的附加属性可以在Get{}查询中用于获取返回的数据对象的附加信息。可用的附加属性取决于连接到Weaviate的模块。从Weaviate Core中可以获取`id`、`vector`、`certainty`、`featureProjection`和`classification`字段。对于嵌套的GraphQL字段（引用到其他数据类），只能返回`id`。有关特定附加属性的说明可以在模块页面找到，例如[`text2vec-contextionary`](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md#additional-graphql-api-properties)。

## 示例

一个获取[UUID](#id)和[距离](#distance)的示例查询。

import GraphQLUnderscoreDistance from '/_includes/code/graphql.underscoreproperties.distance.mdx';

<GraphQLUnderscoreDistance/>

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "distance": 0.15422738,
            "id": "e76ec9ae-1b84-3995-939a-1365b2215312"
          },
          "title": "How to Dress Up For an Untraditional Holiday Season"
        },
        {
          "_additional": {
            "distance": 0.15683109,
            "id": "a2d51619-dd22-337a-8950-e1a407dab3d2"
          },
          "title": "2020's biggest fashion trends reflect a world in crisis"
        },
        ...
      ]
    }
  }
}
```

</details>

## _additional属性

所有额外的属性都可以在保留的`_additional{}`属性中设置。

例如：

```graphql
{
  Get {
    Class {
      property
      _additional {
        # property 1
        # property 2
        # etc...
      }
    }
  }
}
```

### id

`id`字段包含数据对象的唯一[UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)。

```graphql
{
  Get {
    Class {
      property
      _additional {
        id
      }
    }
  }
}
```

### 向量

`vector`字段包含数据对象的向量表示。

```graphql
{
  Get {
    Class {
      property
      _additional {
        vector
      }
    }
  }
}
```


### 生成

:::info Requires a [`generative-xxx` module](../../modules/reader-generator-modules/index.md)
:::

`generate`字段可以用于执行[生成式搜索](../../search/generative.md)。

```graphql
{
  Get {
    Class {
      property
      _additional {
        generate(
          singleResult: {
            prompt: """
            LLM Prompt:

            {property_a} - {property_b}
            """
          }
        ) {
          singleResult
          error
        }
      }
    }
  }
}
```


### 重新排序

:::info Requires a [`reranker-xxx` module](../../modules/retriever-vectorizer-modules/index.md)
:::

`rerank`字段可以用于[重新排序搜索结果](../../search/rerank.md)。它接受两个参数：

| 参数         | 必填     | 类型       | 描述         |
|--------------|----------|------------|--------------|
| `property`   | 是       | `string`   | 传递给重新排序器的属性。例如，您可能希望在产品集合上运行相似性搜索，然后在名称字段上进行重新排序。 |
| `query`      | no       | `string`    | 可选地指定一个不同的查询。 |

语法:

```graphql
{
  Get {
    Class {
      property
      _additional {
        rerank(
          property: "..."
          query: "..."
        ) {
          score
        }
      }
    }
  }
}
```

### creationTimeUnix

`creationTimeUnix`字段是数据对象创建的时间戳。

```graphql
{
  Get {
    Class {
      property
      _additional {
        creationTimeUnix
      }
    }
  }
}
```

### lastUpdateTimeUnix

`lastUpdateTimeUnix`字段是数据对象最后更新的时间戳。

```graphql
{
  Get {
    Class {
      property
      _additional {
        lastUpdateTimeUnix
      }
    }
  }
}
```

### 距离

任何涉及向量搜索的时候，可以显示`distance`来展示查询向量与每个结果之间的距离。距离是作为向量搜索的一部分使用的原始距离度量。例如，如果距离度量是`cosine`，`distance`将返回一个介于0和2之间的数字。请查看完整的[距离度量和期望距离范围的概述](/developers/weaviate/config-refs/distances.md)。

在使用向量检索对象的任何地方，例如使用`nearObject`、`nearVector`或`near<Media>`的`Get {}`，距离是很常见的。结果按照升序距离排序，除非您明确按另一个属性进行排序。

较小的距离值始终意味着两个向量相互之间更接近，而较大的值则意味着相对较远。根据使用的距离度量，这也可能意味着距离会返回负值。例如，如果使用点积
使用产品距离，距离为`-50`表示向量对之间的相似性比`20`更高。有关详细信息和确切定义，请参见[距离页面](/developers/weaviate/config-refs/distances.md)。

*请注意，距离字段在`v1.14.0`中引入。*

#### 确定性（仅适用于余弦距离）

在`v1.14`之前，确定性是在结果中显示向量相似性的唯一方法。`certainty`是一种主观的度量，总是返回一个数值。
该值介于0和1之间。因此，它只能与固定范围的距离度量一起使用，例如`cosine`。

对于具有`cosine`距离度量的类别，`certainty`是使用以下公式对距离进行归一化的结果:

```
certainty = 1 - distance/2
```

鉴于余弦距离始终是0到2之间的数字，这将导致0到1之间的确定性，其中1表示相同的向量，0表示相反的角度。此定义仅存在于角度空间中。

### 分类

当一个数据对象经过分类处理后，您可以通过运行以下命令获取有关对象分类的附加信息：

import GraphQLUnderscoreClassification from '/_includes/code/graphql.underscoreproperties.classification.mdx';

<GraphQLUnderscoreClassification/>

### 特征投影

由于Weaviate将所有数据存储在向量空间中，因此您可以根据查询结果可视化数据。特征投影旨在将对象向量的维度降低到适合可视化的简单维度，例如2D或3D。底层算法是可互换的，首个提供的算法是[t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding)。

要调整特征投影的可选参数（目前仅支持GraphQL），可以提供以下值及其默认值：

| 参数 | 类型 | 默认值 | 含义 |
|--|--|--|--|
| `dimensions` | `int` | `2` | 目标维度，通常为 `2` 或 `3` |
| `algorithm` | `string` | `tsne` | 要使用的算法，目前支持：`tsne` |
| `perplexity` | `int` | `min(5, len(results)-1)` | `t-SNE`的困惑度值，必须小于要可视化的结果数量减1 |
| `learningRate` | `int` | `25` | `t-SNE`的学习率 |
| `iterations` | `int` | `100` | `t-SNE`算法运行的迭代次数。较高的值会导致更稳定的结果，但响应时间会更长 |

默认设置的示例：

import GraphQLUnderscoreFeature from '/_includes/code/graphql.underscoreproperties.featureprojection.mdx';

<GraphQLUnderscoreFeature/>

<details>
  <summary>预期的响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "featureProjection": {
              "vector": [
                -115.17981,
                -16.873344
              ]
            }
          },
          "title": "Opinion | John Lennon Told Them \u2018Girls Don\u2019t Play Guitar.\u2019 He Was So Wrong."
        },
        {
          "_additional": {
            "featureProjection": {
              "vector": [
                -117.78348,
                -21.845968
              ]
            }
          },
          "title": "Opinion | John Lennon Told Them \u2018Girls Don\u2019t Play Guitar.\u2019 He Was So Wrong."
        },
        ...
      ]
    }
  }
}
```

</details>

可以将上述结果绘制成如下图所示（红色结果为第一个结果）：

![Weaviate T-SNE示例](./img/plot-noSettings.png?i=1 "Weaviate T-SNE示例")

#### 最佳实践和注意事项
* 在`featureProjection`查询中，没有请求大小限制（除了全局的10,000个项目请求限制）。然而，由于`t-SNE`算法的O(n^2)复杂度，较大的请求大小对响应时间有指数级影响。我们建议将请求大小保持在100个项目以下，因为我们注意到此后响应时间急剧增加。
* 特征投影是实时进行的，针对每个查询。返回的维度在不同的查询之间没有意义。
* 目前，特征投影仅考虑根元素（未解析的交叉引用不考虑在内）。
* 由于底层算法的相对高成本，我们建议在响应时间重要的高负载情况下限制包含`featureProjection`的请求。避免并行请求包含`featureProjection`，以便一些线程保持可用状态，以处理其他时间关键的请求。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />