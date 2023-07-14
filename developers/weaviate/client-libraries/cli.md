---
image: og/docs/client-libraries.jpg
sidebar_position: 9
title: Weaviate CLI
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::note Weaviate CLI version
The current Weaviate CLI version is `v||site.weaviate_cli_version||`.
:::

## 安装

Weaviate CLI 可以在 [Pypi.org](https://pypi.org/project/weaviate-cli/) 上获取。可以使用 [pip](https://pypi.org/project/pip/) 轻松安装该包。该客户端是为 Python 3.7 及更高版本开发和测试的。

可以使用以下命令安装 Weaviate CLI：

```sh
$ pip install weaviate-cli
```

要检查CLI是否正确安装，请运行以下命令：

```sh
$ weaviate version
```

应该返回 ||site.weaviate_cli_version||。

## 函数

### 配置

在与 Weaviate 实例进行交互之前，您需要配置 CLI 工具。这可以通过手动操作或向命令添加标志来完成。
- 手动配置（交互式）：
  ```sh
  $ weaviate config set
  ```
  或者
  ```sh
  $ weaviate init
  ```
  之后，您将被要求输入 Weaviate 的 URL 和身份验证模式。

- 标志：如果您没有手动配置CLI，可以通过添加指向配置JSON文件的配置标志（`--config-file myconfig.json`）来执行每个命令。

  ```bash
  $ weaviate --config-file myconfig.json
  ```

  其中`myconfig.json`应该如下所示：
  ```json
  {
    "url": "http://localhost:8080",
    "auth": null
  }
  ```
  或者
  ```json
  {
    "url": "http://localhost:8080",
    "auth": {
        "secret": <your_client_secret>
    }
  }
  ```
  或者

  ```json
{
  "url": "http://localhost:8080",
  "auth": {
      "user": <用户名>,
      "pass": <用户密码>
  }
}
```

您可以使用以下命令查看配置信息：

```sh
$ weaviate config view
```

### Ping测试
您可以使用以下命令对您连接的Weaviate URL进行ping测试：
```sh
$ weaviate ping
```

如果与Weaviate服务器的连接设置正确，它将返回`Weaviate is reachable!`。

### 模式
在模式方面，有三个可用的操作：[导入](#import)、[导出](#export)和[截断](#truncate)。

#### 导入

可以通过以下方式添加模式：

```sh
$ weaviate schema import my_schema.json
```

在 `my_schema.json` 文件中包含了[这里](../tutorials/schema.md)描述的模式。

要覆盖您的模式，您可以使用 `--force` 标志，这将清除索引并替换您的模式：

```sh
$ weaviate schema import --force my_schema.json # using --force will delete your data
```

#### 导出
您可以通过以下方式将模式导出为存在于Weaviate实例中的JSON文件：

```sh
$ weaviate schema export my_schema.json
```

`my_schema.json` 可以被一个 JSON 文件和本地路径替代。当 Weaviate 中存在一个模式时，这个函数只会将模式输出到给定的位置。

#### 截断

使用 `delete`，您可以删除整个模式以及与之关联的所有数据。除非添加了 `--force` 标志，否则将要求确认。

```sh
$ weaviate schema delete
```

### 数据

#### 导入

`import`函数用于从JSON文件导入数据。当添加`--fail-on-error`标志时，如果Weaviate在加载数据对象时抛出错误，则此命令执行将失败。

```sh
$ weaviate data import my_data_objects.json
```

命令中传递了JSON文件和位置。文件需要按照Weaviate数据架构进行格式化，例如：

```json
{
    "classes": [
        {
            "class": "Publication",
            "id": "f81bfe5e-16ba-4615-a516-46c2ae2e5a80",
            "properties": {
                "name": "New York Times"
            }
        },
        {
            "class": "Author",
            "id": "36ddd591-2dee-4e7e-a3cc-eb86d30a4303",
            "properties": {
                "name": "Jodi Kantor",
                "writesFor": [{
                    "beacon": "weaviate://localhost/f81bfe5e-16ba-4615-a516-46c2ae2e5a80",
                    "href": "/v1/f81bfe5e-16ba-4615-a516-46c2ae2e5a80"
                }]
            }
        }
    ]
}
```

#### 空
使用 `delete` 命令，您可以删除 Weaviate 中的所有数据对象。除非添加了 `--force` 标志，否则将要求您确认删除操作。

```sh
$ weaviate data delete
```
## 更新日志

请查看 [GitHub 上的变更日志](https://github.com/weaviate/weaviate-cli/releases) 以获取最新 `CLI` 的更新内容。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />