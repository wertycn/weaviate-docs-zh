---
image: og/docs/api.jpg
sidebar_position: 14
title: REST - /v1/backups
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 介绍

有关备份的一般介绍、配置和技术背景，请参阅[备份页面](/developers/weaviate/configuration/backups.md)。

## API

### 创建备份

一旦启用了模块并提供了[配置](/developers/weaviate/configuration/backups.md#configuration)，您可以通过单个HTTP请求在任何运行中的实例上开始备份。

### 方法和URL

```js
POST /v1/backups/{backend}
```

#### 参数

##### URL 参数

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `backend` | 字符串 | 是 | 备份提供者模块的名称，不包括 `backup-` 前缀，例如 `s3`、`gcs`、`azure` 或 `filesystem`。 |

##### 请求体

请求需要一个包含以下属性的 JSON 对象：

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `id` | 字符串（小写字母、数字、下划线、减号） | 是 | 备份的唯一标识符。在以后的请求中（如状态检查或恢复），必须提供此字符串。 |
| `include` | 字符串列表 | 否 | 可选项，要包含在备份中的类名列表。如果不设置，将包含所有类。 |
| `exclude` | 字符串列表 | 否 | 可选项，要从备份中排除的类名列表。如果不设置，将不会排除任何类。 |

*注意：您不能同时设置`include`和`exclude`。请设置其中一个或不设置。*

有关客户端代码示例，请参阅[如何配置/备份](../../configuration/backups.md#create-backup)页面。

在等待备份完成时，[Weaviate仍然可以完全使用](/developers/weaviate/configuration/backups.md#read--write-requests-while-a-backup-is-running)。

#### 异步状态检查

所有客户端实现都有一个“等待完成”选项，它会在后台轮询备份状态，并且只在备份完成后（无论成功与否）才返回。

如果您将“等待完成”选项设置为false，您也可以使用备份创建状态API自行检查状态。

```js
GET /v1/backups/{backend}/{backup_id}
```

##### 参数

##### URL 参数

| 名称 | 类型 | 必填 | 描述 |
| ---- | ---- | ---- | ---- |
| `backend` | 字符串 | 是 | 备份提供者模块的名称，不包括 `backup-` 前缀，例如 `s3`、`gcs`、`azure` 或 `filesystem`。 |
| `backup_id` | 字符串 | 是 | 在发送创建备份请求时，用户提供的备份标识符。 |

响应中包含一个 `"status"` 字段。如果状态为 `SUCCESS`，则表示备份操作成功。
备份已完成。如果状态为“FAILED”，则会提供额外的错误信息。

有关客户端代码示例，请参阅[如何配置/备份](../../configuration/backups.md#asynchronous-status-checking)页面。

### 恢复备份

只要源和目标之间的节点数量相同，您可以将任何备份恢复到任何机器上。备份不需要在同一实例上创建。一旦配置了备份后端，您可以通过单个HTTP请求恢复备份。

有两个重要条件需要注意，可能会导致还原失败：
- 如果目标还原节点上已存在任何一个类。
- 如果备份类节点的节点名称与目标还原节点的节点名称不匹配。

#### 方法和URL

```js
POST /v1/backups/{backend}/{backup_id}/restore
```

#### 参数

##### URL参数

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `backend` | 字符串 | 是 | 备份提供程序模块的名称，不包括 `backup-` 前缀，例如 `s3`、`gcs`、`azure` 或 `filesystem`。 |
| `backup_id` | 字符串 | 是 | 发送创建备份请求时用户提供的备份标识符。 |

##### 请求体

请求需要一个包含以下属性的JSON对象：

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `include` | 字符串列表 | 否 | 可选的类名列表，用于包含在备份中。如果未设置，则包含所有类。 |
| `exclude` | 字符串列表 | 否 | 可选的类名列表，用于从备份中排除。如果未设置，则不排除任何类。 |

*注1：不能同时设置`include`和`exclude`。请选择其中之一，或者都不设置。*

*注意2：`include`和`exclude`是相对于备份中包含的类的。如果它们不是备份的一部分，恢复过程将不知道源机器上存在哪些类。*

有关客户端代码示例，请参阅[如何：配置/备份](../../configuration/backups.md#restore-backup)页面。

#### 异步状态检查

所有客户端实现都有一个“等待完成”选项，它将在后台轮询备份状态，并在备份完成后（无论成功与否）才返回。

如果将“等待完成”选项设置为false，您还可以使用备份还原状态API自行检查状态。

```js
GET /v1/backups/{backend}/{backup_id}/restore
```

#### 参数

##### URL 参数

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `backend` | 字符串 | 是 | 备份提供程序模块的名称，不包括`backup-`前缀，例如`s3`，`gcs`，`azure`或`filesystem`。 |
| `backup_id` | 字符串 | 是 | 在发送请求创建和恢复备份时使用的用户提供的备份标识符。 |

响应包含一个`"status"`字段。如果状态是`SUCCESS`，那么
恢复已完成。如果状态为`FAILED`，则提供额外的错误信息。

有关客户端代码示例，请参阅[如何配置/备份](../../configuration/backups.md#asynchronous-status-checking-1)页面。

## 了解更多关于备份的信息

了解有关[备份配置](/developers/weaviate/configuration/backups.md#configuration)的更多信息，包括备份到[S3](/developers/weaviate/configuration/backups.md#s3-aws-or-s3-compatible)，[GCS](/developers/weaviate/configuration/backups.md#gcs-google-cloud-storage)或[Azure](/developers/weaviate/configuration/backups.md#azure-storage)，备份的[技术考虑](/developers/weaviate/configuration/backups.md#technical-considerations)，以及[其他用例](/developers/weaviate/configuration/backups.md#other-use-cases)。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />