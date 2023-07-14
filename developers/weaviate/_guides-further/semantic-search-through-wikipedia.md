---
image: og/docs/further-guides.jpg
sidebar_position: 99
title: (TBC) Larger dataset example (Wikipedia)
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

学习如何使用维基百科进行另一种语义搜索

<!-- TODO: 完善这个页面！ -->
<!-- :::caution 正在建设中。
从"Weaviate Docs Classic"的"semantic-search-through-wikipedia"教程迁移而来 -->
在本教程中，我们将完整的英文维基百科文章数据集导入到一个Weaviate实例中，通过维基百科文章进行语义搜索查询，除此之外，我们还建立了所有文章之间的图形关系。我们提供了导入脚本、预处理文章和备份，以便您可以自己运行完整的设置。

在本教程中，您将找到复制导入所需的3个步骤，但也提供了下载以跳过前两个步骤的选项。

## 统计数据与链接

| 描述 | 值 |
| --- | --- |
| 导入的文章数量 | `11,520,881` |
| 导入的段落数量 | `28,086,917` |
| 图形交叉引用数量 | `125,447,595` |
| 维基百科版本 | `2022年5月15日` |
| 推理机器配置 | `12个CPU - 100GB RAM - 250GB SSD - 1个NVIDIA Tesla P4` |
| Weaviate版本 | `v1.14.1` |
| 数据集大小 | `122GB` |
| 向量化模型 | `sentence-transformers-paraphrase-MiniLM-L6-v2` |

### 链接

* [💡 Weaviate GraphQL前端实时演示](http://console.weaviate.io/console/query#weaviate_uri=http://semantic-search-wikipedia-with-weaviate.api.vectors.network:8080&graphql_query=%7B%0A%20%20Get%20%7B%0A%20%20%20%20Paragraph(%0A%20%20%20%20%20%20ask%3A%20%7B%0A%20%20%20%20%20%20%20%20question%3A%20%22Who%20was%20Stanley%20Kubrick%3F%22%0A%20%20%20%20%20%20%20%20properties%3A%20%5B%22content%22%5D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%201%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20order%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20inArticle%20%7B%0A%20%20%20%20%20%20%20%20...%20on%20Article%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20_additional%20%7B%0A%20%20%20%20%20%20%20%20answer%20%7B%0A%20%20%20%20%20%20%20%20%20%20result%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)
* [💡 Weaviate RESTful端点实时演示](http://semantic-search-wikipedia-with-weaviate.api.vectors.network:8080/v1/schema)
* [项目代码](https://github.com/weaviate/semantic-search-through-Wikipedia-with-Weaviate)
* [[博客] 通过Weaviate进行维基百科语义搜索（GraphQL、Sentence-BERT和BERT Q&A）](/blog/semantic-search-with-wikipedia-and-weaviate)
* [[视频] 使用Weaviate进行维基百科向量搜索演示](https://www.youtube.com/watch?v=IGB8vjCuay0)

### 鸣谢

* 使用的 [`t2v-transformers` 模块](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md) 包含了由 [SBERT团队](https://www.sbert.net/) 创建的 [sentence-transformers-paraphrase-MiniLM-L6-v2](https://github.com/weaviate/semantic-search-through-wikipedia-with-weaviate/tree/main/step-3/docker-compose-gpu.yml#L32) 转换器
* 感谢 [Obsei团队](https://github.com/obsei/obsei) 在我们的 [Slack](https://weaviate.io/slack) 频道上分享了这个想法

![在Weaviate的GraphQL界面中进行语义搜索查询的示例动画](/img/wikipedia-demo.gif)

# 3步教程

## 导入

导入过程分为3个步骤。**您也可以跳过前两个步骤，[直接导入备份](#step-3-load-from-backup)**

### 第1步：处理维基百科转储文件

在此过程中，将处理和清理维基百科数据集（去除标记、去除HTML标签等）。输出文件是一个 [JSON Lines](https://jsonlines.org/) 文档，将在下一步中使用。

从维基媒体转储中进行处理：

$ cd step-1
$ wget https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2
$ bunzip2 enwiki-latest-pages-articles.xml.bz2
$ mv enwiki-latest-pages-articles.xml latest-pages-articles.xml
$ pip3 install -r requirements.txt
$ python3 process.py
```

The process takes a few hours, so probably you want to do something like:

```sh
$ nohup python3 -u process.py &
```

You can also download the processed file from May 15th, 2022, and skip the above steps

```sh
$ curl -o wikipedia-en-articles.json.tar.gz https://storage.googleapis.com/semi-technologies-public-data/wikipedia-en-articles.json.tar.gz
$ tar -xzvf wikipedia-en-articles.json.tar.gz
$ mv articles.json wikipedia-en-articles.json
```

### Step 2: Import the dataset and vectorize the content

Weaviate takes care of the complete import and vectorization process but you'll need some GPU and CPU muscle to achieve this. Important to bear in mind is that this is _only_ needed on import time. If you don't want to spend the resources on doing the import, you can go to the next step in the process and download the Weaviate backup. The machine needed for inference is way cheaper.

We will be using a single Weaviate instance, but four Tesla P4 GPUs that we will stuff with 8 models each. To efficiently do this, we are going to add an NGINX load balancer between Weaviate and the vectorizers.

![Weaviate Wikipedia import architecture with transformers and vectorizers)[/img/4GPU-wikipedia-dataset.png)

* Every Weaviate [text2vec-module)[/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md) will be using a [sentence-transformers/paraphrase-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L6-v2) sentence transformer.
* The volume is mounted _outside_ the container to `/var/weaviate`. This allows us to use this folder as a backup that can be imported in the next step.
* Make sure to have Docker-compose _with_ GPU support [installed](https://gist.github.com/bobvanluijt/af6fe0fa392ca8f93e1fdc96fc1c86d8).
* The import scripts assumes that the JSON file is called `wikipedia-en-articles.json`.

```sh
```
$ cd step-2
$ docker-compose up -d
$ pip3 install -r requirements.txt
$ python3 import.py
```
```

The import takes a few hours, so probably you want to do something like:

```sh
$ nohup python3 -u import.py &
```

After the import is done, you can shut down the Docker containers by running `docker-compose down`.

You can now query the dataset!

### Step 3: Load from backup

> Start here if you want to work with a backup of the dataset without importing it

You can now run the dataset! We would advise running it with 1 GPU, but you can also run it on CPU only (without Q&A). The machine you need for inference is significantly smaller.

Note that Weaviate needs some time to import the backup (if you use the setup mentioned above +/- 15min). You can see the status of the backup in the docker logs of the Weaviate container.

```sh
# 克隆该存储库
$ git clone https://github.com/weaviate/semantic-search-through-Wikipedia-with-Weaviate/
# 进入备份目录
$ cd step-3
# 下载Weaviate备份
$ curl https://storage.googleapis.com/semi-technologies-public-data/weaviate-wikipedia-1.13.2.tar.gz -o weaviate-wikipedia-1.13.2.tar.gz
# 解压备份文件（112G解压后）
$ tar -xvzf weaviate-wikipedia-1.13.2.tar.gz
# 获取解压后的目录
$ echo $(pwd)/var/weaviate
# 使用上面的结果（例如，/home/foobar/var/weaviate）
# 在docker-compose.yml中更新volumes（不是PERSISTENCE_DATA_PATH！）到上述输出
# （例如，
#   volumes:
#     - /home/foobar/var/weaviate:/var/lib/weaviate
# ）
#
# 在12个CPU的情况下，这个过程大约需要12到15分钟才能完成。
# Weaviate实例将直接可用，但在这段时间内缓存正在预填充。
```

#### With GPU

```sh
$ cd step-3
$ docker-compose -f docker-compose-gpu.yml up -d
```

#### Without GPU

```sh
$ cd step-3
$ docker-compose -f docker-compose-no-gpu.yml up -d
```

## Example queries

_"Where is the States General of The Netherlands located?"_ [try it live!](http://console.weaviate.io/console/query#weaviate_uri=http://semantic-search-wikipedia-with-weaviate.api.vectors.network:8080&graphql_query=%23%23%0A%23%20Using%20the%20Q%26A%20module%20I%0A%23%23%0A%7B%0A%20%20Get%20%7B%0A%20%20%20%20Paragraph(%0A%20%20%20%20%20%20ask%3A%20%7B%0A%20%20%20%20%20%20%20%20question%3A%20%22Where%20is%20the%20States%20General%20of%20The%20Netherlands%20located%3F%22%0A%20%20%20%20%20%20%20%20properties%3A%20%5B%22content%22%5D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%201%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20_additional%20%7B%0A%20%20%20%20%20%20%20%20answer%20%7B%0A%20%20%20%20%20%20%20%20%20%20result%0A%20%20%20%20%20%20%20%20%20%20certainty%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)

```graphql
##
# 使用Q&A模块 I
##
{
  Get {
    Paragraph(
      ask: {
        question: "荷兰的国会在哪里？"
        properties: ["content"]
      }
      limit: 1
    ) {
      _additional {
        answer {
          result
          certainty
        }
      }
      content
      title
    }
  }
}
```

_"What was the population of the Dutch city Utrecht in 2019?"_ [try it live!](http://console.weaviate.io/console/query#weaviate_uri=http://semantic-search-wikipedia-with-weaviate.api.vectors.network:8080&graphql_query=%23%23%0A%23%20Using%20the%20Q%26A%20module%20II%0A%23%23%0A%7B%0A%20%20Get%20%7B%0A%20%20%20%20Paragraph(%0A%20%20%20%20%20%20ask%3A%20%7B%0A%20%20%20%20%20%20%20%20question%3A%20%22What%20was%20the%20population%20of%20the%20Dutch%20city%20Utrecht%20in%202019%3F%22%0A%20%20%20%20%20%20%20%20properties%3A%20%5B%22content%22%5D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%201%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20_additional%20%7B%0A%20%20%20%20%20%20%20%20answer%20%7B%0A%20%20%20%20%20%20%20%20%20%20result%0A%20%20%20%20%20%20%20%20%20%20certainty%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)

```graphql
##
# 使用问答模块 II
##
{
  Get {
    Paragraph(
      ask: {
        question: "2019年荷兰乌得勒支市的人口有多少？"
        properties: ["content"]
      }
      limit: 1
    ) {
      _additional {
        answer {
          result
          certainty
        }
      }
      content
      title
    }
  }
}
```

About the concept _"Italian food"_ [try it live!](http://console.weaviate.io/console/query#weaviate_uri=http://semantic-search-wikipedia-with-weaviate.api.vectors.network:8080&graphql_query=%23%23%0A%23%20Generic%20question%20about%20Italian%20food%0A%23%23%0A%7B%0A%20%20Get%20%7B%0A%20%20%20%20Paragraph(%0A%20%20%20%20%20%20nearText%3A%20%7B%0A%20%20%20%20%20%20%20%20concepts%3A%20%5B%22Italian%20food%22%5D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%2050%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20order%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20inArticle%20%7B%0A%20%20%20%20%20%20%20%20...%20on%20Article%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)

```graphql
##
# 关于意大利食物的一般问题
##
{
  Get {
    Paragraph(
      nearText: {
        concepts: ["意大利食物"]
      }
      limit: 50
    ) {
      content
      order
      title
      inArticle {
        ... on Article {
          title
        }
      }
    }
  }
}
```

_"What was Michael Brecker's first saxophone?"_ in the Wikipedia article about _"Michael Brecker"_ [try it live!](http://console.weaviate.io/console/query#weaviate_uri=http://semantic-search-wikipedia-with-weaviate.api.vectors.network:8080&graphql_query=%23%23%0A%23%20Mixing%20scalar%20queries%20and%20semantic%20search%20queries%0A%23%23%0A%7B%0A%20%20Get%20%7B%0A%20%20%20%20Paragraph(%0A%20%20%20%20%20%20ask%3A%20%7B%0A%20%20%20%20%20%20%20%20question%3A%20%22What%20was%20Michael%20Brecker's%20first%20saxophone%3F%22%0A%20%20%20%20%20%20%20%20properties%3A%20%5B%22content%22%5D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20where%3A%20%7B%0A%20%20%20%20%20%20%20%20operator%3A%20Equal%0A%20%20%20%20%20%20%20%20path%3A%20%5B%22inArticle%22%2C%20%22Article%22%2C%20%22title%22%5D%0A%20%20%20%20%20%20%20%20valueText%3A%20%22Michael%20Brecker%22%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%201%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20_additional%20%7B%0A%20%20%20%20%20%20%20%20answer%20%7B%0A%20%20%20%20%20%20%20%20%20%20result%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20order%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20inArticle%20%7B%0A%20%20%20%20%20%20%20%20...%20on%20Article%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)

```graphql
##
# 混合标量查询和语义搜索查询
##
{
  Get {
    Paragraph(
      ask: {
        question: "迈克尔·布雷克的第一把萨克斯是什么？"
        properties: ["content"]
      }
      where: {
        operator: Equal
        path: ["inArticle", "Article", "title"]
        valueText: "迈克尔·布雷克"
      }
      limit: 1
    ) {
      _additional {
        answer {
          result
        }
      }
      content
      order
      title
      inArticle {
        ...
        ...在文章上 {
  标题
}
}
}
}
```

Get all Wikipedia graph connections for _"jazz saxophone players"_ [try it live!](http://console.weaviate.io/console/query#weaviate_uri=http://semantic-search-wikipedia-with-weaviate.api.vectors.network:8080&graphql_query=%23%23%0A%23%20Mixing%20semantic%20search%20queries%20with%20graph%20connections%0A%23%23%0A%7B%0A%20%20Get%20%7B%0A%20%20%20%20Paragraph(%0A%20%20%20%20%20%20nearText%3A%20%7B%0A%20%20%20%20%20%20%20%20concepts%3A%20%5B%22jazz%20saxophone%20players%22%5D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20limit%3A%2025%0A%20%20%20%20)%20%7B%0A%20%20%20%20%20%20content%0A%20%20%20%20%20%20order%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20inArticle%20%7B%0A%20%20%20%20%20%20%20%20...%20on%20Article%20%7B%20%23%20%3C%3D%3D%20Graph%20connection%20I%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20hasParagraphs%20%7B%20%23%20%3C%3D%3D%20Graph%20connection%20II%0A%20%20%20%20%20%20%20%20%20%20%20%20...%20on%20Paragraph%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)

```graphql
##
# 将语义搜索查询与图连接混合使用
##
{
  Get {
    Paragraph(
      nearText: {
        concepts: ["爵士萨克斯管演奏家"]
      }
      limit: 25
    ) {
      content
      order
      title
      inArticle {
        ... on Article { # <== 图连接 I
          title
          hasParagraphs { # <== 图连接 II
            ... on Paragraph {
              title
            }
          }
        }
      }
    }
  }
}
```

## Frequently Asked Questions

| Q | A |
| --- | --- |
| Can I run this setup with a non-English dataset? | Yes – first, you need to go through the whole process (i.e., start with Step 1). E.g., if you want French, you can download the French version of Wikipedia like this: `https://dumps.wikimedia.org/frwiki/latest/frwiki-latest-pages-articles.xml.bz2`  (note that `en` if replaced with `fr`). Next, you need to change the Weaviate vectorizer module to an appropriate language. You can choose an OOTB language model as outlined [here](/developers/weaviate/modules/text2vec-transformers.md#option-1-use-a-pre-built-transformer-model-container) or add your own model as outlined [here](/developers/weaviate/modules/text2vec-transformers.md#option-2-use-any-publically-available-huggingface-model). |
| Can I run this setup with all languages? | Yes – you can follow two strategies. You can use a multilingual model or extend the Weaviate schema to store different languages with different classes. The latter has the upside that you can use multiple vectorizers (e.g., per language) or a more elaborate sharding strategy. But in the end, both are possible. |
| Can I run this with Kubernetes? | Of course, you need to start from Step 2. But if you follow the Kubernetes set up in the [docs](/developers/weaviate/installation/kubernetes.md) you should be good :-) |
| Can I run this with my own data? | Yes! This is just a demo dataset, you can use any data you have and like. Go to the [Weaviate docs](/developers/weaviate/) or join our [Slack](https://weaviate.io/slack) to get started. |
| Can I run the dataset without the Q&A module? | Yes, see [this](https://github.com/weaviate/semantic-search-through-wikipedia-with-weaviate/issues/2#issuecomment-995595909) answer |

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />