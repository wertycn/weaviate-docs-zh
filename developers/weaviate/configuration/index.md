---
image: og/docs/configuration.jpg
sidebar_position: 0
title: How to configure Weaviate
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- :::caution 迁移自:
- `配置`
- `模式`来自于`模式/模式配置`
- `数据类型`来自于`模式/数据类型`
- `距离度量`来自于`向量索引插件/距离度量`
- `模块`基本上是新的 - 之前的`配置/模块`内容已迁移到`参考:模块/index`
- `向量索引`添加了有关配置选项的文本，来自`向量索引插件/HNSW`
::: -->

## Overview

This section shows you how to configure Weaviate to suit your specific needs.

For example, you can read about how to:

- Extend Weaviate's functionality by adding [modules](./modules.md), including vectorizers
- Configure how Weaviate stores and indexes data through its [schema](./schema-configuration.md), [data type](../config-refs/datatypes.md) and [distance metric](../config-refs/distances.md)
- Manage performance vs. cost tradeoffs by its [vector index properties](./indexes.md)
- [Back up](./backups.md) your Weaviate instance
- Control access through [authentication](./authentication.md) and [authorization](./authorization.md)
- [Monitor](./monitoring.md) your Weaviate instance

You do not need to read this section linearly. But we do recommend that you browse through this section so that you are aware of the available main customization options, including features that will help you to take it into production.