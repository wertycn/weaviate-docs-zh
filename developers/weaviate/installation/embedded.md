---
image: og/docs/installation.jpg
sidebar_position: 4
title: Embedded Weaviate
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 概述

嵌入式Weaviate是一种新的部署模型，它允许您直接在应用代码中使用Weaviate Client库启动一个Weaviate实例。

:::caution Experimental
Embedded Weaviate is still in the **Experimental** phase.

Some of the APIs and parameters might change over time, as we work towards a perfect implementation.
:::

### 它是如何工作的？

每次发布Weaviate版本时，我们都会发布可执行的Linux二进制文件（请参见[releases](https://github.com/weaviate/weaviate/releases)页面上的**Assets**部分）。

这样可以通过客户端实例化调用来启动Weaviate数据库服务器，从而将"安装"步骤隐藏起来，将其推到后台运行：

import EmbeddedInstantiation from '/_includes/code/embedded.instantiate.mdx';

<EmbeddedInstantiation />

## 嵌入式选项

在实例化时，可以通过传递参数和环境变量来配置从客户端生成的Weaviate服务器。所有参数都是可选的。

| 参数 | 类型 | 描述 | 默认值 |
| ---- | ---- | ---- | ------ |
| persistence_data_path | string | 存储数据库文件的目录。 | 当设置了 `XDG_DATA_HOME` 环境变量时，默认值为：<br/>`XDG_DATA_HOME/weaviate/`<br/><br/>否则，默认值为：<br/>`~/.local/share/weaviate` |
| binary_path | string | 存储二进制文件的目录。如果删除，客户端会重新下载二进制文件。 | 当环境变量 `XDG_CACHE_HOME` 被设置时，其默认值为：<br/>`XDG_CACHE_HOME/weaviate-embedded/`<br/><br/>否则，默认值为：<br/>`~/.cache/weaviate-embedded` |
| version | string | 版本接受两种类型的输入：<br/>- **版本号** - 例如 `"1.19.6"` 或 `"latest"`<br/>- **完整的 URL**，指向 Linux AMD64 或 ARM64 二进制文件 | 最新稳定版本 |
| port | integer | Weaviate服务器监听的端口。在并行运行多个实例时非常有用。 | 6666 |
| hostname | string | 绑定的主机名/IP。 | 127.0.0.1 |
| additional_env_vars | key: value | 用于向服务器传递其他环境变量，例如API密钥。 |

:::danger XDG Base Directory standard values
It is **not recommended** to modify the `XDG_DATA_HOME` and `XDG_CACHE_HOME` environment variables from the standard **XDG Base Directory** values, as that might affect many other (non-Weaviate related) applications and services running on the same server.
:::

:::tip Providing the Weaviate version as a URL
To find the **full URL** for `version`:
* head to [Weaviate releases](https://github.com/weaviate/weaviate/releases),
* find the **Assets** section for the required Weaviate version
* and copy the link to the `(name).tar.gz` file for the desired architecture.

For example, here is the URL of the Weaviate `1.19.6` `AMD64` binary: `https://github.com/weaviate/weaviate/releases/download/v1.19.6/weaviate-v1.19.6-linux-amd64.tar.gz`.
:::

### 默认模块

以下模块默认启用：
- `generative-openai`
- `qna-openai`
- `ref2vec-centroid`
- `text2vec-cohere`
- `text2vec-huggingface`
- `text2vec-openai`

可以通过设置其他环境变量来启用其他模块，如上所述。例如，要将名为 `backup-s3` 的模块添加到集合中，您可以在实例化时传递它，如下所示：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">

  ```python
  import weaviate
  from weaviate.embedded import EmbeddedOptions
  
  client = weaviate.Client(
      embedded_options=EmbeddedOptions(
          additional_env_vars={
          "ENABLE_MODULES":
          "backup-s3,text2vec-openai,text2vec-cohere,text2vec-huggingface,ref2vec-centroid,generative-openai,qna-openai"}
      )
  )
  ```

  </TabItem>

  <TabItem value="js" label="TypeScript">

  ```js
  import weaviate, { EmbeddedClient, EmbeddedOptions } from 'weaviate-ts-embedded';
  
  const client: EmbeddedClient = weaviate.client(
    new EmbeddedOptions({
      env: {
        ENABLE_MODULES: "backup-s3,text2vec-openai,text2vec-cohere,text2vec-huggingface,ref2vec-centroid,generative-openai,qna-openai",
      },
    })
  );
  ```

  </TabItem>
</Tabs>


## 在底层启动嵌入式 Weaviate

当客户端在实例化调用中使用嵌入式选项时，以下是在幕后发生的情况：
1. 客户端从 GitHub 下载 Weaviate 发布版本并将其缓存
2. 它然后启动一个Weaviate进程，将数据目录配置到特定位置，并监听指定的端口（默认为6666）。
3. 服务器的STDOUT和STDERR被导向客户端。
4. 客户端连接到此服务器进程（例如 `http://127.0.0.1:6666`）并运行客户端代码。
5. 在运行代码后（应用程序终止时），客户端关闭Weaviate进程。
6. 数据目录是保留的，因此后续的调用可以访问所有先前调用的数据，包括使用嵌入选项的所有客户端。

### 生命周期

嵌入实例将在父应用程序运行期间保持活动状态。

当应用程序退出（例如由于异常或脚本结束），Weaviate将关闭嵌入实例，但数据将保留。

:::note Embedded with Jupyter Notebooks
An Embedded instance will stay alive for as long as the Jupyter notebook is active.

This is really useful, as it will let you experiment and work with your Weaviate projects and examples.
:::

## 支持的环境

### 操作系统

目前，嵌入式Weaviate支持Linux和macOS。

## 语言客户端

### Python

在Linux上，Python客户端支持从`v3.15.4`版本开始；在macOS上，从`v3.21.0`版本开始。

### TypeScript

由于使用了在浏览器平台不可用的服务器端依赖项，嵌入式的TypeScript客户端已经被拆分为一个独立的项目。因此，原始的非嵌入式TypeScript客户端仍然是同构的。

TypeScript嵌入式客户端只是扩展了原始的TypeScript客户端，因此一旦实例化，它可以以完全相同的方式与Weaviate进行交互。可以使用以下命令安装它：

```
npm install weaviate-ts-embedded
```

`v1.2.0` 版本中添加了对 macOS 的支持。

GitHub 仓库：
* [TypeScript 嵌入式客户端](https://github.com/weaviate/typescript-embedded)
* [原始的 TypeScript 客户端](https://github.com/weaviate/typescript-client)


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />