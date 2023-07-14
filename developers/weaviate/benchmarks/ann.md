---
image: og/docs/benchmarks.jpg
sidebar_position: 1
title: ANN
---

import Badges from '/_includes/badges.mdx';

<Badges/>

# 关于这个基准测试

这个基准测试旨在衡量和展示Weaviate在一系列实际应用场景中的ANN性能。

:::note
This is not a comparative benchmark that runs Weaviate against competing
solutions.
:::

为了充分利用这个基准测试，您可以从不同的角度来看待它：

- **整体性能** – 查看下面的[基准测试结果部分](#results)以得出关于在生产环境中可以期望从Weaviate中获得什么样的结果的结论。
- **针对您的用例的期望** – 找到与您的生产用例最相似的数据集，并估计Weaviate在您的用例中的预期性能。
- **微调** - 如果你没有得到期望的结果，请找到配置参数（efConstruction、maxConnections和ef）的最佳组合，以实现生产配置的最佳结果。

## 正在测量什么？

对于每个基准测试，我们选择了以下参数：
- **efConstruction** - 控制构建时搜索质量的HNSW构建参数。
- **maxConnections** - 控制外向连接数量的HNSW构建参数。
  - **ef** - HNSW图中每个节点可以拥有的边数。
- **ef** - HNSW查询时间的参数，控制搜索的质量。

对于每组参数，我们运行了10000个请求，并测量了以下指标：

- **Recall@1**，**Recall@10**，**Recall@100** - 通过将Weaviate的结果与每个数据集中指定的真实结果进行比较
- **多线程每秒查询次数（QPS）** - 您可以使用每个配置实现的总吞吐量
- **单个请求延迟（平均值）** - 所有10,000个请求的平均延迟
- **P99延迟** - 99%的请求（10,000个中的9,900个）的延迟小于或等于此数字 - 这显示了速度有多快
- **导入时间** - 由于不同的构建参数会对导入时间产生影响，因此还包括导入时间

按请求来说，我们指的是：
在给定的测试中，对整个数据集进行无筛选的向量搜索。
延迟和吞吐量结果代表了您的用户实际体验到的端到端时间。具体来说，这意味着：

* 每个请求时间包括通过网络发送结果的网络开销。在测试环境中，客户端和服务器机器位于同一个VPC中。
* 每个请求包括从磁盘中检索所有匹配的对象。这与`ann-benchmarks`有着显著的不同，后者仅返回匹配的ID。

## 基准测试设置

### 脚本

此基准测试使用[开源脚本](https://github.com/weaviate/weaviate-benchmarking)生成，因此您可以自行复现。

### 硬件

![Weaviate和基准测试机器的设置](/img/docs/weaviate_benchmark_setup.png)

为了进行这个基准测试，我们使用了同一个VPC中的两个GCP实例：

* **基准测试** - 一个带有30个vCPU核心和120 GB内存的`c2-standard-30`实例，用于托管Weaviate。
* **脚本** - 一个包含8个虚拟CPU的较小实例，用于运行基准测试脚本。

💡 `c2-standard-30` 被选择用于基准测试有两个原因:

* 它足够大以展示 Weaviate 是一个高并发的向量搜索引擎，并且在多个线程上运行数千次搜索时具有良好的扩展性。
* 它足够小以代表一个典型的生产案例，而不会引起高成本。

根据您的吞吐量要求，很可能您将运行 Weaviate
在生产环境中，您可以在较小或较大的机器上运行。

在[下面的这个部分](#what-happens-if-i-run-with-fewer-or-more-cpu-cores-than-on-the-example-test-machine)中，我们已经概述了在更改配置或设置参数时应该期望的情况。

### 实验设置

数据集的选择是基于[ann-benchmarks](https://github.com/erikbern/ann-benchmarks)进行建模的。使用相同的测试查询来测试速度、吞吐量和召回率。提供的基准
用于计算召回率的是真实值。

导入操作是使用Weaviate的Python客户端执行的。并发（多线程）查询是使用Go进行测量的。每种语言的性能可能会有所不同，如果您使用其他语言发送查询，可能会得到不同的结果。为了实现最大吞吐量，我们建议使用[Go](/developers/weaviate/client-libraries/go.md)或[Java](/developers/weaviate/client-libraries/java.md)客户端。

完整的导入和测试脚本可以在[这里](https://github.com/weaviate/weaviate-benchmarking)找到。

## 结果

:::info A guide for picking the right dataset
   The following results section contains multiple datasets. To get the most of
   this benchmark, pick the dataset that is closest to the use case that
   reflects your data in production based on the following criteria:

   <ul>
     <li><strong>SIFT1M</strong> - A dataset containing 1 million objects of
     128d and using l2 distance metrics. This dataset reflects a common
     use case with a small number of objects.</li>
     <li><strong>Glove-25</strong> - While similar in data size to SIFT1M, each
     vector only has 25 dimensions in this dataset. Because of the smaller
     vectors Weaviate can achieve the highest throghput on this dataset. The
     distance metric used is angular (cosine distance).</li>
     <li><strong>Deep Image 96</strong> - This dataset contains 10 million objects
     at 96d, and is therefore about 10 times as large as SIFT1M. The throughput
     is only slightly lower than that of the SIFT1M. This dataset gives you a
     good indication of expected speeds and throughputs when datasets
     grow.</li>
     <li><strong>GIST 960</strong> - This dataset contains 1 million objects at
     960d.  It has the lowest throughput of the datasets outlined. It
     highlights the cost of vector comparisons with a lot of dimensions. Pick
     this dataset if you run very high-dimensional loads.</li>

   </ul>
:::

对于每个数据集，都有一个突出显示的配置。突出显示的配置是对于召回率/延迟/吞吐量的一个有见地的取舍。突出显示的部分将为您提供关于Weaviate在相应数据集上性能的概览。在突出显示的配置下面，您可以找到替代配置。

### SIFT1M（1百万个128维向量，L2距离）

#### 突出显示的配置

<!-- TODO：如果需要，为表格添加格式 -->
| **1.0M** | **128** | **l2** | **128** | **32** | **64** |
| --- | --- | --- | --- | --- |
| 数据集大小 | 维度 | 距离度量 | efConstruction | 最大连接数 | ef |

| **98.83%** | **8905** | **3.31ms** | **4.49ms** |
| --- | --- | --- | --- |
| Recall@10 | QPS（限制为10） | 平均延迟（限制为10） | p99延迟（限制为10） |

#### 所有结果

#### QPS与Recall比较

![SIFT1M基准测试结果](./img/benchmark_sift_128.png)

import AnnSift128 from '/_includes/ann-sift-128.mdx';

<AnnSift128/>

import AnnReadResultsTable from '/_includes/ann-read-results-table.mdx';

<AnnReadResultsTable/>

### Glove-25（1.2M 25d向量，余弦距离）

#### 高亮配置

| **1.28M** | **35** | **cosine** | **64** | **16** | **64** |
| --- | --- | --- | --- | --- |
| 数据集大小 | 维度 | 距离度量 | efConstruction | maxConnections | ef |

| **95.56%** | **15003** | **1.93ms** | **2.94ms** |
| --- | --- | --- | --- |
| Recall@10 | QPS（限制10） | 平均延迟（限制10） | p99延迟（限制10） |

#### 所有结果

#### QPS vs Recall

![Glove25基准测试结果](./img/benchmark_glove_25.png)

import AnnGlove25 from '/_includes/ann-glove-25.mdx';

<AnnGlove25/>

<AnnReadResultsTable/>

### Deep Image 96（9.99M 96维向量，余弦距离）

#### 高亮配置

| **9.99M** | **96** | **cosine** | **128** | **32** | **64** |
| --- | --- | --- | --- | --- |
| 数据集大小 | 维度 | 距离度量 | efConstruction | maxConnections | ef |

| **96.43%** | **6112** | **4.7ms** | **15.87ms** |
| --- | --- | --- | --- |
| Recall@10 | QPS（限制10） | 平均延迟（限制10） | p99延迟（限制10） |

#### 所有结果

#### QPS与Recall的比较

![深度图像96基准测试结果](./img/benchmark_deepimage_96.png)

import AnnDeep96 from '/_includes/ann-deep-96.mdx';

<AnnDeep96/>

<AnnReadResultsTable/>

### GIST 960（1.0M 960d向量，余弦距离）

#### 突出显示的配置

| **1.00M** | **960** | **余弦** | **512** | **32** | **128** |
| --- | --- | --- | --- | --- |
| 数据集大小 | 维度 | 距离度量 | efConstruction | maxConnections | ef |

| **94.14%** | **1935** | **15.05ms** | **19.86ms** |
| --- | --- | --- | --- |
| Recall@10 | QPS（限制10个） | 平均延迟（限制10个） | p99延迟（限制10个） |

#### 所有结果

#### QPS与Recall比较

![GIST 960基准测试结果](./img/benchmark_gist_960.png)

import AnnGist960 from '/_includes/ann-gist-960.mdx';

<AnnGist960/>

<AnnReadResultsTable/>

## 了解更多和常见问题

### 延迟和吞吐量有什么区别？

延迟是指完成单个请求所需的时间。通常通过对所有请求进行平均或百分位分布来进行测量。例如，平均延迟为5ms表示单个请求平均需要5ms完成。这并不说明有多少个查询可以同时进行。
在给定的时间范围内可以回答。

如果Weaviate是单线程的，每秒的吞吐量大致等于1秒除以平均延迟。例如，如果平均延迟为5毫秒，这意味着每秒可以回答200个请求。

然而，在现实中，你往往不会有一个用户接着一个发送查询。相反，你有多个用户同时发送查询。这使得查询端并发。同样，Weaviate可以处理并发的传入请求。
我们可以通过测量吞吐量来确定服务器可以同时处理多少并发请求。

我们可以将之前的单线程计算结果乘以服务器的CPU核心数，这将给我们一个大致的估计，服务器可以同时处理多少请求。然而，最好不要仅仅依靠这个计算结果，而是持续地测量实际的吞吐量。这是因为这样的扩展可能并不总是线性的。例如，可能存在同步问题。
用于保证并发访问安全的机制，例如锁。这些机制不仅本身会产生开销，而且如果实现不正确，还可能导致拥塞，进一步降低并发吞吐量。因此，您无法执行单线程基准测试，并推断多线程环境下的数字会如何。

本基准测试中列出的所有吞吐量数字（"QPS"）都是实际的数据。
多线程测量在一个30核心的机器上进行，而不是估计值。

### 什么是p99延迟？

平均延迟给出了所有请求测量值的平均值。这是一个很好的指标，可以告诉用户平均情况下他们需要等待多长时间才能完成请求。基于这个平均值，你不能对用户的等待时间做出任何承诺。100个用户中有90个可能会看到更好的时间，但剩下的10个可能会看到明显更差的时间。

为了给出更精确的指示，使用基于百分位数的延迟。99th百分位延迟 - 或简称为"p99延迟" - 表示99%的请求中最慢的请求。换句话说，99%的用户将体验到等于或优于所述值的时间。这比平均值要好得多。

在生产环境中，要求 - 如在SLA中所述 - 通常是吞吐量和百分位延迟的组合。例如，以下说明
"3000 QPS at p95 latency of 20ms" 表达了以下含义。

- 每秒需要成功完成3000个请求。
- 95% 的用户的延迟必须为20ms或更低。
- 对于剩下的5% 的用户，没有假设，暗示他们的延迟可能高于20ms。

百分位数越高（例如 p99 相对于 p95），引用的延迟就越"安全"。因此，我们决定在我们的测量中使用 p99 延迟而不是 p95 延迟。

### 如果在示例测试机器上运行时使用较少或较多的CPU核心会发生什么？

基准测试中提供了每核心每秒请求数（QPS）的测量。这可以帮助您大致估计在更小或更大的机器上吞吐量会如何变化。如果您不需要所述的吞吐量，您可以使用较少的CPU核心运行。如果您需要更高的吞吐量，您可以使用更多的CPU核心运行。

请注意，由于同步机制、磁盘和内存瓶颈，添加更多的CPU可能会出现收益递减的情况。超过这个点之后，您可以选择水平扩展而不是垂直扩展。使用复制进行水平扩展将很快在Weaviate中提供。

### ef、efConstruction和maxConnections是什么？

这些参数是指[HNSW构建和查询的相关参数]
[parameters](/developers/weaviate/configuration/indexes.md#how-to-configure-hnsw)。它们代表了召回率、延迟和吞吐量、索引大小以及内存消耗之间的权衡。这个权衡在基准测试结果中得到了突显。

### 如果我在自己的设置中无法匹配相同的延迟/吞吐量，我该如何进行调试？

如果在您自己的数据集中遇到其他数字，以下是一些需要注意的提示：

* 您使用的是什么CPU架构？上述基准测试是在GCP的`c2` CPU类型上运行的，该类型基于`amd64`架构。Weaviate还支持`arm64`架构，但并非所有优化都存在。如果您的机器显示最大CPU使用率但无法达到相同的吞吐量，请考虑将CPU类型切换为此基准测试中使用的类型。

* 您是使用真实数据集还是随机向量？已知HNSW在性能上表现良好。
  使用随机向量比使用真实世界数据集要差得多。这是因为真实世界数据集中的点分布与随机生成的向量不同。如果您无法在随机向量上实现上述性能（或召回率），请切换到实际数据集。

* 您的磁盘速度足够快吗？虽然ANN搜索本身受CPU限制，但在搜索完成后，必须从磁盘中读取对象。Weaviate
  使用内存映射文件来加速此过程。然而，如果内存不足或操作系统已经将缓存的页面分配给其他位置，就需要进行物理磁盘读取。如果您的磁盘速度较慢，那么您的基准测试可能会受到磁盘的限制。

* 您是否使用了超过200万个向量？如果是，请确保设置[足够大的向量缓存](/developers/weaviate/concepts/resources.md#vector-cache)以获得最佳性能。

### 我在哪里可以找到运行这个基准测试的脚本？

[仓库在这里](https://github.com/weaviate/weaviate-benchmarking)。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />