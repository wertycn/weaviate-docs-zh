---
image: og/docs/concepts.jpg
sidebar_position: 4
title: Consistency
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Related pages
- [API References | GraphQL | Get | Consistency Levels](../../api/graphql/get.md#consistency-levels)
- [API References | REST | Objects](../../api/rest/objects.md)
:::

数据一致性是指数据库中不同节点中的数据是否匹配的属性。在Weaviate中，可用性通常优先于强一致性。这并不意味着我们完全不关注一致性。模式和数据一致性与可能性一样重要。正如[CAP理论](./index.md#cap-theorem)所述，一致性和可用性是一种权衡。在Weaviate中，数据一致性是可调节的，所以你可以自行权衡A和C之间的关系。

模式一致性是不可调节的，但设置为强一致性协议。

一致性的强度可以通过应用以下条件来确定：
* 如果 r + w > n，则系统具有强一致性。
    * r 是读操作的一致性级别
    * w 是写操作的一致性级别
    * n 是复制因子（副本数）
* 如果 r + w <= n，则在此场景中可能达到的最佳一致性是最终一致性。

## 模式

Weaviate中的数据模式是**强一致性**的。一旦使用Weaviate，数据模式很少更改。从用户的角度来看，更新模式的延迟比查询和更新数据的延迟略高是可以接受的。通过"慢"的模式更新，Weaviate可以确保一致性，因为它不允许同时进行多个模式更改。

通过[Distributed Transaction](https://en.wikipedia.org/wiki/Distributed_transaction)算法来完成模式更新。这是在分布式网络中的不同节点上的数据库之间执行的一组操作。Weaviate使用[两阶段提交 (2PC)](https://en.wikipedia.org/wiki/Two-phase_commit_protocol)协议，在短时间内（毫秒级别）复制模式更新。

干净（无故障）的执行分为两个阶段：
1. 提交请求阶段（或投票阶段），协调器节点询问每个节点是否能够接收和处理更新。
2. 提交阶段，协调器将更改提交给节点。

## 数据对象

Weaviate中的数据对象具有**最终一致性**，这意味着如果数据在一段时间内没有更新，那么所有节点最终都会包含最新的数据。在数据更新后，可能会出现不是所有节点都已更新的情况，但是可以保证在一段时间后所有节点都将是最新的。Weaviate还使用了两阶段提交来处理对象，根据一致性级别进行了调整。例如，对于`QUORUM`写入（参见下文），如果有5个节点，将发送3个请求，每个请求在底层使用两阶段提交。

事件一致性提供了BASE语义：

* **基本可用**: 读写操作尽可能可用
* **柔性状态**: 由于更新可能尚未收敛，因此没有一致性保证
* **最终一致**: 如果系统运行足够长时间，在一些写操作之后，所有节点将达到一致状态。

为了确保高可用性，强一致性的选择是最终一致性。然而，写入和读取一致性是可以调整的，因此您对可用性和一致性之间的权衡有一定的影响。

*下面的动画是一个示例，演示了在具有3个复制因子和8个节点的情况下，使用Weaviate进行写入或读取操作。蓝色节点充当协调节点。一致性级别设置为`QUORUM`，因此协调节点在将结果返回给客户端之前只需等待三个响应中的两个。*

<p align="center"><img src="/img/docs/replication-architecture/replication-quorum-animation.gif" alt="写一致性QUORUM" width="75%"/></p>

### 可调节的写一致性

添加或更改数据对象是**写**操作。

:::note
Write operations are tunable starting with Weaviate v1.18, to `ONE`, `QUORUM` (default) or `ALL`. In v1.17, write operations are always set to `ALL` (highest consistency).
:::

在 v1.18 中引入可配置的写一致性的主要原因是同时引入了自动修复功能。无论选择的一致性级别如何，写操作始终会被写入 n（复制因子）个节点。然而，协调节点会等待来自 `ONE`、`QUORUM` 或 `ALL` 节点的确认后才返回。为了确保在读取请求中没有修复可用的情况下写操作应用到所有节点，现在将写一致性设置为 `ALL`。v1.18+ 中的可能设置有：
* **ONE** - 写操作必须从至少一个副本节点接收确认。这是最快（最可用）但一致性最低的选项。
* **QUORUM** - 写操作必须从至少 `QUORUM` 个副本节点接收确认。`QUORUM` 的计算公式为 _n / 2 + 1_，其中 _n_ 是副本数量（复制因子）。例如，使用副本因子为 6，那么 quorum 为 4，这意味着集群可以容忍 2 个副本节点离线。
* **ALL** - 写操作必须从所有副本节点接收确认。这是最一致的选项，但速度最慢（可用性最低）。

*下图：具有写一致性为 ONE 的复制 Weaviate 设置。总共有 8 个节点，其中 3 个是副本。*

<p align="center"><img src="/img/docs/replication-architecture/replication-rf3-c-ONE.png" alt="写一致性 ONE" width="60%"/></p>

*下图显示了具有`QUORUM`（n/2+1）写一致性的复制Weaviate设置。总共有8个节点，其中3个是副本。*

<p align="center"><img src="/img/docs/replication-architecture/replication-rf3-c-QUORUM.png" alt="写一致性QUORUM" width="60%"/></p>

*下图显示了具有`ALL`写一致性的复制Weaviate设置。总共有8个节点，其中3个是副本。*

<p align="center"><img src="/img/docs/replication-architecture/replication-rf3-c-ALL.png" alt="写入一致性 ALL" width="60%"/></p>


### 可调节的读一致性

读操作是对Weaviate中数据对象的GET请求。与写入一样，读一致性是可调节的，可以选择`ONE`、`QUORUM`（默认）或`ALL`。

:::note
Prior to `v1.18`, read consistency was tunable only for requests that [obtained an object by id](../../api/rest/objects.md#get-a-data-object), and all other read requests had a consistency of `ALL`.
:::

以下一致性级别适用于大多数读操作：

- 从 `v1.18` 开始，一致性级别适用于REST端点操作。
- 从 `v1.19` 开始，一致性级别适用于GraphQL的 `Get` 请求。

* **ONE** - 至少有一个副本必须返回读取响应。这是最快（最可用）但最不一致的选项。
* **QUORUM** - 必须由`QUORUM`数量的副本节点返回响应。`QUORUM`的计算方式为 _n / 2 + 1_，其中 _n_ 是副本数（复制因子）。例如，使用复制因子为6，那么`QUORUM`为4，这意味着集群可以容忍2个副本离线。
* **ALL** - 所有副本必须返回读取响应。如果至少有一个副本未能响应，则读取操作将失败。这是最一致性但最慢（最不可用）的选项。

示例：
* **ONE**<br/>
  在一个具有3个副本节点和一致性级别为ONE的单个数据中心中，协调节点将等待来自一个副本节点的响应。

  <p align="center"><img src="/img/docs/replication-architecture/replication-rf3-c-ONE.png" alt="Write consistency ONE" width="60%"/></p>

* **QUORUM**<br/>
  在一个具有复制因子为3和读一致性级别为`QUORUM`的单个数据中心中，协调节点将等待n / 2 + 1 = 3 / 2 + 1 = 2个副本节点返回响应。

<p align="center"><img src="/img/docs/replication-architecture/replication-rf3-c-QUORUM.png" alt="写一致性级别QUORUM" width="60%"/></p>


* **ALL**<br/>
  在一个具有复制因子为3和读一致性级别为`ALL`的单个数据中心中，协调器节点将等待所有3个副本节点返回响应。

<p align="center"><img src="/img/docs/replication-architecture/replication-rf3-c-ALL.png" alt="Write consistency ALL" width="60%"/></p>

### 可调整的一致性策略

根据一致性和速度之间的权衡需求，以下是三种常见的写入/读取操作一致性级别配对。这些是确保最终一致性数据的“最低”要求：
* `QUORUM` / `QUORUM` => 平衡的写入和读取延迟
* `ONE` / `ALL` => 快速写入和慢速读取（针对写入进行优化）
* `ALL` / `ONE` => 慢速写入和快速读取（针对读取进行优化）

## 修复

在发现不一致性的情况下，Weaviate可以执行修复操作。可能需要进行修复的一种情况是：用户以`ONE`一致性级别进行写入操作，但在向其他节点发送请求之前，节点发生了故障。节点重新启动时携带了最新的数据，但其他一些节点可能已经不同步，需要进行修复操作。

修复操作在后台进行，例如在执行读操作时（"读时修复"），使用"最后写入优先"的冲突解决策略。

当复制协调节点从副本集中的节点接收到不同版本的对象用于读取请求时，这意味着至少有一个节点拥有旧的（过期的）对象。修复读取功能意味着协调节点将使用最新版本的对象更新受影响的节点。如果一个节点完全缺少一个对象（例如，因为由于网络分区，创建请求仅由一部分节点处理），则该对象将被复制到该节点上。

考虑这样一个场景，即删除对象的请求仅由副本集中的一部分节点处理。在涉及到已删除对象的下一个读取操作中，复制协调器可能会确定某些节点缺少该对象 - 即该对象在所有副本中都不存在。`v1.18`引入的更改使得复制协调器能够确定对象未找到的原因（即被删除或从未存在），以及对象本身。因此，协调器可以确定对象是否：
* 从一开始就不存在（因此应该传播到其他节点），或者
* 从某些副本中删除了，但在其他副本中仍然存在。在后一种情况下，协调器会返回一个错误，因为它不知道对象在被删除后是否重新创建，这将导致传播删除从而导致数据丢失。

只有在使用足够高的一致性级别查询对象时，从未存在的对象才会传播到其他节点，与用于写入对象的写入一致性级别相比：
- 如果写入一致性级别为 `QUORUM`，则读取一致性级别可以是 >= `QUORUM`。
* 如果写入操作使用了`ONE`一致性级别，那么读取操作必须使用`ALL`一致性级别来保证修复。这是因为如果只有一个节点收到了写入请求，那么使用`QUORUM`一致性级别的读取请求可能只会命中没有该对象的节点，而使用`ALL`请求将会命中该节点。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />