---
image: og/docs/howto.jpg
sidebar_position: 0
title: Search
---

## 概述

这些**搜索**指南旨在帮助您使用Weaviate找到所需的数据。

import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />

我们建议您从[查询基础知识](./basics.md)页面开始。
- 它介绍了搜索（即`Get`）查询的基本语法，以及如何指定要检索的属性。

然后，可以选择您感兴趣的指南进行学习。我们为以下内容提供了单独的指南：

- [相似度](./similarity.md): 包含`nearXXX`搜索，通过搜索与查询最相似的向量表示的对象。
- [BM25](./bm25.md): 使用BM25F搜索函数对结果进行排序的关键字搜索。
- [混合](./hybrid.md): 结合BM25和相似性搜索来对结果进行排序。
- [聚合](./aggregate.md): 从结果集中聚合数据。
- [筛选器](./filters.md): 对搜索应用条件筛选器。

每个指南都是独立的，所以您可以按任意顺序阅读它们。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />