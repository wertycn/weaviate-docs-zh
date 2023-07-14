---
image: og/docs/quickstart-tutorial.jpg
sidebar_position: 90
title: Weaviate console - an introduction
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

在这里，您可以学习如何使用Weaviate控制台。

Weaviate控制台允许您连接到在Weaviate云服务上运行的Weaviate实例（我们的SaaS解决方案），您自己的集群，您的本地计算机或所有公共演示数据集。请注意，控制台永远不会从您的Weaviate实例中收集任何数据；您可以安全地连接每个实例，甚至通过VPN连接。

:::tip
The console is available on: [console.weaviate.cloud](https://console.weaviate.cloud).
:::

## 登录页面

打开[Weaviate控制台](https://console.weaviate.cloud)后，您将看到两个选项：

1. ["使用Weaviate云服务登录"](#weaviate-cloud-services)
2. ["自托管的Weaviate"](#connect-to-a-self-hosted-weaviate)

## Weaviate云服务

Weaviate云服务允许您在我们的基础设施上创建Weaviate实例作为SaaS实例。除了后者由我们管理之外，本地运行的Weaviate实例和Weaviate SaaS实例之间没有区别。

import SandBoxExpiry from '/_includes/sandbox.expiry.mdx';

<SandBoxExpiry/>

## 连接到自托管的Weaviate实例

只要您的计算机可以访问，您可以连接到任何Weaviate实例（是的，包括通过VPN）。GraphiQL编辑器在本地运行，我们不会将任何结果或查询转发到我们的服务器。

连接成功后，您可以使用[GraphiQL](#graphiql)界面与您的Weaviate实例进行交互。

## GraphiQL

[GraphiQL](https://github.com/graphql/graphiql) 是一个图形化界面，允许您交互式地编写GraphQL查询，并提供自动完成和内联文档。感兴趣吗？使用新闻发布数据集，立即尝试控制台 [此链接](https://link.weaviate.io/3ThS9hG)。

## 尝试控制台

1. 前往：[此链接](https://link.weaviate.io/3ThS9hG)
2. 开始查询 :)

## 使用自己的实例尝试控制台

1. 前往：[https://console.weaviate.cloud](https://console.weaviate.cloud)
2. 在自托管的Weaviate部分，提供您实例的端点。如果您在本地运行Weaviate，则为`http://localhost:8080`。
3. 点击"connect"

:::note
The console might ask to downgrade to HTTP. This is done to avoid [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) errors.
:::

## 概述

* 您可以使用Weaviate控制台连接到任何Weaviate实例。
* 您可以使用Weaviate控制台连接到Weaviate云服务，创建托管的Weaviate实例。
* 由于Weaviate使用GraphQL，您可以通过控制台的GraphiQL集成轻松查询它。

## 下一步是什么？

- [参考：安装](../installation/index.md)
- [参考：配置](../configuration/index.md)
- [参考：API](../api/index.md)
- [概念](../concepts/index.md)
- [路线图](../roadmap/index.md)


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />