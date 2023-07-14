---
image: og/docs/concepts.jpg
sidebar_position: 18
title: Storage
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

Weaviate是一个持久且容错的数据库。本页面将为您概述Weaviate如何存储对象和向量，以及在导入时如何创建倒排索引。

本页面提到的组件有助于Weaviate创建其独特的功能：

- 每个写入操作都会立即持久化，并且对应用程序和系统崩溃具有容错性。
* 在向量搜索查询中，Weaviate返回整个对象（在其他数据库中有时称为“文档”），而不仅仅是一个引用，比如一个ID。
* 在将结构化搜索与向量搜索结合时，过滤器在执行向量搜索之前应用。这意味着您总是会收到指定数量的元素，而不是在最终结果计数不可预测时进行后过滤。
* 对象及其向量可以随时更新或删除；甚至在从数据库读取时也可以。

## 逻辑存储单元：索引、分片、存储

Weaviate中用户定义模式中的每个类都会导致内部创建一个索引。索引是一个包含一个或多个分片的包装类型。索引中的分片是自包含的存储单元。多个分片可以用于自动将负载分布在多个服务器节点之间。

### 分片的组成部分

每个分片包含三个主要组件：

* 一个对象存储，实质上是一个键值存储
* 一个[倒排索引](https://en.wikipedia.org/wiki/Inverted_index)
* 一个向量索引存储（可插拔的，目前是[HNSW的自定义实现](/developers/weaviate/concepts/vector-index.md#hnsw)）

:::caution Important
Weaviate doesn't rely on any third-party databases. The three components of a shard are all housed within Weaviate. This means that there are no runtime dependencies to other services and all components will scale equally with Weaviate.
:::

#### 对象和倒排索引存储

自版本`v1.5.0`以来，对象和倒排存储使用[LSM-Tree方法](https://en.wikipedia.org/wiki/Log-structured_merge-tree)进行实现。这意味着数据可以以内存速度进行摄入，并在满足配置的阈值后，Weaviate将整个（排序的）内存表写入磁盘段中。当收到读取请求时，Weaviate将首先检查内存表中特定对象的最新更新。如果在内存表中找不到该对象，Weaviate将检查所有先前写入的段，从最新的段开始。为了避免检查不包含所需对象的段，使用了[Bloom过滤器](https://en.wikipedia.org/wiki/Bloom_filter)。

Weaviate定期将较旧的小段合并为较少的大段。由于段已经排序，因此这是一项相对廉价的操作 - 在后台持续进行。较少、较大的段将使查找更加高效。特别是在倒排索引中，数据很少被替换，通常是追加的方式，而不是检查所有过去的段并聚合潜在的结果，Weaviate可以检查一个单独的段（或少数大段）并立即找到所有所需的对象指针。此外，段还用于删除或多次更新后不再需要的对象的过去版本。

:::caution Important
Object/Inverted Storage use an LSM approach which makes use of segmentation. However, the Vector Index is independent from those object stores and is not affected by segmentation.
:::

:::note
Prior to version `v1.5.0`, Weaviate used a B+Tree storage mechanismwhich could not keep up with the write requirements of an inverted index andstarted becoming congested over time. With the LSM index, the pure write speed (ignoringvector index building costs) is constant. There is no congestion over time.
:::

#### HNSW向量索引存储

每个分片都包含其自己的向量索引，该索引位于上述结构化存储旁边。然而，向量存储对于对象存储的内部是无关的。因此，它不会遇到分段问题。

通过将向量索引与分片内的对象存储进行分组，Weaviate可以确保每个分片都是一个完全独立的单元，可以独立地为自己拥有的数据提供请求服务。通过将向量索引放置在对象存储旁边（而不是内部），Weaviate可以避免分段向量索引的缺点。

### 分片组件优化

根据经验法则：对于结构化/对象数据，Weaviate的存储机制接受并支持分割，因为分割是廉价的，即使未合并的分割也可以通过布隆过滤器高效导航。相应地，摄取速度很高，并且不会随时间推移而降低。对于向量索引，Weaviate的目标是在一个分片内尽可能保持索引的大小，因为HNSW索引无法有效合并，并且查询单个大索引比顺序查询多个小索引更高效。

## 持久性和崩溃恢复

用于对象和倒排存储的LSM存储和用于向量索引存储的HNSW存储在摄入过程中都使用内存。为了防止崩溃时数据丢失，每个操作还会被写入[预写式日志（Write-Ahead-Log，WAL）](https://martinfowler.com/articles/patterns-of-distributed-systems/wal.html)。WAL是追加写入的文件，非常高效，并且很少成为摄入瓶颈。

当Weaviate对您的摄入请求响应成功时，将创建一个WAL条目。如果无法创建WAL条目，例如因为磁盘已满，Weaviate将以错误形式响应插入或更新请求。

LSM存储将在有序关闭时尝试刷新一个段。只有在操作成功的情况下，WAL才会被标记为"complete"。这意味着，如果发生意外崩溃并且Weaviate遇到一个"不完整"的WAL，它将从中恢复。作为恢复过程的一部分，Weaviate将根据WAL刷新一个新的段并将其标记为完整。因此，将来的重启将不再需要从这个WAL中恢复。

对于HNSW向量索引，WAL具有两个作用：它既是灾难恢复机制，也是主要的持久化机制。建立HNSW索引的成本在于确定新对象的放置位置以及如何与其邻居进行链接。WAL仅包含这些计算的结果。因此，通过将WAL读入内存，HNSW索引将与关机前处于相同状态。

随着时间的推移，一个追加日志（WAL）将包含大量冗余信息。例如，想象一下连续的两个条目，它们重新分配了特定节点的所有链接。第二个操作将完全替换第一个操作的结果，因此WAL不再需要第一个条目。为了保持WAL的新鲜，后台进程将持续压缩WAL文件并删除冗余信息。这使得磁盘占用空间小，启动时间快，因为Weaviate不需要存储（或加载）过时的信息。

作为结果，对HNSW索引的任何更改都会立即持久化，无需定期快照。

## 结论

本页面介绍了Weaviate的存储机制。它概述了所有写入操作是立即持久化的，并概述了Weaviate中用于实现良好数据集扩展性的模式。对于结构化数据，Weaviate使用分段技术来保持写入时间恒定。对于HNSW向量索引，Weaviate避免使用分段技术以保持查询时间高效。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />