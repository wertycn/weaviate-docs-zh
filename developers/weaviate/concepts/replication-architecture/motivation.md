---
image: og/docs/concepts.jpg
sidebar_position: 1
title: Use Cases (Motivation)
---

import Badges from '/_includes/badges.mdx';

<Badges/>

在本页面中，您将找到四个使用案例，这些案例为Weaviate的复制提供了动机。每个案例都有不同的目的，因此可能需要不同的配置。

## 高可用性（冗余）
数据库的高可用性意味着数据库被设计为在没有服务中断的情况下持续运行。这意味着数据库系统应该对故障和错误具有容错性，并且应该能够自动处理它们。这个问题可以通过复制来解决，即当其他节点发生故障时，冗余节点可以处理请求。在分布式数据库结构中，当一个节点出现故障时，读取或写入查询仍然可以使用，因此消除了单点故障。用户的查询将自动（不可察觉地）重定向到可用的副本节点。

Weaviate认为模式操作是关键的，因此它具有强一致的模式。因此，所有节点都需要进行模式操作。当一个或多个节点宕机时，模式操作将暂时无法进行。

希望实现高可用性的应用程序的示例包括紧急服务、企业IT系统、社交媒体和网站搜索。如今，用户已经习惯了高可用性的应用程序，因此他们期望几乎没有停机时间。例如，对于网站搜索来说，如果一个节点宕机，服务（读取查询）不应中断。在这种情况下，如果写入暂时不可用，那是可以接受的，最坏的情况下，网站搜索可能会过时，但仍然可以用于读取请求。

<p align="center"><img src="/img/docs/replication-architecture/replication-high-availability.png" alt="高可用性" width="75%"/></p>


高可用性可以通过以下配置示例来说明：
1. 写入`ALL`，读取`ONE` - 在写入过程中没有高可用性，因为需要所有节点响应写入请求。在读取请求上有高可用性：在读取时，除了一个节点外，其他所有节点都可以宕机，读取操作仍然可用。
2. 写入 `QUORUM`，读取 `QUORUM` (n/2+1) - 即使有一小部分节点宕机，大多数节点仍然应该正常运行，您仍然可以进行读取和写入操作。
3. 写入`ONE`，读取`ONE` - 这是最常见的配置。除了一个节点以外的所有节点都可以宕机，读写操作仍然可以进行。请注意，这种超高可用性是以低一致性保证为代价的。由于最终一致性，您的应用程序必须能够处理暂时显示过时数据的情况。

## 增加（读取）吞吐量
当您的Weaviate实例有许多读取请求时，例如因为您正在为许多用户构建一个应用程序，数据库设置应该能够支持高吞吐量。吞吐量以每秒查询数（QPS）来衡量。通过向数据库设置添加额外的服务器节点，吞吐量也会相应扩展。服务器节点越多，系统将能够处理的用户（读取操作）就越多。因此，复制您的Weaviate实例可以增加吞吐量。

当读取一致性级别设置为较低的级别（例如`ONE`）时，通过增加复制因子（即数据库服务器节点数）可以线性增加吞吐量。例如，当读取一致性级别为`ONE`时，如果一个节点可以达到每秒处理10,000个查询请求，那么具有3个副本节点的设置可以接收30,000个查询请求。

<p align="center"><img src="/img/docs/replication-architecture/replication-increased-throughput.png" alt="Increased Throughput" width="75%"/></p>


## 零停机升级

没有复制功能时，更新 Weaviate 实例时会出现停机时间窗口。单个节点需要停止、更新和重新启动，然后才能再次提供服务。有了复制功能，升级是通过滚动更新来完成的，在此过程中，最多只有一个节点不可用，而其他节点仍然可以提供流量服务。

举个例子，假设您要将 Weaviate 实例的版本从 v1.19 更新到 v1.20。如果没有复制功能，将会出现停机时间窗口：
1. 节点已准备好接收流量
2. 节点已停止，无法处理任何请求
3. 节点镜像已替换为新版本
4. 节点已重新启动
5. 节点需要一段时间才能准备好
6. 节点已准备好接收流量

从第2步到第6步，Weaviate服务器无法接收和响应任何请求。这会导致用户体验不佳。

使用复制（例如复制因子为3），对Weaviate版本进行升级时，使用滚动更新来完成。同一时间最多只有一个节点不可用，因此其他所有节点仍然可以提供流量服务。
1. 3个节点准备好提供流量服务
2. 替换节点1，节点2、3可以提供流量服务
3. 替换节点2，节点1、3可以提供流量服务
4. 替换节点3，节点1、2可以提供流量服务

<p align="center"><img src="/img/docs/replication-architecture/replication-zero-downtime.gif" alt="零停机升级" width="75%"/></p>


## 区域接近性

当用户位于不同的地区（例如冰岛和澳大利亚作为极端示例）时，由于数据库服务器与用户之间的物理距离，无法确保所有用户的低延迟。您只能将数据库服务器放置在一个地理位置上，因此问题是您将服务器放在哪里：
1. 选项1 - 将集群放在中间（例如印度）。<br/>
   所有用户的延迟都相对较高，因为数据需要在冰岛和印度之间以及澳大利亚和印度之间传输。

<p align="center"><img src="/img/docs/replication-architecture/replication-regional-proximity-1.png" alt="地理中心的集群" width="75%"/></p>

2. 选项2 - 将集群放置在靠近某个用户群体的地方（例如冰岛）<br/>
   冰岛的用户延迟非常低，而澳大利亚的用户延迟相对较高，因为数据需要长距离传输。

当您有将数据集群复制到两个不同地理位置的选项时，另一种选择出现了。这被称为多数据中心（Multi-DC）复制。
3. 选项3 - 在冰岛和澳大利亚都设置服务器集群的多数据中心复制。<br/>
   冰岛和澳大利亚的用户现在都可以享受低延迟，因为每个用户组都从本地集群提供服务。

<p align="center"><img src="/img/docs/replication-architecture/replication-regional-proximity-3.png" alt="Replication multi-dc" width="75%"/></p>

多数据中心复制还带来了额外的好处，即数据在更多的物理位置上具有冗余，这意味着在极少数情况下，如果整个数据中心发生故障，数据仍然可以从其他位置提供服务。

:::note
Note, Regional Proximity depends on the Multi-Datacenter feature of replication, which you can [vote for here](https://github.com/weaviate/weaviate/issues/2436).
:::




## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />