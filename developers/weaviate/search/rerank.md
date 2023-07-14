---
image: og/docs/howto.jpg
sidebar_position: 75
title: Reranking
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/search.rerank.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.rerank.ts';

## 概述

本页面将向您展示如何对由 [vector](similarity.md)、[bm25](bm25.md) 或 [hybrid](hybrid.md) 运算符返回的搜索结果集进行重新排序。

有两个可用的重新排序模块:
* [reranker-cohere](../modules/retriever-vectorizer-modules/reranker-cohere.md)
* [reranker-transformers](../modules/retriever-vectorizer-modules/reranker-transformers.md)

:::info Related pages
- [API References: GraphQL - Additional properties](../api/graphql/additional-properties.md#rerank)
- [Concepts: Reranking](../concepts/reranking.md)
:::

import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />


## 需求

要对搜索结果进行重新排序，您需要启用一个重新排序模块。
您可以使用以下方式重新排序结果：
- 使用与初始搜索相同的查询，或者
- 使用不同的重新排序查询。


## 重新排序向量搜索结果

使用[JeopardyQuestions数据集](../quickstart/index.md)，假设我们想要查找关于飞行的问答，并进一步将关于漂浮的问题排序到前面。我们可以从一个`nearText`搜索开始，搜索词为`flying`，限制结果为10个：

<Tabs groupId="languages">
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START nearText GraphQL"
      endMarker="# END nearText GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

响应应该如下所示：

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# START Expected nearText results"
    endMarker="# END Expected nearText results"
    language="json"
  />

</details>

我们可以看到与浮空飞行器（气球/飞艇/飞艇）相关的结果与其他结果（动物、邮件）混合在一起。为了将浮动结果排在前面，我们可以应用`rerank`操作符：

<Tabs groupId="languages">
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START nearTextRerank GraphQL"
      endMarker="# END nearTextRerank GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

响应应该如下所示：

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# START Expected nearTextRerank results"
    endMarker="# END Expected nearTextRerank results"
    language="json"
  />

</details>

    我们可以在`rerank`的结果集中看到，答案按照`_additional.rerank[0].score`字段降序排序，那些涉及到气球/飞艇/气球的答案排序靠前。


## 重新排序bm25搜索结果

下面的示例使用`rerank`在`bm25`查询中对与"paper"相关的"publication"的结果进行排序，而不是与纸质材料相关的结果。

<Tabs groupId="languages">
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START bm25Rerank GraphQL"
      endMarker="# END bm25Rerank GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

响应应该如下所示：

  <FilteredTextBlock
    text={PythonCode}
    startMarker="# START Expected bm25Rerank results"
    endMarker="# END Expected bm25Rerank results"
    language="json"
  />

</details>


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
