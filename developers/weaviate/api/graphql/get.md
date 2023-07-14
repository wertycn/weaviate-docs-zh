---
image: og/docs/api.jpg
sidebar_position: 1
title: GraphQL - Get{}
---

import Badges from '/_includes/badges.mdx';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';

<Badges/>

import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

## Get{} 语法和查询结构

`Get{}` 函数用于获取模式中描述的字段。例如，如果您创建了一个名为 `JeopardyQuestion` 的类，该类具有 `question`、`answer` 和 `points` 属性，您可以按以下方式进行查询:

import GraphQLGetSimple from '/_includes/code/graphql.get.simple.mdx';

<GraphQLGetSimple/>

上述查询将会得到类似以下的结果：

import GraphQLGetSimpleUnfiltered from '!!raw-loader!/_includes/code/graphql.get.simple.py';

<FilteredTextBlock
  text={GraphQLGetSimpleUnfiltered}
  startMarker="// ===== EXPECTED RESULT ====="
  endMarker="// ===== END EXPECTED RESULT ====="
  language="json"
/>

:::info Get query without arguments
The order of object retrieval is not guaranteed in a `Get` query without any search parameters or filters. Accordingly, such a `Get` query is not suitable for any substantive object retrieval strategy. Consider the [Cursor API](./additional-operators.md#cursor-with-after) for that purpose.
:::

### groupBy参数

您可以使用groupBy参数从Weaviate中检索对象的分组。这个功能的优势在于通过搜索详细或分段的对象（例如文档的块），保持细粒度的搜索结果，同时还可以让您回溯并查看对象的更广泛上下文（例如整个文档）。

`groupBy{}`参数在`Get{}`函数中的结构如下：

:::info Single-level grouping only
As of `1.19`, the `groupBy` `path` is limited to one property or cross-reference. Nested paths are current not supported.
:::

```graphql
{
  Get{
    <Class>(
      <vectorSearchParameter>  # e.g. nearVector, nearObject, nearText
      groupBy:{
        path: [<propertyName>]  # Property to group by (only one property or cross-reference)
        groups: <number>  # Max. number of groups
        objectsPerGroup: <number>  # Max. number of objects per group
      }
    ) {
      _additional {
        group {
          id  # An identifier for the group in this search
          groupedBy{ value path }  # Value and path of the property grouped by
          count  # Count of objects in this group
          maxDistance  # Maximum distance from the group to the query vector
          minDistance  # Minimum distance from the group to the query vector
          hits {  # Where the actual properties for each grouped objects will be
            <properties>  # Properties of the individual object
            _additional {
              id  # UUID of the individual object
              vector  # The vector of the individual object
              distance  # The distance from the individual object to the query vector
            }
          }
        }
      }
    }
  }
}
```

以`Passage`对象的集合为例，每个对象都属于一个`Document`。如果在`Passage`对象中进行搜索，可以根据`Passage`的任何属性对结果进行分组，包括表示每个`Passage`关联的`Document`的交叉引用属性。

`groups`和`objectsPerGroup`的限制是可自定义的。因此在这个例子中，您可以检索出前100个对象并对它们进行分组，以识别出最相关的2个`Document`对象，基于每个`Document`中的前2个`Passage`对象。

更具体地说，可以使用以下查询语句：

<details>
  <summary>带有groupBy的示例Get查询</summary>

```graphql
{
  Get{
    Passage(
      limit: 100
      nearObject: {
        id: "00000000-0000-0000-0000-000000000001"
      }
      groupBy: {
        path: ["content"]
        groups: 2
        objectsPerGroup: 2
      }
    ){
      _additional {
        id
        group {
          id
          count
          groupedBy { value path }
          maxDistance
          minDistance
          hits{
            content
            ofDocument {
              ... on Document {
                _additional {
                  id
                }
              }
            }
            _additional {
              id
              distance
            }
          }
        }
      }
    }
  }
}
```

</details>

将导致以下响应：

<details>
  <summary>对应的响应</summary>

```json
{
  "data": {
    "Get": {
      "Passage": [
        {
          "_additional": {
            "group": {
              "count": 1,
              "groupedBy": {
                "path": [
                  "content"
                ],
                "value": "Content of passage 1"
              },
              "hits": [
                {
                  "_additional": {
                    "distance": 0,
                    "id": "00000000-0000-0000-0000-000000000001"
                  },
                  "content": "Content of passage 1",
                  "ofDocument": [
                    {
                      "_additional": {
                        "id": "00000000-0000-0000-0000-000000000011"
                      }
                    }
                  ]
                }
              ],
              "id": 0,
              "maxDistance": 0,
              "minDistance": 0
            },
            "id": "00000000-0000-0000-0000-000000000001"
          }
        },
        {
          "_additional": {
            "group": {
              "count": 1,
              "groupedBy": {
                "path": [
                  "content"
                ],
                "value": "Content of passage 2"
              },
              "hits": [
                {
                  "_additional": {
                    "distance": 0.00078231096,
                    "id": "00000000-0000-0000-0000-000000000002"
                  },
                  "content": "Content of passage 2",
                  "ofDocument": [
                    {
                      "_additional": {
                        "id": "00000000-0000-0000-0000-000000000011"
                      }
                    }
                  ]
                }
              ],
              "id": 1,
              "maxDistance": 0.00078231096,
              "minDistance": 0.00078231096
            },
            "id": "00000000-0000-0000-0000-000000000002"
          }
        }
      ]
    }
  }
}
```

</details>

### 一致性级别

:::info Available from `v1.19` onwards
:::

在配置了复制的情况下，`Get{}`函数可以配置为以不同的一致性级别返回结果。当您想要检索最新数据或尽快检索数据时，这将非常有用。

在[这里](../../concepts/replication-architecture/consistency.md)更多了解一致性级别。

import GraphQLGetConsistency from '/_includes/code/graphql.get.consistency.mdx';

<GraphQLGetConsistency/>

### 多租户

:::info Available from `v1.20` onwards
:::

当配置了多租户时，可以配置 `Get{}` 函数以返回特定租户的结果。

您可以通过在GraphQL查询中指定 `tenant` 参数来实现，如下所示，或者使用等效的客户端函数。

```graphql
{
  Get {
    Article (
      tenant: "tenantA"
      limit: 1
    ) {
      name
    }
  }
}
```

:::tip See HOW-TO guide
For more information on using multi-tenancy, see the [Multi-tenancy operations guide](../../manage-data/multi-tenancy.md).
:::

## 查询信标引用

如果您在模式中设置了信标引用（交叉引用），可以按如下方式查询它：

import GraphQLGetBeacon from '/_includes/code/graphql.get.beacon.mdx';

<GraphQLGetBeacon/>

import GraphQLGetBeaconUnfiltered from '!!raw-loader!/_includes/code/graphql.get.beacon.py';

<details>
  <summary>预期响应</summary>

<FilteredTextBlock
  text={GraphQLGetBeaconUnfiltered}
  startMarker="// ===== EXPECTED RESULT ====="
  endMarker="// ===== END EXPECTED RESULT ====="
  language="json"
/>

</details>

## 附加属性

对于每个Get{}请求，您可以使用附加属性获取有关返回的数据对象的其他信息。您可以通过对象`_additional{}`中的这些属性来识别它们。附加属性可以帮助您解释查询结果，并且可以用于检索数据的投影和可视化。有关所有附加属性及其使用方法的概述，请参阅[此处](./additional-properties.md)的文档。

## 向量搜索运算符

要将`Get { }`与向量搜索参数结合起来，以下是支持的参数概述以及其详细文档的链接：

| 参数 | 描述 | 必需模块（至少一个） | 了解更多 |
| --- | --- | --- | --- |
| `nearObject` | 查找与其id引用的对象最接近的邻居 | *无 - 可直接使用* | [了解更多](./vector-search-parameters.md#nearobject) |
| `nearVector` | 查找到任意向量的最近邻 | *无需配置 - 直接可用* | [了解更多](./vector-search-parameters.md#nearvector) |
| `nearText` | 对文本查询进行向量化，并基于此进行向量搜索 | `text2vec-transformers`, `text2vec-contextionary`, `text2vec-openai`, `multi2vec-clip`, `text2vec-huggingface`, `text2vec-cohere` | [Transformers](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md#how-to-use), [Contextionary](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md#how-to-use), [OpenAI](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai.md#how-to-use), [CLIP](/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip.md#how-to-use), [Hugging Face](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface.md#how-to-use), [Cohere](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere.md#how-to-use) |
| `nearImage` | 对图像进行向量化，并基于向量进行相似图像搜索 | `multi2vec-clip`, `img2vec-neural` | [CLIP](/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip.md#neartext), [Img2Vec](/developers/weaviate/modules/retriever-vectorizer-modules/img2vec-neural.md#nearimage-search) |
| `hybrid` | 结合密集向量和稀疏向量，以提供两种搜索方法的最佳结果 | *无需额外操作 - 可立即使用* | [了解更多](../graphql/vector-search-parameters.md#hybrid) |
| `bm25`   | 使用BM25F排名的关键词搜索  | *无 - 开箱即用* | [了解更多](../graphql/vector-search-parameters.md#bm25) |

## 筛选器

`Get{}` 函数可以通过搜索筛选器进行扩展（包括语义筛选器和传统筛选器）。由于筛选器适用于多个核心函数（如 `Aggregate{}`），因此有一个[专门的文档页面专门介绍筛选器](filters.md)。

### 排序

*注意：排序功能在 `v1.13.0` 版本中添加。*

您可以根据任何基本属性对结果进行排序，通常是 `text`、`string`、`number` 或 `int` 属性。当查询具有自然顺序时（例如，因为存在 `near<Media>` 的向量搜索），添加排序操作符将覆盖该顺序。

有关更多信息，请参阅 [过滤器 - 排序](./additional-operators.md#sorting)。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />