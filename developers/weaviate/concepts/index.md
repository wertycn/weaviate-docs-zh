---
image: og/docs/concepts.jpg
sidebar_position: 0
title: Concepts
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- :::caution 迁移自：
- `核心知识`
  - `数据对象`，来自`核心知识/基础知识`
  - `模块`：结合了`配置/模块`和`模块/索引`的理论解释
- `架构`
- `向量索引`，来自`向量索引 (ANN) 插件:索引`和`HNSW`
  - 注意：`HNSW`的配置选项现在在`参考资料: 配置/向量索引#如何配置HNSW`中
::: -->

## Overview

The **Concepts** section explains various aspects related to Weaviate and its architecture to help you get the most out of it. You can read these sections in any order.

:::info
如果您需要实际的指南，请尝试[快速入门教程](/developers/weaviate/quickstart/index.md)。
:::

## Core concepts

**[Data structure](./data.md)**

- How Weaviate deals with data objects, including how they are stored, represented, and linked to each other.

**[Modules](./modules.md)**

- An overview of Weaviate's module system, including what can be done with modules, existing module types, and custom modules.

**[Indexing](./indexing.md)**

- Read how data is indexed within Weaviate using inverted and ANN indices, and about configurable settings.

**[Vector indexing](./vector-index.md)**

- Read more about Weaviate's vector indexing architecture, such as the HNSW algorithm, distance metrics, and configurable settings.

## Weaviate Architecture

The figure below gives a 30,000 feet view of Weaviate's architecture.

[![Weaviate module APIs overview](./img/weaviate-architecture-overview.svg "Weaviate System and Architecture Overview")](./img/weaviate-architecture-overview.svg)

You can learn more about the individual components in this figure by following the below guides:

**[Learn about storage inside a shard](./storage.md)**
  * How Weaviate stores data
  * How Weaviate makes writes durable
  * How an inverted index, a vector index and an object store interact with each other

**[Ways to scale Weaviate horizontally](./cluster.md)**
  * Different motivations to scale
  * Sharding vs. Replication
  * Configuring a cluster
  * Consistency

**[How to plan resources](./resources.md)**
  * The roles of CPU, Memory and GPUs
  * How to size a cluster correctly
  * Speeding up specific processes
  * Preventing bottlenecks

**[Filtered vector search](./prefiltering.md)**
  * Combine vector search with filters
  * Learn how combining an HNSW with an inverted index leads to high-recall, high-speed filtered queries

**[User-facing interfaces](./interface.md)**
  * Design philosophy behind user-facing APIs
  * Role of the REST and GraphQL APIs

**[Replication architecture](./replication-architecture/index.md)**
  * About replication
  * Weaviate's implementation
  * Use cases

## More resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />