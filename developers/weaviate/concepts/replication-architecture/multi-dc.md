---
image: og/docs/concepts.jpg
sidebar_position: 5
title: Multi-DataCenter
---

import Badges from '/_includes/badges.mdx';

<Badges/>

多数据中心（Multi-DC）复制使您能够在多个数据中心的多台服务器上拥有数据的多个副本。目前v1.17和v1.18版本尚不支持此形式的复制。当前版本的复制功能旨在以后支持多数据中心。如果您对此功能感兴趣，请为[此GitHub问题](https://github.com/weaviate/weaviate/issues/2436)点赞。

如果您的用户群分布在不同的地理位置（例如冰岛和澳大利亚），多数据中心复制将非常有益。当您将节点放置在用户群的不同本地区时，可以降低延迟。
多数据中心复制还具有额外的好处，即数据在更多的物理位置上具有冗余，这意味着在整个数据中心崩溃的极少数情况下，数据仍然可以从另一个位置提供服务。

目前，您可以假设所有副本节点都位于同一个数据中心。这样做的好处是节点之间的网络请求廉价且快速。但缺点是如果整个数据中心发生故障，将没有冗余备份。这个问题将在[实现后](https://github.com/weaviate/weaviate/issues/2436)通过多数据中心解决！

<p align="center"><img src="/img/docs/replication-architecture/replication-regional-proximity-3.png" alt="Replication multi-dc" width="75%"/></p>


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />