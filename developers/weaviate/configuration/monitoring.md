---
image: og/docs/configuration.jpg
sidebar_position: 50
title: Monitoring
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

Weaviate可以提供与Prometheus兼容的指标以进行监控。可以使用标准的Prometheus/Grafana设置在各种仪表板上可视化指标。

可以使用指标来测量请求延迟、导入速度、在向量存储和对象存储上花费的时间、内存使用情况、应用程序使用情况等等。

## 配置监控

### 在Weaviate中启用监控

要告诉Weaviate收集指标并以兼容Prometheus的格式公开它们，只需要设置以下环境变量：

```sh
PROMETHEUS_MONITORING_ENABLED=true
```

默认情况下，Weaviate将在 `<hostname>:2112/metrics` 上公开指标。您还可以通过以下环境变量将端口更改为自定义端口：

```sh
PROMETHEUS_MONITORING_PORT=3456
```

### 从Weaviate中抓取指标

通常，指标会被抓取到时间序列数据库中，比如Prometheus。
如何消费指标取决于您的设置和环境。

[Weaviate示例仓库包含了一个完全预配置的设置，使用Prometheus、Grafana和一些示例仪表板](https://github.com/weaviate/weaviate-examples/tree/main/monitoring-prometheus-grafana)。
您可以通过一个命令启动一个包含监控和仪表板的完整设置。
在这个设置中，使用了以下组件:

* 使用Docker-compose来提供一个完全配置好的设置，可以通过一个命令启动。
* Weaviate被配置为按照上面的部分所述公开Prometheus指标。
* 启动了一个Prometheus实例，并配置为每15秒从Weaviate中抓取指标。
* 启动了一个Grafana实例，并配置为使用该设置。
  作为指标提供者，Prometheus实例还运行了一个包含几个示例仪表板的仪表板提供者。

### 多租户

在使用多租户时，建议将`PROMETHEUS_MONITORING_GROUP` [环境变量](../config-refs/env-vars.md) 设置为`true`，以便将所有租户的数据分组进行监控。

## 可获取的指标

通过Weaviate的指标系统可以获取以下指标的列表
不断扩展中。以下是一些值得注意的指标及其用途。

通常，指标非常细粒度，因为它们随后可以进行聚合。例如，如果粒度为“分片”，则可以聚合同一“类别”的所有“分片”指标以获得类别指标，或者聚合所有指标以获得整个Weaviate实例的指标。

| 指标 | 描述 | 标签 | 类型 |
| --- | --- | --- | --- |
| `batch_durations_ms` | 单个批处理操作的持续时间（单位：毫秒）。`operation`标签进一步定义了批处理中使用的操作类型（例如，对象、倒排、向量）。粒度是一个类的分片。 | `operation`，`class_name`，`shard_name` | 直方图 |
| `batch_delete_durations_ms` | 批量删除操作的持续时间（毫秒）。`operation`标签进一步定义了所测量的批量删除操作的具体操作。粒度是一个类别的分片 | `class_name`，`shard_name` | 直方图 |
| `objects_durations_ms` | 表示单个对象操作（例如`put`、`delete`等）的持续时间，由`operation`标签指示，也作为批处理的一部分。`step`标签为每个`operation`提供了额外的精度。粒度是一个类别的分片。 | `class_name`、`shard_name` | 直方图 |
| `object_count` | 表示对象的数量。粒度是一个类别的分片。 | `class_name`、`shard_name` | 计数器 |
| `async_operations_running` | 当前正在运行的异步操作的数量。操作本身通过 `operation` 标签定义。 | `operation`，`class_name`，`shard_name`，`path` | Gauge |
| `lsm_active_segments` | 每个分片当前存在的段的数量。粒度是类的分片。按 `strategy` 分组。| `strategy`，`class_name`，`shard_name`，`path` | Gauge |
| `lsm_bloom_filter_duration_ms` | 每个分片的布隆过滤器操作持续时间（以毫秒为单位）。粒度为类的分片。按`strategy`分组。 | `operation`，`strategy`，`class_name`，`shard_name` | 直方图 |
| `lsm_segment_objects` | 每个LSM段的条目数按级别划分。粒度为类的分片。按`strategy`和`level`分组。 | `operation`，`strategy`，`class_name`，`shard_name`，`path`，`level` | 计量器 |
| `lsm_segment_size` | LSM段的大小，按级别和单位划分。 | `strategy`, `class_name`, `shard_name`, `path`, `level`, `unit` | 测量器 |
| `lsm_segment_count` | 每个级别的段数 | `strategy`, `class_name`, `shard_name`, `path`, `level` | 测量器 |
| `vector_index_tombstones` | 向量索引中当前活动墓碑的数量。每次删除操作时会增加，完成修复操作后会减少。 | `class_name`, `shard_name`  | 测量器 |
| `vector_index_tombstone_cleanup_threads` | 在删除操作发生后，用于修复/清理向量索引的当前活动线程数。 | `class_name`，`shard_name` | Gauge |
| `vector_index_tombstone_cleaned` | 修复操作后删除和移除的向量的总数。 | `class_name`，`shard_name` | Counter |
| `vector_index_operations` | 向量索引上的变异操作总数。操作本身由`operation`标签定义。 | `operation`、`class_name`、`shard_name` | Gauge |
| `vector_index_size` | 向量索引的总容量。通常比导入的向量数量要大，因为它会主动增长。 | `class_name`、`shard_name` | Gauge |
| `vector_index_maintenance_durations_ms` | 同步或异步向量索引维护操作的持续时间。操作本身通过`operation`标签进行定义。 | `operation`， `class_name`， `shard_name` | 直方图 |
| `vector_index_durations_ms` | 常规向量索引操作的持续时间，例如插入或删除。操作本身通过`operation`标签定义。`step`标签为每个操作添加更多的细节。 | `operation`，`step`，`class_name`，`shard_name` | 直方图 |
| `startup_durations_ms` | 启动操作的单个持续时间（以毫秒为单位）。操作本身通过`operation`标签定义。 | `operation`，`class_name`，`shard_name` | 直方图 |
| `startup_diskio_throughput` | 启动操作中的磁盘I/O吞吐量，例如读取HNSW索引或恢复LSM段。操作本身由`operation`标签定义。 | `operation`，`step`，`class_name`，`shard_name` | 直方图 |
| `requests_total` | 跟踪所有用户请求的指标，用于确定请求是否成功或失败。 | `api`，`query_type`，`class_name` | `GaugeVec` |

扩展Weaviate的新指标非常容易，我们很乐意收到您的贡献。

### 版本控制

请注意，指标的版本控制不遵循Weaviate其他功能的语义版本控制准则。Weaviate的主要API是稳定的，破坏性变更非常罕见。然而，指标的功能生命周期较短。有时可能需要引入不兼容的更改或完全删除指标，例如，因为在生产环境中观察特定指标的成本过高。因此，Weaviate的次要版本发布可能对监控系统产生破坏性更改。如果是这样，将在发布说明中明确突出显示。

## 示例仪表板

Weaviate默认不提供任何仪表板，但以下是各个Weaviate团队在开发和帮助用户过程中使用的仪表板列表。这些仪表板没有提供支持，但可能仍然有帮助。将它们作为设计适合自己用途的仪表板的灵感：

| 仪表板 | 目的 | 预览 |
| --- | --- | --- |
| [将数据导入Weaviate](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/importing.json) | 可视化导入操作的速度（包括其组件，如对象存储，倒排索引和向量索引）。 | ![将数据导入Weaviate](./img/weaviate-sample-dashboard-importing.png "将数据导入Weaviate") |
| [对象操作](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/objects.json) | 可视化整个对象操作的速度，例如GET、PUT等。 | ![对象](./img/weaviate-sample-dashboard-objects.png "对象") |
| [向量索引](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/vectorindex.json) | 可视化当前状态以及对HNSW向量索引的操作 | ![向量索引](./img/weaviate-sample-dashboard-vector.png "向量索引") |
| [LSM 存储](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/lsm.json) | 获取有关 Weaviate 中各种 LSM 存储的内部信息（包括段）的洞察。 | ![LSM 存储](./img/weaviate-sample-dashboard-lsm.png "LSM 存储") |
| [启动](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/startup.json) | 可视化启动过程，包括恢复操作 | ![启动](./img/weaviate-sample-dashboard-startup.png "向量索引") |
| [使用情况](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/usage.json) | 获取使用情况指标，例如导入的对象数量等 | ![使用情况](./img/weaviate-sample-dashboard-usage.png "使用情况") |

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />