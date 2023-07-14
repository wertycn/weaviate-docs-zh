---
image: og/docs/concepts.jpg
sidebar_position: 30
title: Horizontal Scaling
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 介绍
Weaviate可以通过在集群中的多个节点上运行来实现水平扩展。本节介绍了Weaviate的多种扩展方式，以及在进行扩展时需要考虑的因素，以及与水平扩展相关的Weaviate架构。

## 扩展Weaviate的动机
通常有（至少）三个不同的动机来进行水平扩展，这些动机将导致不同的设置。

### 动机 1：最大数据集大小
由于[HNSW图的内存占用](./resources.md#the-role-of-memory)可能会希望将数据集分布在多个服务器（"节点"）上。在这种设置中，单个类索引由多个分片组成，而分片则分布在多台服务器上。

Weaviate在导入和查询时完全自动进行所需的编排。唯一需要调整的是指定所需的分片数。有关在运行多个分片时涉及的权衡，请参见下面的[分片与复制](#sharding-vs-replication)。

**解决方案：在集群中跨多个节点进行分片**

:::note
The ability to shard across a cluster was added in Weaviate `v1.8.0`.
:::

### 动机 2: 更高的查询吞吐量
当您收到的查询超过单个Weaviate节点的处理能力时，添加更多的Weaviate节点可以帮助响应用户的查询。

您可以将相同的数据复制到多个节点，而不是在多个节点之间进行分片。这个过程也是完全自动化的，您只需要指定所需的复制因子。分片和复制也可以结合使用。

**解决方案: 在集群中的多个节点上复制您的类**

### 动机 3: 高可用性

在使用Weaviate进行关键负载服务时，如果一个节点完全故障，可能希望能够继续提供查询服务。这种故障可能是由于软件或操作系统级别的崩溃，甚至是硬件问题。除了意外崩溃之外，高可用性的设置还可以容忍零停机时间的更新和其他维护任务。

为了运行一个高可用的设置，类必须在多个节点之间进行复制。

**解决方案：在集群中将您的类复制到多个节点**

## 分片 vs 复制
上面的动机部分概述了何时需要将您的类分片到多个节点以及何时需要复制您的类 - 或者两者兼而有之。本节重点介绍分片和/或复制设置的影响。

:::note
All of the scenarios below assume that - as sharding or replication is increased - the cluster size is adapted accordingly. If the number of shards or the replication factor is lower than the number of nodes in the cluster, the advantages no longer apply.*
:::

### 增加分片的优势
* 处理更大的数据集
* 加快导入速度

### 增加分片的劣势
* 添加更多分片节点后，查询吞吐量不会提高

### 增加复制的优势
* 系统变得高度可用
* 增加复制会导致查询吞吐量近乎线性增加

### 增加复制的劣势
* 添加更多复制节点后，导入速度不会提高

## 分片键（"分区键"）
Weaviate使用对象的特定特征来决定它属于哪个分片。从`v1.8.0`开始，分片键始终是对象的UUID。分片算法是一个64位的Murmur-3哈希算法。将来可能会添加其他属性和其他分片算法。

## 重新分片

Weaviate使用虚拟分片系统将对象分配到分片中。这使得重新分片更加高效，因为重新分片时只发生最小的数据移动。然而，由于HNSW索引的存在，重新分片仍然是一个非常昂贵的过程，应该尽量避免使用。重新分片的成本大致等同于初始导入的数据量。

示例 - 假设以下场景：一个类由4个分片组成，导入所有数据需要60分钟。当将分片计数更改为5时，每个分片将大约将其数据的20%传输到新的分片。这相当于数据集的20%的导入，因此此过程的预期时间将为约12分钟。

:::note
The groundwork to be able to re-shard has been laid by using Weaviate's Virtual shard system. Re-sharding however is not yet implemented and not currently prioritized. See Weaviate's [Architectural Roadmap](/developers/weaviate/roadmap/index.md).
:::

## 节点发现

集群中的节点使用类似于八卦协议的方式，通过[Hashicorp的Memberlist](https://github.com/hashicorp/memberlist)来通信节点状态和故障场景。

Weaviate - 尤其是在集群模式下运行时 - 优化为在 Kubernetes 上运行。[Weaviate Helm chart](/developers/weaviate/installation/kubernetes.md#weaviate-helm-chart) 使用 `StatefulSet` 和无头的 `Service` 来自动配置节点发现。您只需要指定所需的节点数。

## 分片和/或复制分片的节点亲和性

Weaviate 尝试选择具有最多可用磁盘空间的节点。

只有在创建新的类时才适用，而不是在向现有的单个类添加更多数据时。

<details>
  <summary>Pre-<code>v1.18.1</code>的行为</summary>

在版本`v1.8.0`-`v1.18.0`中，用户无法指定特定分片或复制分片的节点亲和性。

分片会以循环方式分配给“活动”节点，从一个随机节点开始。

</details>

## 一致性和当前限制

* 模式的更改在节点之间是强一致的，而数据的更改则是最终一致的。
* 从`v1.8.0`版本开始，在整个事务的生命周期中，集群中广播模式更改的过程使用了一种两阶段事务的形式，目前无法容忍节点故障。
* 从`v1.8.0`版本开始，复制功能目前正在开发中。 ([查看路线图](/developers/weaviate/roadmap/index.md)).
* 从 `v1.8.0` 版本开始，动态扩展集群的支持还不完全。可以将新节点添加到现有集群中，但它不会影响分片的所有权。如果数据存在，现有节点目前不能被移除，因为在移除节点之前还没有将分片移动到其他节点。 （[查看路线图](/developers/weaviate/roadmap/index.md)）

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />