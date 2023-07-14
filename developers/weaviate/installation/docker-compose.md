---
image: og/docs/installation.jpg
sidebar_position: 2
title: Docker Compose
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 配置工具

您可以使用下面的配置工具来自定义您的Weaviate设置，以适应您所需的运行环境。

<!-- {% include docs-config-gen.html %} -->

import DocsConfigGen from '/_includes/docs-config-gen.mdx';

<DocsConfigGen />

## 示例配置

:::note
If you are new to Docker (Compose) and containerization, check out our [Docker Introduction for Weaviate Users](https://medium.com/semi-technologies/what-weaviate-users-should-know-about-docker-containers-1601c6afa079).
:::

要使用docker-compose启动Weaviate，您需要一个docker-compose配置文件，通常称为`docker-compose.yml`。您可以从上面的配置工具获取它，或者从下面的示例中选择一个。您可以在此文件中设置其他环境变量，这些变量控制您的Weaviate设置、身份验证和授权、模块设置以及数据存储设置。

:::info List of environment variables
A comprehensive of list environment variables [can be found on this page](../config-refs/env-vars.md).
:::

### 持久卷

建议设置持久卷以避免数据丢失并提高读写速度。

将以下代码段添加到您的Docker Compose YAML文件中:

```yaml
services:
  weaviate:
    volumes:
      - /var/weaviate:/var/lib/weaviate
    # etc
```

确保在关闭时运行`docker-compose down`。这会将所有文件从内存写入磁盘。

### 没有任何模块的Weaviate

下面是一个没有任何模块的Weaviate的示例docker-compose设置。在这种情况下，无论在导入还是搜索时都不会执行模型推断。您需要在导入和搜索时提供自己的向量（例如来自外部ML模型）：

```yaml
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'none'
      CLUSTER_HOSTNAME: 'node1'
```

### 使用 `text2vec-transformers` 模块的 Weaviate

一个使用 transformers 模型 [`sentence-transformers/multi-qa-MiniLM-L6-cos-v1`](https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1) 的示例 docker-compose 设置文件如下:

```yaml
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:||site.weaviate_version||
    restart: on-failure:0
    ports:
     - "8080:8080"
    environment:
      QUERY_DEFAULTS_LIMIT: 20
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: "./data"
      DEFAULT_VECTORIZER_MODULE: text2vec-transformers
      ENABLE_MODULES: text2vec-transformers
      TRANSFORMERS_INFERENCE_API: http://t2v-transformers:8080
      CLUSTER_HOSTNAME: 'node1'
  t2v-transformers:
    image: semitechnologies/transformers-inference:sentence-transformers-multi-qa-MiniLM-L6-cos-v1
    environment:
      ENABLE_CUDA: 0 # set to 1 to enable
      # NVIDIA_VISIBLE_DEVICES: all # enable if running with CUDA
```

请注意，Transformer模型是构建在GPU上运行的神经网络。使用`text2vec-transformers`模块在没有GPU的情况下运行Weaviate是可能的，但速度会较慢。如果您有可用的GPU，请启用CUDA（`ENABLE_CUDA=1`）。

有关如何使用`text2vec-transformers`模块设置环境的更多信息，请参阅[此页面](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md)。

`text2vec-transformers`模块要求至少使用Weaviate版本`v1.2.0`。

## 多节点设置

您可以使用Docker-Compose在Weaviate上创建一个多节点设置。为此，您需要：
- 将一个节点设置为“创始”成员，并使用`CLUSTER_JOIN`变量配置集群中的其他节点加入它。
- 为每个节点配置`CLUSTER_GOSSIP_BIND_PORT`和`CLUSTER_DATA_BIND_PORT`。
- 可选地，您可以使用`CLUSTER_HOSTNAME`为每个节点设置主机名。

（详细了解[Weaviate中的水平复制](../concepts/cluster.md)。）

因此，配置文件将包括以下形式的环境变量，用于“创始”成员：

```yaml
  weaviate-node-1:  # Founding member service name
    ...  # truncated for brevity
    environment:
      CLUSTER_HOSTNAME: 'node1'
      CLUSTER_GOSSIP_BIND_PORT: '7100'
      CLUSTER_DATA_BIND_PORT: '7101'
```

其他成员的配置可能如下所示：

```yaml
  weaviate-node-2:
    ...  # truncated for brevity
    environment:
      CLUSTER_HOSTNAME: 'node2'
      CLUSTER_GOSSIP_BIND_PORT: '7102'
      CLUSTER_DATA_BIND_PORT: '7103'
      CLUSTER_JOIN: 'weaviate-node-1:7100'  # This must be the service name of the "founding" member node.
```

以下是一个3节点设置的示例配置。您可以使用这个配置在本地测试[复制](../configuration/replication.md)示例。

<details>
  <summary>使用Docker Compose配置文件进行3节点复制设置</summary>

```yaml
services:
  weaviate-node-1:
    init: true
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    - 6060:6060
    restart: on-failure:0
    volumes:
      - ./data-node-1:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'text2vec-openai,text2vec-cohere,text2vec-huggingface'
      DEFAULT_VECTORIZER_MODULE: 'none'
      CLUSTER_HOSTNAME: 'node1'
      CLUSTER_GOSSIP_BIND_PORT: '7100'
      CLUSTER_DATA_BIND_PORT: '7101'

  weaviate-node-2:
    init: true
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8081:8080
    - 6061:6060
    restart: on-failure:0
    volumes:
      - ./data-node-2:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'text2vec-openai,text2vec-cohere,text2vec-huggingface'
      DEFAULT_VECTORIZER_MODULE: 'none'
      CLUSTER_HOSTNAME: 'node2'
      CLUSTER_GOSSIP_BIND_PORT: '7102'
      CLUSTER_DATA_BIND_PORT: '7103'
      CLUSTER_JOIN: 'weaviate-node-1:7100'

  weaviate-node-3:
    init: true
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8082:8080
    - 6062:6060
    restart: on-failure:0
    volumes:
      - ./data-node-3:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'text2vec-openai,text2vec-cohere,text2vec-huggingface'
      DEFAULT_VECTORIZER_MODULE: 'none'
      CLUSTER_HOSTNAME: 'node3'
      CLUSTER_GOSSIP_BIND_PORT: '7104'
      CLUSTER_DATA_BIND_PORT: '7105'
      CLUSTER_JOIN: 'weaviate-node-1:7100'
```

</details>

:::note Port number conventions
It is a Weaviate convention to set the `CLUSTER_DATA_BIND_PORT` to 1 higher than `CLUSTER_GOSSIP_BIND_PORT`.
:::


## Shell附加选项

`docker-compose up`命令的输出非常冗长，它会附加到所有容器的日志中。

您可以只将日志附加到Weaviate本身，例如，可以运行以下命令而不是`docker-compose up`命令：

```bash
# Run Docker Compose
$ docker-compose up -d && docker-compose logs -f weaviate
```

或者您可以完全以分离模式运行docker-compose，使用`docker-compose up -d`命令，并且在收到状态为`200 OK`的响应前，轮询`{bindaddress}:{port}/v1/meta`。

<!-- TODO:
1. 检查所有环境变量是否也适用于Kubernetes设置和相关的values.yaml配置文件。
2. 将此部分移到参考文档中，并且可能与其他部分合并，因为它们在文档中是分散的。（例如，备份环境变量在此处未包含。） -->

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />