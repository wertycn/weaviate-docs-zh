---
image: og/docs/configuration.jpg
sidebar_position: 7
title: Enterprise Usage Collector
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- 目前已隐藏，因为不再使用；将来会被移除。 -->
## 简介

在使用Weaviate Enterprise时，会在用户（或负载均衡器）和Weaviate之间放置一个代理服务。该服务通过不发送任何敏感信息（例如函数、持续时间、负载大小）来测量Weaviate的使用情况。以下是如何将代理服务添加到您的设置中的概要。

## 1. 收集 Weaviate 企业版令牌

- 登录 [Weaviate 控制台](https://console.weaviate.cloud)。
- 在顶部菜单中点击个人资料图标，收集显示给您的密钥。请注意，此密钥是机密的，不应在公共代码库中公开。

## 2. 将 Weaviate 企业版使用收集器添加到您的 Docker-compose 文件中

如果您正在使用安装配置工具生成的Docker-compose文件，您需要将以下代码块添加到您的YAML文件中。

```yaml
services:
    enterprise-proxy:
    image: semitechnologies/weaviate-enterprise-usage-collector:latest
    environment:
      - weaviate_enterprise_token=[[ WEAVIATE TOKEN ]]
      - weaviate_enterprise_project=[[ PROJECT NAME ]]
    links:
      - "weaviate:weaviate.com"
    ports:
      - "8080:8080"
    depends_on:
      - weaviate
```

* `weaviate_enterprise_token` = 在前一步骤中收集到的令牌。
* `weaviate_enterprise_project` = 可以是您选择的任意标识符，用于标识 Weaviate 集群。例如，如果您有开发和生产环境的设置，可以选择 `weaviate_enterprise_project=my-project-dev` 和 `weaviate_enterprise_project=my-project-prod`。

## 3. 设置 Weaviate 端口以重定向到代理

因为您将所有流量通过企业代理进行路由，所以您必须确保Weaviate接受端口4000上的传入流量。

```yaml
services:
  weaviate:
    command:
    - --port
    - '4000' # <== SET TO 4000
    # rest of the docker-compose.yml
```

## 使用Docker Compose配置工具

您还可以使用Docker Compose的[配置工具](/developers/weaviate/installation/docker-compose.md#configurator)。确保为企业使用收集器选项选择`Enabled`。

## 使用Helm在Kubernetes上进行代理配置

按照步骤1中所述获取您的令牌。

获取Weaviate的[helm chart](https://github.com/weaviate/weaviate-helm/releases)版本为`||site.helm_version||`或更高版本。

在`values.yaml`文件中启用代理并使用`collector_proxy`键配置代理，如下所示：
```
collector_proxy:
  enabled: true
  tag: latest
  weaviate_enterprise_token: "00000000-0000-0000-0000-000000000000"
  weaviate_enterprise_project: "demo_project"
  service:
    name: "usage-proxy"
    port: 80
    type: LoadBalancer
```

部署Helm Chart，并确保在您的请求中使用代理服务。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />