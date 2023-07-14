---
image: og/docs/modules/_title.jpg
sidebar_position: 0
title: References - Modules
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- :::caution 迁移自：
- `模块`
- 高级配置选项现在在 `Configuration/Modules` 中
- 一些理论元素现在在 `Concepts:Essential/Modules` 中 -->
::: -->

## Overview

:::info Related pages
- [配置: 模块](../configuration/modules.md)
- [概念: 模块](../concepts/modules.md)
这一部分介绍了Weaviate的各个模块，包括它们的功能和如何使用它们。

- Retrievers & Vectorizers模块（如`text2vec-*`或`img2vec-*`）将数据对象转换为向量。
- Readers & Generators模块在从Weaviate检索数据后处理数据，例如回答问题或总结文本。
- 其他模块包括其他所有模块，例如拼写检查模块。

## 通用信息

模块可以是"vectorizers"（定义向量中的数字如何从数据中选择）或提供其他功能的模块，如问答、自定义分类等。模块具有以下特点：
- 命名约定：
  - Vectorizer（Retriever模块）：`<media>2vec-<name>-<optional>`，例如`text2vec-contextionary`，`image2vec-RESNET`或`text2vec-transformers`。
  - 其他模块：`<functionality>-<name>-<optional>`，例如`qna-transformers`。
  - 模块名称必须是URL安全的，即不能包含需要URL编码的任何字符。
  - 模块名称不区分大小写。`text2vec-bert`和`text2vec-BERT`是同一个模块。
- 模块信息可以通过[`v1/modules/<module-name>/<module-specific-endpoint>` RESTful端点](../api/rest/modules.md)访问。
- 通用模块信息（已连接的模块、版本等）可以通过Weaviate的[`v1/meta`端点](../api/rest/meta.md)访问。
- 模块可以在RESTful API中添加`additional`属性和GraphQL API中的[`_additional`属性](../api/graphql/additional-properties.md)。
- 模块可以在GraphQL查询中添加[过滤器](../api/graphql/filters.md)。
- 哪个vectorizer和其他模块应用于哪些数据类别是在[模式](../configuration/schema-configuration.md#specify-a-vectorizer)中配置的。

## 默认的vectorizer模块

除非您在Weaviate的配置中指定了默认的向量化模块，否则您需要为您添加到数据模式的每个类别指定使用哪个向量化模块（或者您需要手动为您添加的每个数据点输入一个向量）。在docker-compose配置文件中，使用环境变量`DEFAULT_VECTORIZER_MODULE`将默认设置为`text2vec-contextionary`：

services:
  weaviate:
    environment:
      DEFAULT_VECTORIZER_MODULE: text2vec-contextionary
```

## Backup Modules

Backup and restore operations in Weaviate are facilitated by the use of backup provider modules.

These are interchangeable storage backends which exist either internally or externally. The following sections will explain the difference between these two types of backup provider modules, and their intended usages.

### External provider

External backup providers coordinate the storage and retrieval of backed-up Weaviate data with external storage services.

This type of provider is ideal for production environments. This is because storing the backup data outside of a Weaviate instance decouples the availability of the backup from the Weaviate instance itself. In the event of an unreachable node, the backup is still available.

Additionally, multi-node Weaviate clusters _require_ the use of an external provider. Storing a multi-node backup on internally on a single node presents several issues, like significantly reducing the durability and availability of the backup, and is not supported.

As of Weaviate `v1.18`, the supported external backup providers are:
- [S3](/developers/weaviate/configuration/backups.md#s3-aws-or-s3-compatible)
- [GCS](/developers/weaviate/configuration/backups.md#gcs-google-cloud-storage)
- [Azure](/developers/weaviate/configuration/backups.md#azure-storage)

Thanks to the extensibility of the module system, new providers can be readily added. If you are interested in an external provider other than the ones listed above, feel free to reach out via our [forum](https://forum.weaviate.io/), or open an issue on [GitHub](https://github.com/weaviate/weaviate).

### Internal provider

Internal providers coordinate the storage and retrieval of backed-up Weaviate data within a Weaviate instance. This type of provider is intended for developmental or experimental use, and is not recommended for production. Internal Providers are not compatible for multi-node backups, which require the use of an external provider.

As of Weaviate `v1.16`, the only supported internal backup provider is the [filesystem](/developers/weaviate/configuration/backups.md#filesystem) provider.

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />