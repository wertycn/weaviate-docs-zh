---
image: og/docs/more-resources.jpg
sidebar_position: 4
title: Glossary
---

import Badges from '/_includes/badges.mdx';

<Badges/>

| 术语 | 描述 |
| ---- | ----------- |
| **Beacon** | Beacon是对Weaviate或知识网络中特定数据对象的引用。这个数据对象在向量空间中有一个位置。通常定义如下：`weaviate://{peerName}/{className}/{UUID}`（对于Weaviate版本 < `v1.14.0`，定义如下：`weaviate://{peerName}/{UUID}`）。 |
| **类** | 类是语义类的定义。例如，类`Company`或类`Movie`。在Weaviate中，类可以通过它们的首字母大写来识别。 |
| **概念** | 概念与实体相关。通常您会使用概念在数据集中进行搜索。如果您的数据集包含有关“名为阿诺德·施瓦辛格”的演员和“名为阿尔·帕西诺”的演员的数据，那么概念“电影”和“终结者”将与第一个演员的关系更加密切而不是第二个演员。 |
| **Contextionary（上下文字典）** | 由带有上下文的字典派生而来。预训练的向量空间包含了特定语言中几乎所有单词的向量。Contextionary（text2vec-contextionary）为数据集中使用的语言提供了上下文，受到了[*全局词向量表示*](https://github.com/stanfordnlp/GloVe)概念的启发。在[这里](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md)了解更多关于Contextionary的信息。 |
| **实体** | 实体通常指我们周围的某些事物。例如，具有名称为“苹果”的公司是指与名称为“iPhone”的产品有关的实体。Weaviate的Contextionary试图在您的数据中找到尽可能多的实体。 |
| **模糊查询** | 与大多数其他数据解决方案不同，Weaviate使用[模糊逻辑](https://en.wikipedia.org/wiki/Fuzzy_logic)来解释查询。优点是它可以找到传统数据解决方案可能无法找到的查询答案。 |
| **HNSW** | Hierarchical Navigable Small World（层次可导航小世界）- 是Weaviate支持的第一种向量索引类型，是一个多层图形。 |
| **倒排索引** | 一种索引，存储数据属性值与数据库中数据对象位置的映射（与正向索引相对，正向索引是从数据对象到属性数据值的映射）。 |
| **属性** | 所有类都有属性。例如，类别 Company 可能有属性 _name_。在 Weaviate 中，属性可以通过首字母小写来识别。 |
| **模式** | 在Weaviate中，模式用于定义您将添加和查询的数据类型。您可以在[此处](../tutorials/schema.md)了解更多信息。 |
| **Weaviate集群** | 一个托管的Weaviate集群 |
| **Weaviate云服务（WCS）** | WCS是我们提供Weaviate云实例的SaaS服务 |
| **向量索引** | 数据存储机制，数据以向量形式存储（长数组的数字，也可以看作是高维空间中的坐标），允许基于上下文进行搜索 |

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />