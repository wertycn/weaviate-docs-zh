---
image: og/docs/configuration.jpg
sidebar_position: 12
title: Backups
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/configure.backups.py';
import TSCode from '!!raw-loader!/_includes/code/howto/configure.backups.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/configure.backups.go';
import JavaCode from '!!raw-loader!/_includes/code/howto/configure.backups.java';
import CurlCode from '!!raw-loader!/_includes/code/howto/configure.backups.sh';


:::info Related pages
- [References: REST API: Backups](../api/rest/backups.md)
:::

## 简介

Weaviate的备份功能旨在提供非常简单易用的体验，并与云技术进行原生集成。主要特点包括：

* 与广泛使用的云对象存储（如AWS S3、GCS或Azure）无缝集成
* 在不同存储提供商之间进行备份和恢复
* 通过REST API进行单命令备份和恢复
* 可选择备份整个实例或仅选择的类
* 在备份运行时对用户几乎没有影响，实现零停机时间
* 简易迁移至新环境

:::note
_The backup functionality was introduced in Weaviate `v1.15`, but for single-node instances only. Support for multi-node backups was introduced in `v1.16`_.
:::


## 配置

为了执行备份操作，必须激活备份提供程序模块。可以同时激活多个备份提供程序。目前可用的备份提供程序模块有 `backup-s3`、`backup-gcs`、`backup-azure` 和 `backup-filesystem`，分别用于 S3、GCS、Azure 或文件系统备份。

由于它是建立在Weaviate的[模块系统](/developers/weaviate/configuration/modules.md)之上的，未来还可以添加其他提供程序。

所有与服务发现和身份验证相关的配置都使用环境变量设置。

### S3（AWS或兼容S3）

使用`backup-s3`模块可以启用备份到任何兼容S3的Blob存储，并从中进行恢复。这包括AWS S3和MinIO。

要启用该模块，请将其名称添加到`ENABLE_MODULES`环境变量中。模块之间用逗号分隔。例如，要同时启用该模块和`text2vec-transformers`模块，可以设置如下：

```
ENABLE_MODULES=backup-s3,text2vec-transformers
```

#### S3配置（与供应商无关）
除了启用模块之外，您还需要使用环境变量对其进行配置。此配置适用于任何兼容S3的后端。

| 环境变量 | 是否必需 | 描述 |
| --- | --- | --- |
| `BACKUP_S3_BUCKET` | 是 | 所有备份的S3存储桶名称。 |
| `BACKUP_S3_PATH` | 否 | 存储备份的根路径，所有备份将被复制到该路径并从该路径检索。<br/><br/>可选项，默认为`""`，表示备份将存储在桶的根目录而不是子文件夹中。 |
| `BACKUP_S3_ENDPOINT` | 否 | 要使用的 S3 端点。<br/><br/>可选项，默认为`"s3.amazonaws.com"`。 |
| `BACKUP_S3_USE_SSL` | 否 | 连接是否应使用 SSL/TLS 进行安全保护。<br/><br/>可选项，默认为`"true"`。 |

#### S3配置（特定于AWS）

除了上面的供应商无关配置外，您还可以设置特定于AWS的身份验证配置。您可以选择使用访问密钥或基于ARN的身份验证：

#### 选项1：使用IAM和ARN角色

备份模块将首先尝试使用AWS IAM进行身份验证。如果身份验证失败，则将尝试使用“选项2”进行身份验证。

#### 选项2：使用访问密钥和秘密访问密钥

| 环境变量 | 描述 |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | 所需帐户的AWS访问密钥ID。 |
| `AWS_SECRET_ACCESS_KEY` | 所需帐户的AWS访问密钥。 |
| `AWS_REGION` | AWS区域。如果未提供，模块将尝试解析`AWS_DEFAULT_REGION`。 |

### GCS（Google Cloud Storage）

使用`backup-gcs`模块可以启用对任何Google Cloud Storage存储桶的备份和恢复功能。

要启用该模块，请将其名称添加到`ENABLE_MODULES`环境变量中。模块之间用逗号分隔。例如，要同时启用该模块和`text2vec-transformers`模块，请设置为：

```
ENABLE_MODULES=backup-gcs,text2vec-transformers
```

除了启用该模块外，您还需要使用环境变量进行配置。有一些与存储桶相关的变量，以及与凭证相关的变量。

#### GCS存储桶相关变量

| 环境变量 | 是否必需 | 描述 |
| --- | --- | --- |
| `BACKUP_GCS_BUCKET` | 是 | 所有备份文件的GCS存储桶名称。 |
| `BACKUP_GCS_USE_AUTH` | no | 是否使用凭据进行身份验证。默认为`true`。如果使用本地GCS模拟器，则为`false`。 |
| `BACKUP_GCS_PATH` | no | 存放备份文件的根路径。可选，默认为`""`，表示备份文件将存储在桶的根目录而不是子文件夹中。 |

#### Google应用程序默认凭据

`backup-gcs`模块遵循Google的[应用程序默认凭据](https://cloud.google.com/docs/authentication/application-default-credentials)最佳实践。这意味着可以通过环境变量、本地Google Cloud CLI设置或附加的服务帐号发现凭据。

这使得在不同的设置中使用相同的模块变得非常容易。例如，您可以在生产环境中使用基于环境的方法，在本地机器上使用基于CLI的方法。这样，您就可以轻松地将在远程环境中创建的备份拉到您的本地系统中。这在调试问题时非常有用，例如。

#### 基于环境的配置

| 环境变量 | 示例值 | 描述 |
| --- | --- | --- |
| `GOOGLE_APPLICATION_CREDENTIALS` | `/your/google/credentials.json` | 指向 GCP 服务账号或工作负载身份文件的路径。 |
| `GCP_PROJECT` | `my-gcp-project` | 可选。如果您使用带有 `GOOGLE_APPLICATION_CREDENTIALS` 的服务账号，该服务账号将已经包含一个 Google 项目。您可以使用此变量来显式设置一个项目，如果您使用的是用户凭证，可能可以访问多个项目。 |

### Azure 存储

使用 `backup-azure` 模块可以启用备份到任何 Microsoft Azure 存储容器以及从中恢复的功能。

要启用该模块，请将其名称添加到 `ENABLE_MODULES` 环境变量中。多个模块之间用逗号分隔。例如，要同时启用该模块和 `text2vec-transformers` 模块，请设置：

```
ENABLE_MODULES=backup-azure,text2vec-transformers
```

除了启用模块外，您还需要使用环境变量进行配置。这里有与容器相关的变量以及与凭据相关的变量。

#### Azure容器相关的变量

| 环境变量 | 是否必需 | 描述 |
| --- | --- | --- |
| `BACKUP_AZURE_CONTAINER` | 是 | 所有备份的Azure容器的名称。 |
| `BACKUP_AZURE_PATH` | no | 将所有备份复制到和检索到的容器内的根路径。<br/><br/>可选，默认为 `""`，意味着备份将存储在容器的根目录而不是子文件夹中。 |

#### Azure 凭据

使用 `backup-azure` 对 Azure 进行身份验证有两种不同的方式。您可以使用以下任一方式：

1. Azure 存储连接字符串，或
2. Azure 存储帐户名称和密钥。

两种选项都可以使用环境变量来实现，具体如下：

| 环境变量 | 必需 | 描述 |
| --- | --- | --- |
| `AZURE_STORAGE_CONNECTION_STRING` | 是 (*请参考注释) | 包含所需授权信息的字符串（[Azure文档](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)）。<br/><br/> 在使用`AZURE_STORAGE_ACCOUNT`之前，首先检查并使用此变量。 |
| `AZURE_STORAGE_ACCOUNT` | 是（*请参阅注释） | 您的Azure存储帐户的名称。 |
| `AZURE_STORAGE_KEY` | 否 | Azure存储帐户的访问密钥。 <br/><br/>对于匿名访问，请指定 `""`。 |

如果同时提供了 `AZURE_STORAGE_CONNECTION_STRING` 和 `AZURE_STORAGE_ACCOUNT`，Weaviate将使用 `AZURE_STORAGE_CONNECTION_STRING` 进行身份验证。

:::note At least one credential option is required
At least one of `AZURE_STORAGE_CONNECTION_STRING` or `AZURE_STORAGE_ACCOUNT` must be present.
:::


### 文件系统

:::caution `backup-filesystem` - limitations
`backup-filesystem` is only compatible with single-node backups. Use `backup-gcs` or `backup-s3` if support for multi-node backups is needed.

The filesystem provider is not intended for production use, as its availability is directly tied to the node on which it operates.
:::

您可以选择将备份保存到本地文件系统，而不是远程后端。这在开发过程中可能会很有帮助，例如可以快速交换设置或保存将来意外更改的状态。

要允许将备份保存到本地文件系统，请将`backup-filesystem`添加到`ENABLE_MODULES`环境变量中。模块之间用逗号分隔。例如，要同时启用`text2vec-transformers`模块和该模块，设置如下：

```
ENABLE_MODULES=backup-filesystem,text2vec-transformers
```

除了启用模块外，您还需要使用环境变量进行配置：

| 环境变量 | 是否必需 | 描述 |
| --- | --- | --- |
| `BACKUP_FILESYSTEM_PATH` | 是 | 所有备份将被复制到和检索的根路径 |

### 其他备份后端

Weaviate使用其[模块系统](/developers/weaviate/configuration/modules.md)来将备份编排与远程备份存储后端解耦。可以轻松添加新的提供者并将它们与现有的备份API一起使用。如果您缺少所需的备份模块，可以提出功能请求或自己进行贡献。无论选择哪个选项，都可以加入我们的Slack社区，与我们进行快速聊天，了解如何开始。

## API

### 创建备份

一旦模块已启用并提供了配置信息，您可以通过一个单独的HTTP请求在任何正在运行的实例上启动备份。

#### 方法和URL

```js
POST /v1/backups/{backend}
```

#### 参数

##### URL 参数

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `backend` | 字符串 | 是 | 备份提供程序模块的名称，不包括 `backup-` 前缀，例如 `s3`、`gcs` 或 `filesystem`。 |

##### 请求体

请求使用一个带有以下属性的 JSON 对象：

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `id` | string (小写字母、数字、下划线、减号) | 是 | 备份的唯一标识符。此字符串必须在后续请求（例如状态检查或还原）中提供。 |
| `include` | 字符串列表 | 否 | 要包含在备份中的可选类名列表。如果未设置，则包含所有类。 |
| `exclude` | 字符串列表 | 否 | 要从备份中排除的可选类名列表。如果未设置，则不排除任何类。 |

:::note
You cannot set `include` and `exclude` at the same time. Set none or exactly one of those.
:::

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CreateBackup"
      endMarker="# END CreateBackup"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="go"
  />
  </TabItem>

<TabItem value="java" label="Java">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START CreateBackup"
    endMarker="// END CreateBackup"
    language="java"
  />
</TabItem>

<TabItem value="curl" label="curl">
  <FilteredTextBlock
    text={CurlCode}
    startMarker="# START CreateBackup"
      endMarker="# END CreateBackup"
      language="bash"
    />
  </TabItem>
</Tabs>


在等待备份完成期间，[Weaviate仍然完全可用](#read--write-requests-while-a-backup-is-running)。


#### 异步状态检查

所有客户端实现都有一个“等待完成”选项，它会在后台轮询备份状态，并在备份完成（成功或失败）后才返回。

如果将“等待完成”选项设置为false，您还可以使用备份创建状态API自行检查状态。

```js
GET /v1/backups/{backend}/{backup_id}
```

#### 参数

##### URL 参数

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `backend` | 字符串 | 是 | 备份提供程序模块的名称，不包括 `backup-` 前缀，例如 `s3`、`gcs` 或 `filesystem`。 |
| `backup_id` | 字符串 | 是 | 在发送创建备份请求时用户提供的备份标识符。 |

响应中包含一个`"status"`字段。如果状态为`SUCCESS`，则备份已完成。如果状态为`FAILED`，则会提供附加的错误信息。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START StatusCreateBackup"
      endMarker="# END StatusCreateBackup"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START StatusCreateBackup"
      endMarker="// END StatusCreateBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START StatusCreateBackup"
      endMarker="// END StatusCreateBackup"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START StatusCreateBackup"
      endMarker="// END StatusCreateBackup"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START StatusCreateBackup"
      endMarker="# END StatusCreateBackup"
      language="bash"
    />
  </TabItem>
</Tabs>


### 恢复备份
只要源和目标之间的名称和节点数量相同，您可以将任何备份还原到任何机器上。备份不需要在同一实例上创建。一旦配置了备份后端，您可以通过一个HTTP请求还原备份。

请注意，如果此实例上已存在任何类，则还原操作将失败。

#### 方法和URL

```js
POST /v1/backups/{backend}/{backup_id}/restore
```

#### 参数

##### URL 参数

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `backend` | 字符串 | 是 | 备份提供程序模块的名称，不包括 `backup-` 前缀，例如 `s3`、`gcs` 或 `filesystem`。 |
| `backup_id` | 字符串 | 是 | 在发送创建备份请求时用户提供的备份标识符。 |

##### 请求体
请求接受一个包含以下属性的 JSON 对象：

| 名称 | 类型 | 必填 | 描述 |
| ---- | ---- | ---- | ---- |
| `include` | 字符串列表 | 否 | 可选的类名列表，用于指定要包含在备份中的类。如果未设置，则包含所有类。 |
| `exclude` | 字符串列表 | 否 | 可选的类名列表，用于指定要从备份中排除的类。如果未设置，则不排除任何类。 |

*注意 1：不能同时设置 `include` 和 `exclude`。请选择不设置或只设置其中一个。*

*注意2：`include`和`exclude`是相对于备份中包含的类的。如果它们不是备份的一部分，恢复过程无法知道源机器上存在哪些类。*

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RestoreBackup"
      endMarker="# END RestoreBackup"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RestoreBackup"
      endMarker="// END RestoreBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START RestoreBackup"
      endMarker="// END RestoreBackup"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START RestoreBackup"
      endMarker="// END RestoreBackup"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START RestoreBackup"
      endMarker="# END RestoreBackup"
      language="bash"
    />
  </TabItem>
</Tabs>


#### 异步状态检查

所有客户端实现都有一个"等待完成"的选项，它会在后台轮询恢复状态，并且只有在恢复完成（成功或失败）后才会返回。

如果将"等待完成"选项设置为false，您还可以使用备份恢复状态API自行检查状态。

```js
GET /v1/backups/{backend}/{backup_id}/restore
```

#### 参数

##### URL 参数

| 名称 | 类型 | 必填 | 描述 |
| ---- | ---- | ---- | ---- |
| `backend` | 字符串 | 是 | 备份提供程序模块的名称，不包括 `backup-` 前缀，例如 `s3`、`gcs` 或 `filesystem`。 |
| `backup_id` | 字符串 | 是 | 用户提供的备份标识符，在发送创建和还原备份的请求时使用。 |

响应中包含一个`"status"`字段。如果状态为`SUCCESS`，则表示恢复完成。如果状态为`FAILED`，则会提供额外的错误信息。

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START StatusRestoreBackup"
      endMarker="# END StatusRestoreBackup"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START StatusRestoreBackup"
      endMarker="// END StatusRestoreBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START StatusRestoreBackup"
      endMarker="// END StatusRestoreBackup"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START StatusRestoreBackup"
      endMarker="// END StatusRestoreBackup"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START StatusRestoreBackup"
      endMarker="# END StatusRestoreBackup"
      language="bash"
    />
  </TabItem>
</Tabs>


## 技术考虑

### 在备份运行期间的读写请求

备份过程旨在对正在运行的设置进行最小干扰。即使在需要复制数千兆字节的数据的非常大型设置中，Weaviate在备份过程中仍然完全可用。它甚至可以在备份过程运行时接受写入请求。本节将解释备份的工作原理以及为什么Weaviate可以在复制备份时安全地接受写入操作。

Weaviate使用一个自定义的[LSM存储](../concepts/storage.md#object-and-inverted-index-store)作为其对象存储和倒排索引。LSM存储是不可变磁盘段和接受所有写入（包括更新和删除）的内存结构memtable的混合体。大部分时间，磁盘上的文件是不可变的，只有三种情况下文件会发生变化：

1. 每当一个memtable被刷新时，会创建一个新的段。现有的段不会被更改。
2. 任何写入内存表的操作也会被写入预写式日志（WAL）。WAL仅用于灾难恢复。一旦一个段被有序地刷新，WAL可以被丢弃。
3. 有一个异步的后台进程叫做Compaction，它优化现有的段。它可以将两个小的段合并成一个较大的段，并在此过程中删除冗余数据。

Weaviate的备份实现使用上述属性的方式如下：

1. Weaviate首先将所有活动的memtable刷新到磁盘上。这个过程需要10到100毫秒的时间。任何待处理的写请求只需等待新的memtable创建完成，而不会有请求失败或者延迟。
2. 现在，内存表已经被刷新，有一个保证：所有应该包含在备份中的数据都存在于现有的磁盘段中。任何在备份请求结束后导入的数据都会保存在新的磁盘段中。备份引用了一个不可变文件列表。
3. 为了防止在复制过程中紧凑操作改变磁盘上的文件，紧缩操作会在所有文件都被复制之前暂时暂停，然后会在复制完成后自动恢复。

通过这种方式，备份过程可以确保传输到远程后端的文件是不可变的（因此可以安全复制），即使有新的写入操作。即使备份一个非常大的设置需要几分钟或几小时，Weaviate在备份过程运行时仍然完全可用，而且不会对用户产生任何影响。

在生产实例正常提供用户请求的同时，甚至建议在生产环境中创建备份。

### 备份 API 的异步特性

备份 API 的设计方式避免了长时间的网络请求。创建新备份的请求会立即返回。它会进行一些基本的验证，然后返回给用户。备份现在处于 `STARTED` 状态。要获取正在运行的备份的状态，您可以轮询 [状态端点](#异步状态检查)。这使得备份本身对网络或客户端故障具有弹性。

如果您希望应用程序等待后台备份过程完成，您可以使用所有语言客户端中存在的“等待完成”功能。客户端将在后台轮询状态终点，直到状态为`SUCCESS`或`FAILED`时阻塞。这使得即使在API的异步特性下，编写简单的同步备份脚本也变得很容易。

## 其他用例

### 迁移到另一个环境

备份提供商的灵活性为新的用例打开了可能。除了将备份和恢复功能用于灾难恢复外，您还可以将其用于复制环境或在集群之间进行迁移。

例如，考虑以下情况：您希望对生产数据进行负载测试。如果在生产环境中进行负载测试，可能会影响用户。一种简单的方法是复制整个环境，以获得有意义的结果而不影响用户。一旦新的类似生产的“负载测试”环境建立起来，从生产环境中创建一个备份，并将其恢复到“负载测试”环境中。即使生产环境运行在与新环境完全不同的云服务提供商上，这种方法也适用。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
