---
image: og/docs/modules/vectorizers-overview.jpg
sidebar_position: 0
title: Retrievers, Vectorizers and Rerankers
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概览

本节包括检索器和向量化器模块的参考指南。正如它们的名称所示，`XXX2vec` 模块被配置为为每个对象生成一个向量。

- `text2vec` 将文本数据转换为向量
- `img2vec` 将图像数据转换为向量
- `multi2vec` 将图像或文本数据转换为向量（转换为相同的嵌入空间）
- `ref2vec` 将 Weaviate 内的交叉引用数据转换为向量

### 使用 `text2vec-*` 模块进行向量化

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<VectorizationBehavior/>

:::info Vector inference at object update
Where Weaviate is configured with a vectorizer, it will only obtain a new vector if an object update changes the underlying text to be vectorized.
:::


## 重新排序

Weaviate包括以下模块用于对结果集中的数据对象进行[重新排序](../../search/rerank.md)：
* [reranker-cohere](./reranker-cohere.md)
* [reranker-transformers](./reranker-transformers.md)