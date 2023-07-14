---
image: og/docs/configuration.jpg
sidebar_position: 35
title: Authorization
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

授权插件允许Weaviate根据用户的[身份验证](./authentication.md)状态提供差异化的访问权限。除了允许或禁止匿名访问外，Weaviate还可以区分管理员列表中的用户和只读列表中的用户。

## 管理员列表

管理员列表依赖于配置的`身份验证模式`来正确识别用户的身份
the user. On each request, a check against a pre-configured admin list is done.
如果用户在预配置的管理员列表中，则拥有所有权限。如果不在列表中，则没有任何权限。目前无法只为特定用户分配部分权限。

## 只读列表

除了管理员列表外，还可以指定只读用户列表。这些用户对所有`get`和`list`操作拥有权限，但没有其他权限。

如果一个主题同时存在于管理员列表和只读列表中，Weaviate在启动时会抛出错误，因为配置无效。

## 使用方法

:::info Using Kubernetes?
See [this page](../installation/kubernetes.md#authentication-and-authorization) for how to set up `values.yaml` for authentication & authorization.
:::

在配置yaml文件中配置管理插件，如下所示：

```yaml
services:
  weaviate:
    ...
    environment:
      ...
      AUTHORIZATION_ADMINLIST_ENABLED: 'true'
      AUTHORIZATION_ADMINLIST_USERS: 'jane@doe.com,john@doe.com'
      AUTHORIZATION_ADMINLIST_READONLY_USERS: 'ian-smith,roberta@doe.com'
```

以上内容将启用插件，并使用户`jane@doe.com`和`john@doe.com`成为管理员。此外，用户`ian-smith`和`roberta@doe.com`将具有只读权限。

:::note User identifier
As shown in the above example, any string can be used to identify the user. This depends on what you configured in the authentication settings. For example, OIDC users may be identified by their email address by setting `AUTHENTICATION_OIDC_USERNAME_CLAIM` as `email`, whereas API key-authenticated users may be identified as a plain string such as `ian-smith`.
:::

## RBAC

更精细化的基于角色的访问控制（RBAC）即将推出。目前，唯一可能的区分是管理员（CRUD）、只读用户和完全未授权的用户。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />