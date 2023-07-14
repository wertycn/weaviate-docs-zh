---
image: og/docs/more-resources.jpg
sidebar_position: 5
title: Example datasets
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 使用CLIP进行多模态文本/图像搜索

这个示例应用程序使用[multi2vec-clip](/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip.md)模块启动了一个Weaviate实例，导入了一些示例图像（您也可以添加自己的图像！），并使用[React](https://reactjs.org/)提供了一个非常简单的搜索前端界面。
[TypeScript/JavaScript](/developers/weaviate/client-libraries/typescript.mdx) 客户端。

[在此开始](https://github.com/weaviate/weaviate-examples/blob/main/clip-multi-modal-text-image-search/README.md)

## 通过维基百科进行语义搜索

我们将完整的英文维基百科文章数据集导入到一个 Weaviate 实例中，以便通过维基百科文章进行语义搜索查询，此外，我们还建立了所有文章之间的图形关系。我们提供了导入脚本、预处理文章和备份，以便您可以自己运行完整的设置。

[在这里开始](https://github.com/weaviate/semantic-search-through-Wikipedia-with-Weaviate)

## Meta AI Research - 在Wikidata上的大图

我们已经将完整的Wikidata PBG模型导入到Weaviate中，以在小于50毫秒（不包括网络延迟）的时间内搜索整个数据集。演示的GraphQL查询包含纯向量搜索和标量与向量混合查询。

[在这里开始](https://github.com/weaviate/biggraph-wikidata-search-with-weaviate)

## 新闻发布

该数据集包含来自以下媒体的大约1000篇随机新闻文章：《金融时报》、《纽约时报》、《卫报》、《华尔街日报》、CNN、福克斯新闻、《经济学人》、《纽约客》、《连线》、《时尚》、《游戏资讯》。

它包括一个带有`Article`、`Publication`、`Category`和`Author`类的[模式](../tutorials/schema.md)。

### 使用Docker Compose运行

如果您想在本地运行这个数据集，可以使用Docker Compose一键运行。

您可以使用任何`text2vec`模块来运行这个演示数据集。示例：

#### Text2vec-contextionary

Docker Compose文件包含了Weaviate和`text2vec-contextionary`模块以及数据集。

下载Docker Compose文件

```bash
$ curl -o docker-compose.yml https://raw.githubusercontent.com/weaviate/weaviate-examples/main/weaviate-contextionary-newspublications/docker-compose.yaml
```

运行Docker（可选：使用`-d`后台运行Docker）

```bash
$ docker-compose up
```

Weaviate将在以下位置提供并预加载新闻文章演示数据集：

- `http://localhost:8080/`
- [通过控制台](https://console.weaviate.io)：连接到`https://demo.dataset.playground.semi.technology`。

#### Text2vec-transformers（无GPU）

Docker Compose文件包含Weaviate与`text2vec-contextionary`模块、`NER`模块、`Q&A`模块和`spellcheck`模块以及数据集。

下载Docker Compose文件

```bash
$ curl -o docker-compose.yml https://raw.githubusercontent.com/weaviate/weaviate-examples/main/weaviate-transformers-newspublications/docker-compose.yaml
```

运行Docker（可选：使用`-d`参数在后台运行Docker）

```bash
$ docker-compose up
```

Weaviate将在以下地址上可用，并预加载了新闻文章演示数据集：

- `http://localhost:8080/`
- [通过控制台](https://console.weaviate.io)：连接到`https://demo.dataset.playground.semi.technology`。

#### Text2vec-transformers（启用了GPU）

Docker Compose文件包含了Weaviate和`text2vec-contextionary`模块、`NER`模块、`Q&A`模块和`spellcheck`模块，以及数据集。在运行此配置时，您的机器上应该有GPU可用。

下载Docker Compose文件

```bash
$ curl -o docker-compose.yml https://raw.githubusercontent.com/weaviate/weaviate-examples/main/weaviate-transformers-newspublications/docker-compose-gpu.yaml
```

运行Docker（可选：使用`-d`选项在后台运行Docker）

```bash
$ docker-compose up
```

Weaviate将在以下地址上可用，并预装有新闻文章演示数据集：

- `http://localhost:8080/`
- [通过控制台](https://console.weaviate.io)：连接到`https://demo.dataset.playground.semi.technology`。

### 手动运行

如果您有自己的Weaviate版本运行在**外部**主机或无Docker Compose的本地主机上；

```bash
# WEAVIATE ORIGIN (e.g., https://foobar.weaviate.network), note paragraph basics for setting the local IP
$ export WEAVIATE_ORIGIN=WEAVIATE_ORIGIN
# Optionally you can specify which newspaper language you want (only two options `cache-en` or `cache-nl`, if not specified by default it is `cache-en` )
$ export CACHE_DIR=<YOUR_CHOICE_OF_CACHE_DIR>
# Optionally you can set the batch size (if not specified by default 200)
$ export BATCH_SIZE=<YOUR_CHOICE_OF_BATCH_SIZE>
# Make sure to replace WEAVIATE_ORIGIN with the Weaviate origin as mentioned in the basics above
$ docker run -it -e weaviate_host=$WEAVIATE_ORIGIN -e cache_dir-$CACHE_DIR -e batch_size=$BATCH_SIZE semitechnologies/weaviate-demo-newspublications:latest

```

使用 Docker 在本地使用 Docker Compose；

_注意：请在 Weaviate Docker Compose 文件所在的目录中运行此命令_

{% raw %}
```bash
# This gets the Weaviate container name and because the docker uses only lowercase we need to do it too (Can be found manually if 'tr' does not work for you)
$ export WEAVIATE_ID=$(echo ${PWD##*/}_weaviate_1 | tr "[:upper:]" "[:lower:]")
# WEAVIATE ORIGIN (e.g., http://localhost:8080), note the paragraph "basics" for setting the local IP
$ export WEAVIATE_ORIGIN="http://$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $WEAVIATE_ID):8080"
# WEAVIATE NETWORK (see paragraph: Running on the localhost)
$ export WEAVIATE_NETWORK=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' $WEAVIATE_ID)
# Optionally you can specify which newspaper language you want (only two options `cache-en` or `cache-nl`, if not specified by default it is `cache-en` )
$ export CACHE_DIR=<YOUR_CHOICE_OF_CACHE_DIR>
# Optionally you can set the batch size (if not specified by default 200)
$ export BATCH_SIZE=<YOUR_CHOICE_OF_BATCH_SIZE>
# Run docker
$ docker run -it --network=$WEAVIATE_NETWORK -e weaviate_host=$WEAVIATE_ORIGIN -e cache_dir-$CACHE_DIR -e batch_size=$BATCH_SIZE  semitechnologies/weaviate-demo-newspublications:latest
```
{% endraw %}

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />