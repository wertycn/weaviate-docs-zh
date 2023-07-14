---
image: og/docs/concepts.jpg
sidebar_position: 28
title: Reranking
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

:::info Related pages
- [API References: GraphQL - Additional properties](../api/graphql/additional-properties.md#rerank)
- [How-to search: Rerank](../search/rerank.md)
- [Modules: reranker-cohere](../modules/retriever-vectorizer-modules/reranker-cohere.md)
- [Modules: reranker-transformers](../modules/retriever-vectorizer-modules/reranker-transformers.md)
:::

重新排序旨在通过使用不同模型重新排序由[检索器](../modules/retriever-vectorizer-modules/index.md)返回的结果集来提高搜索相关性。

重新排序会计算查询和每个数据对象之间的相关性分数，并返回按相关性从高到低排序的对象列表。为所有`(查询，数据对象)`对计算此分数通常会非常慢，这就是为什么先检索相关对象后再使用重新排序作为第二阶段的原因。

由于重新排序器在检索后的较小数据子集上工作，可以使用不同的、可能更耗费计算资源的方法来改善搜索相关性。

## 在Weaviate中的重新排序

通过我们的重新排序模块，您可以方便地进行[多阶段搜索](/blog/cross-encoders-as-reranker)，而无需离开Weaviate。

换句话说，您可以执行搜索，例如矢量搜索，然后使用重新排序器对该搜索结果进行重新排序。我们的重新排序模块与矢量、bm25和混合搜索兼容。

### 使用重新排序器的GraphQL查询示例

您可以按以下方式在GraphQL查询中使用重新排序器：

```graphql
{
  Get {
    JeopardyQuestion(
      nearText: {
        concepts: "flying"
      }
      limit: 10
    ) {
      answer
      question
      _additional {
        distance
        rerank(
          property: "answer"
          query: "floating"
        ) {
          score
        }
      }
    }
  }
}
```

此查询从`JeopardyQuestion`类中检索50个结果，使用具有查询“flying”的混合搜索。然后使用`answer`属性和查询“floating”对结果进行重新排序。

您可以指定要传递给重新排序器的`JeopardyQuestion`类的`property`。请注意，在这里，返回的`score`将包括重新排序器的分数。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />