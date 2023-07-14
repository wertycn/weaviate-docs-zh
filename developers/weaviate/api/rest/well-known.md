---
image: og/docs/api.jpg
sidebar_position: 18
title: REST - /v1/.well-known
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## OpenID 配置
RESTful API 发现功能提供了有关是否启用 [OpenID Connect (OIDC)](/developers/weaviate/configuration/authentication.md) 认证的信息。如果配置了令牌，则端点将重定向到已发出的令牌。

#### 用法

发现端点接受 `GET` 请求：

```js
GET /v1/.well-known/openid-configuration
```

并且它返回以下字段：
- `href`：客户端的引用。
- `cliendID`：客户端的ID。

如果没有OIDC提供程序存在，将返回`404`代码。

#### 示例
以下命令：

import WellknownOpenIDConfig from '/_includes/code/wellknown.openid-configuration.mdx';

<WellknownOpenIDConfig/>

返回：

```json
{
  "href": "http://my-token-issuer/auth/realms/my-weaviate-usecase",
  "cliendID": "my-weaviate-client"
}
```

## 存活性

存活性用于确定应用程序是否存活。它可以用于Kubernetes的存活性探针。

#### 使用方法

发现端点接受`GET`请求：

```js
GET /v1/.well-known/live
```

如果应用程序能够响应HTTP请求，它将返回200。

#### 示例
如果以下命令：

import WellKnownLive from '/_includes/code/wellknown.live.mdx';

<WellKnownLive/>

返回空值（200响应），则说明应用程序能够响应HTTP请求。

## 可用性

Live用于确定应用程序是否准备好接收流量。它可以用于Kubernetes的可用性探针。

## 使用方法

发现端点接受`GET`请求：

```js
GET /v1/.well-known/ready
```

如果应用程序能够响应HTTP请求，它将返回200；如果应用程序当前无法提供服务，则返回503。如果其他水平复制的Weaviate可用且能够接收流量，则应将所有流量重定向到这些副本。

#### 示例
如果执行以下命令：

import WellknownReady from '/_includes/code/wellknown.ready.mdx';

<WellknownReady/>

当返回空白（200响应）时，表示应用程序能够响应HTTP请求。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />