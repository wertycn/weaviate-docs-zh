---
image: og/docs/more-resources.jpg
sidebar_position: 7
title: Index types and performance
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- TODO: 不清楚这个页面是否应该合并到另一个页面中，例如与索引、资源规划或架构相关的内容。 -->
## 索引类型
Weaviate使用两种类型的数据索引。除了创建和驱动语义搜索功能的向量索引之外，还有[倒排索引](https://en.wikipedia.org/wiki/Inverted_index)。

### 倒排索引
倒排索引实际上是支持所有[GraphQL `where` 过滤器](../api/graphql/filters.md#where-filter)的核心，当需要使用向量或语义来查找结果时。通过倒排索引，内容或数据对象的属性（如单词和数字）被映射到数据库中的位置。这与传统的正向索引相反，正向索引是从文档到其内容的映射。

倒排索引经常在文档检索系统和搜索引擎中使用，因为它可以快速进行全文搜索和基于关键词的快速搜索，而不需要进行暴力搜索。这种快速的数据检索的代价是在添加新的数据对象时稍微增加了处理时间，因为数据对象将以倒排的方式进行索引和存储，而不仅仅存储数据对象的索引。在数据库（Weaviate）中，有一个大的查找表，其中包含所有的倒排索引。如果您想检索具有特定属性或内容的对象，则数据库会开始查找指向相关数据对象的仅含有该属性的一行（该行包含指向数据对象ID的指针）。这使得使用这种类型的查询检索数据对象非常快速。即使有超过十亿条记录，如果您只关心包含特定单词或属性的记录，只有一行文档指针将被读取。

当前的倒排索引在排序时没有进行任何加权（如tf-idf），因为向量索引用于这些排序特性。因此，倒排索引目前更像是一个二进制操作：将数据对象包含或排除在查询结果列表中，这将产生一个“允许列表”。

### 向量索引
所有具有向量的内容，也就是Weaviate中的每个数据对象，都会被索引到向量索引中。虽然Weaviate目前支持[HNSW](https://arxiv.org/abs/1603.09320)向量索引，但它可以[配置](/developers/weaviate/concepts/vector-index.md)，并且将来还会有更多的向量索引类型。

#### HNSW
[HNSW](https://arxiv.org/abs/1603.09320) 是由Weaviate支持的第一种向量索引类型。HNSW在查询时非常快速，但在构建索引时更加耗时（添加带有向量的数据）。这意味着添加数据对象的过程可能比您预期的时间更长，或者与您以前使用的其他数据库系统相比更长。其他数据库系统（如Elasticsearch）不使用向量索引，而仅依赖于倒排索引。通过使用HNSW对数据进行向量化，可以实现语义和基于上下文的高性能查询。

#### 其他向量索引类型
Weaviate使用的向量索引类型是可插拔的。这意味着除了HNSW之外，还可以使用其他类型进行向量化和查询。如果您的用例更注重快速数据上传而不是超快速查询时间和高可扩展性，那么其他向量索引类型可能是更好的解决方案（例如[Spotify的Annoy](https://github.com/spotify/annoy)）。如果您想为新的索引类型做出贡献，您可以随时与我们联系或向Weaviate提交拉取请求，并构建您自己的索引类型。敬请关注更新！


## 查询和操作的成本

### 数据导入成本
目前，由于HNSW索引的原因，数据导入相对于查询时间来说比较慢。最便宜的数据导入操作是对之前未见过的数据对象进行简单的“写入”操作。它将获得一个全新的索引。如果更新数据对象，更新本身也非常便宜，因为在后台将创建一个全新的对象，并将其索引，就像它是新的一样。旧的对象将被清理，这是异步进行的，因此会增加操作时间。

### 查询成本
只具有`where`筛选器的简单`Get`查询非常廉价，因为使用了[倒排索引](#倒排索引)。只使用`explore`筛选器（向量搜索）的简单`Get`查询也非常廉价，因为使用了非常高效的向量索引HNSW。在包含1-100M个对象的数据集上进行20NN-vector查询，响应时间可以在50毫秒以下。Weaviate依赖于多个缓存，但不要求将所有向量保留在内存中。因此，可以在可用内存小于所有向量大小的机器上运行Weaviate。

将`explore`（向量）和`where`筛选器组合在一个搜索查询中（这是Weaviate独特之处），会稍微增加一些开销。首先调用倒排索引，返回与`where`筛选器匹配的所有数据项。然后将该列表传递给使用HNSW的向量索引搜索。这个组合操作的成本取决于数据集的大小和倒排索引搜索返回的数据量。从`where`筛选器搜索返回的项越少，向量搜索需要跳过的项就越多，因此所需的时间就越长。然而，这些差异非常小，可能甚至不会被注意到。

### 解析引用的成本
Weaviate是一个具有类似图形的数据模型的数据库，而不是纯粹的图形数据库。图形数据库是以一种方式构建的，其中跟随链接和引用非常廉价，查询链接比查询多个项目更便宜。另一方面，Weaviate是一个向量数据库。这意味着您可以使用Weaviate执行的最廉价的操作之一是列出数据。在传统的图形数据库中，这是非常昂贵的。然而，Weaviate在向量搜索焦点之上也具有图形功能。因此，尽管它的主要重点是使用倒排索引和/或向量索引搜索数据对象，我们提供数据对象之间的图形引用。因此，搜索、跟随和检索数据对象之间的图形引用不如纯搜索优化。这意味着使用类似图形的功能（例如解析对象引用）需要比上述纯数据对象搜索更多的查询时间。

重要的是要知道，数据对象之间的连接越多，您在单个查询中进行的深度查询越多，查询操作的成本就越高。在处理这种类型的查询时，最好的方法是不同时进行*广泛*和*深入*的搜索。如果您必须解析大量嵌套引用，请尝试设置一个较低的限制（返回的数据对象数量较少）。第二个提示是不要尝试解析所有的引用。根据您的查询，这可能需要将其拆分为单独的查询。实际上，这意味着您可以首先进行一次搜索，检索查询的前100个数据对象，然后只获取您实际感兴趣的前5个结果的更深层次的引用。

### 按引用进行过滤的成本
如果您有一个嵌套的引用过滤器，Weaviate会从最深的引用开始解析，然后向上解析其他引用的内部层。因此，它首先找到最深引用的信标。这允许对其他层使用倒排索引查找，从而使结果的匹配相对廉价。然而，具有嵌套引用的查询在过滤器中仍然相对昂贵，因为需要执行多个搜索查询（针对每个嵌套层），并且需要将结果合并为一个结果。当内部层返回大量结果时，成本会增加，需要通过更深一层来搜索，依此类推。因此，这个成本理论上可能呈指数增长。

一个提示是尽量避免在查询中使用深层嵌套的过滤器。此外，尽量使查询尽可能具有限制性，因为一个十层深的查询如果每个层级只返回一个 ID，那么查询的开销就不会很大。在这种情况下，只需要执行十次一个 ID 的搜索，虽然在一个查询中进行了很多次搜索，但每次搜索的开销都很小。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />