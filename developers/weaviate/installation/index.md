---
image: og/docs/installation.jpg
sidebar_position: 0
title: How to install Weaviate
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Related pages
- [WCS Quickstart](../../wcs/quickstart.mdx)
- [References: Configuration](../configuration/index.md)
:::

## 概述

本节将向您展示运行Weaviate的可用选项，以及如何在每个选项中安装和配置Weaviate。

## 如何运行Weaviate

您有多个选项可以运行Weaviate。

* [Weaviate云服务](../../wcs/quickstart.mdx) - 一个托管的Weaviate服务；适用于开发和生产环境。
* [Docker Compose](./docker-compose.md) - 通常用于开发环境。
* [Kubernetes](./kubernetes.md) - 通常用于生产环境设置。
* [嵌入式Weaviate](./embedded.md) - 通过客户端进行内联实例化（实验性功能）。

:::tip Weaviate Cloud Services docs have a new home
[Check it out here](../../wcs/index.mdx). Or go straight to the [WCS quickstart guide](../../wcs/quickstart.mdx) which covers installation.
:::

无论是通过Weaviate云服务（WCS）还是下载开源版本，Weaviate库都是相同的。唯一的区别是WCS为您管理Weaviate实例，并附带特定的SLA，而Weaviate开源版本则使用[BSD-3许可证](https://github.com/weaviate/weaviate/blob/master/LICENSE)。

:::info configuration yaml files
Both Docker Compose and Kubernetes setups use a yaml file for customizing Weaviate instances, typically called `docker-compose.yml` or `values.yaml` respectively. These files will be referred to throughout the documentation as `configuration yaml files`.
:::

:::tip Docker <i class="fa-regular fa-circle-arrow-right"></i> Kubernetes
If self-hosting, we recommend starting with Docker and gaining familiarity with Weaviate and its configurations. You can later apply this knowledge when you are creating your Helm charts.
:::

### 运行未发布的版本

您可以使用 `docker-compose` 运行 Weaviate，构建自己的容器，基于 [`master`](https://github.com/weaviate/weaviate) 分支。请注意，这可能不是一个官方发布版本，可能包含错误。

```sh
git clone https://github.com/weaviate/weaviate.git
cd weaviate
docker build --target weaviate -t name-of-your-weaviate-image .
```

然后，使用这个新的镜像创建一个 `docker-compose.yml` 文件。例如：

```yml
version: '3.4'
services:
  weaviate:
    image: name-of-your-weaviate-image
    ports:
      - 8080:8080
    environment:
      CONTEXTIONARY_URL: contextionary:9999
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: './data'
      ENABLE_MODULES: 'text2vec-contextionary'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-contextionary'
      AUTOSCHEMA_ENABLED: 'false'
  contextionary:
    environment:
      OCCURRENCE_WEIGHT_LINEAR_FACTOR: 0.75
      EXTENSIONS_STORAGE_MODE: weaviate
      EXTENSIONS_STORAGE_ORIGIN: http://weaviate:8080
      NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE: 5
      ENABLE_COMPOUND_SPLITTING: 'false'
    image: semitechnologies/contextionary:en0.16.0-v1.2.1
```

构建完成后，您可以使用docker-compose运行这个Weaviate构建: `docker-compose up`。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />