---
image: og/docs/further-guides.jpg
sidebar_position: 9
title: (TBC) Classification with Weaviate
---

## 概述

了解如何使用Weaviate执行分类任务

<!-- TODO: 完成本页面！ -->
<!-- :::caution 正在施工中。
从"Weaviate Docs Classic"的"how-to-do-classification"教程迁移而来 -->
<!-- TODO: Difficult to understand; JPH to revise/refactor -->
# 介绍

您可以使用Weaviate自动对数据进行分类，也就是说，您可以要求Weaviate自动在概念之间建立引用关系。由于Weaviate将数据对象基于语义存储在向量位置上，因此可以在几乎实时的情况下执行各种自动分类任务。Weaviate提供了两种不同类型的分类：

1. **上下文分类**。由`text2vec-contextionary`模块提供，因此只能在您的Weaviate实例中启用此模块时使用。利用数据点的上下文来建立新的引用关系。不需要训练数据，如果您的数据中存在强烈的语义关系，则选择此类型的分类。有关更多信息，请参见[此处](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md)。
2. **kNN分类**。根据Weaviate发现的标记为相似对象的属性值和引用来为数据对象分配属性值和引用。随着时间的推移，添加和正确标记的对象越多，未来的分类就越好。特别是当需要对没有逻辑语义关系的对象进行分类时，kNN算法很有帮助。请参见[此处](../api/rest/classification.md#knn-classification)了解更多信息。

在本教程中，您将学习如何使用上下文分类和kNN分类进行分类。

# 先决条件

**1. 连接到Weaviate实例**

如果您尚未设置Weaviate实例，请查看[快速入门教程](/developers/weaviate/quickstart/index.md)。在本指南中，我们假设您的实例在`http://localhost:8080`上运行，并使用[text2vec-contextionary](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md)作为向量化模块。

**2. 上传模式**

了解如何创建和上传模式[在此处](../tutorials/schema.md)。在本指南中，我们假设已经上传了类似的模式，其中包含类`Publication`、`Article`、`Author`和`Category`。

**3. 添加数据**

确保您的Weaviate实例中有可用的数据，您可以在[上一个指南](/developers/weaviate/tutorials/how-to-import-data.md)中了解如何操作。在本教程中，我们假设存在`Publication`、`Article`、`Author`和`Category`的数据对象。

# 上下文分类

_此类型的分类仅由`text2vec-contextionary`模块提供，因此只能在您的Weaviate实例中启用此模块时使用。_

我们将使用上下文分类对文章的类别进行分类。尚未需要存在文章和类别之间的先前链接，我们不需要任何训练数据，因为我们让Weaviate使用数据对象的上下文进行分类。

## 开始分类

确保您的数据集中至少有两个类别，并且`Article`类具有属性`ofCategory`，其中交叉引用到`Category`类。文章的`Category`将根据其摘要中的文本内容确定（`"basedOnProperties"`设置为`["summary"]`）。

可以通过其中一个客户端或通过对RESTful API的直接curl请求来启动分类。

import ClassificationContextualPost from '/_includes/code/classification.contextual.post.mdx';

<ClassificationContextualPost/>

分类已经开始，并且将在后台运行。在启动分类后，可以通过`v1/classifications/{id}`端点获取状态。

{
  "basedOnProperties": [
    "summary"
  ],
  "class": "Article",
  "classifyProperties": [
    "ofCategory"
  ],
  "id": "973e3b4c-4c1d-4b51-87d8-4d0343beb7ad",
  "informationGainCutoffPercentile": 50,
  "informationGainMaximumBoost": 3,
  "meta": {
    "completed": "0001-01-01T00:00:00.000Z",
    "started": "2020-09-09T14:57:08.468Z"
  },
  "minimumUsableWords": 3,
  "status": "running",
  "tfidfCutoffPercentile": 80,
  "type": "text2vec-contextionary-contextual"
}
```

## Interpretation of results

If we later want to know to which `Category` a specific `Article` refers to, we can send the following `GET` request to `/v1/objects/{ArticleID}/?include=_classification`, which will return:

```json
{
    "class": "Article",
    "creationTimeUnix": 1580044437155,
    "id": "c9094d69-d45b-3508-85e5-23445cfb5f9f",
    "_classification": {
        "basedOn": null,
        "classifiedFields": [
            "ofCategory"
        ],
        "completed": "2020-01-26T13:25:34.230Z",
        "id": "853c5eb4-6785-4a95-9a30-9cc70ea21fd8",
        "scope": [
            "ofCategory"
        ]
    },
    "properties": {
        "hasAuthors": [
            {
                "beacon": "weaviate://localhost/18c65463-f425-3bd3-9d8d-548208966f9b"
            },
            {
                "beacon": "weaviate://localhost/b451a0af-4b28-35e0-808a-de7784fbece8"
            },
            {
                "beacon": "weaviate://localhost/16476dca-59ce-395e-b896-050080120cd4"
            }
        ],
        "inPublication": [
            {
                "beacon": "weaviate://localhost/16476dca-59ce-395e-b896-050080120cd4"
            }
        ],
        "ofCategory": [
            {
                "beacon": "weaviate://localhost/8fe49280-5d2e-3d73-9b0f-7b76e2f23c65",
                "_classification": {
                    "meanWinningDistance": 0.20993641018867493
                }
            }
        ],
        "summary": "据《新闻报》报道，一位新墨西哥州参议员被判犯有轻罪醉酒驾驶和危险驾驶罪，此前将近六个月他在该州追尾一名在红灯处停车的司机。州总检察官办公室特别检察官马克·普罗巴斯科（Mark Probasco）表示：“第三个后果是......”，据悉，马克·普罗巴斯科是新墨西哥州总检察官办公室的特别检察官。马丁内斯最初告诉警官他只喝了“一两杯啤酒”，但后来承认他喝了多杯葡萄酒。逮捕马丁内斯的警官称，这位参议员讲话含糊不清，口中有酒气。点击这里获取《福克斯新闻》应用程序。据报道，一位前新墨西哥州共和党参议员在2018年因酒后驾车被定罪后，去年被击败。"
        "title": "New Mexico Democrat's DUI conviction could cost him panel chairmanship, state party leaders warn",
        "url": "https://www.foxnews.com/politics/new-mexico-democratic-state-senator-convicted-of-dui-reckless-driving-in-june-crash",
        "wordCount": 377
    }
}
```

`meanWinningDistance` indicates how far the cross-reference lies from the `Article` data object. The higher the number the more certain the classification is right. Note that this number alone doesn't give much information, but you should interpret this number in comparison to other classified `Article`s. There is no `meanDistanceLosing` value; this value is only included in kNN classification because there multiple classes are provided in the training data.

# kNN classification

Imagine you have a property for the popularity of the `Article` by the audience, and you would like to predict the popularity for new articles based on known properties. You can use kNN classification, use the popularity of previous articles and predict the popularity of new articles. First, make sure you have a class `Popularity` with the property `level` in the schema (you need to [add this](../api/rest/schema.md#create-a-class) if you use the demo schema). Let's say the `hasPopularity` of an `Article` can be `low`, `medium` or `high`. So the schema should look like this (note: this property is not included in the example schema, so make sure to add this property before doing this classification, see how [here](../api/rest/schema.md#add-a-property)). The schema should look like this:

```json
{
  "classes": [{
      "class": "Article",
      "description": "一篇文字，例如新闻文章或博客帖子",
      "properties": [
        ......
        {
          "dataType": [
            "Popularity"
          ],
          "description": "文章的受欢迎程度",
          "name": "hasPopularity"
        },
        ......
      ]
    },
    {
      "class": "Popularity",
      "description": "一篇文章的受欢迎程度",
      "properties": [
          "dataType": [
    "text"
  ],
  "description": "流行程度级别",
  "name": "级别"
}
]
}]
```

Secondly, make sure there is a number of articles present where this property value is set, but also items without a known popularity value. For example, here are three articles, the first two with popularity and the third one without: (with the GraphQL query shown first)

```graphql
{
  Get {
    Article(limit: 3) {
      uuid
      title
      summary
      wordCount
      hasPopularity
    }
    Popularity {
      uuid
      level
    }
  }
}
```

Results in:

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "uuid": "00327619-fdfa-37cd-a003-5d2e66ae2fec",
          "summary": "当企业正在寻求创建自己的变革策略时，慈善机构和非政府组织（NGO）继续着他们的日常工作。以行动救助饥荒为例，这是一家致力于拯救儿童生命的非政府组织，在近50个国家开展广泛的活动。筹款和传播总监马修·怀特表示：“对于这项使命来说，创造变革至关重要。”“我们拿走一个不需要的物品，比如一辆自行车，并利用它来实现社会变革。”行动救助饥荒的怀特说：“我们努力寻找和吸引那些想要发挥作用的人。”
          "title": "从厨师到骑行者：令人振奋的慈善机构如何改变世界",
          "wordCount": 908,
          "hasPopularity": [{
            "beacon": "weaviate://localhost/c9a0e53b-93fe-38df-a6ea-4c8ff4501798",
            "href": "/v1/c9a0e53b-93fe-38df-a6ea-4c8ff4501798"
          }]
        },
        {
          "uuid": "373d28fb-1898-313a-893b-5bc77ba061f6",
          "summary": "我喜欢E3，因为这是一个展示游戏前景的伟大活动。《英雄传说：轨迹之钢3》（PS4）发布日期：9月24日我已经多次表达过对这个系列的喜爱，因为它捕捉到了一种经典但又不过时的感觉。在E3上，我亲自动手试玩了游戏的开头部分，看到了《轨迹之钢3》的发展情况。如果你选择不了解前作，《轨迹之钢3》将提供一个指南，帮助你了解前几款游戏的情节。Klei在E3上发布了一款新的预告片，并详细介绍了游戏的变化以及为什么开发时间比预期更长。"
          "title": "E3中你可能忽视的五款角色扮演游戏",
          "wordCount": 361,
          "hasPopularity": [{
            "beacon": "weaviate://localhost/aca140a9-ac15-4b0c-a508-85534c4def44",
            "href": "/v1/aca140a9-ac15-4b0c-a508-85534c4def44"
          }]
        },
        {
          "uuid": "8676e36a-8d60-3402-b550-4e792bb9d32f",
          "summary": "在本周的《Game Informer Show》节目中，我们讨论了《最后的生还者 第二部》最近的State of Play，我们终于看到了一些连续的游戏画面，并且我们还介绍了《Minecraft Dungeons》和《Monster Train》的最新评论。您可以在上方观看视频，订阅并在iTunes或Google Play上收听音频，也可以在SoundCloud上收听，或在Spotify上进行流媒体播放，或者在页面底部下载MP3文件。特别感谢才华横溢的Super Marcato Bros.提供《Game Informer Show》的介绍歌曲。您可以在他们的网站上听到更多他们的原创音乐和令人惊叹的视频游戏音乐播客。《最后的生还者 第二部》State of Play反应：6:32《Minecraft Dungeons》评论讨论：21:39《Monster Train》：39:11社区邮件：51:23"
          "title": "GI Show - 《最后的我们2》播放状态，Minecraft Dungeons和Monster Train",
          "wordCount": 256,
          "hasPopularity": null
        }],
      "Popularity": [
        {
          "uuid": "c9a0e53b-93fe-38df-a6ea-4c8ff4501798",
          "level": "低"
        },
        {
          "uuid": "9c6a8314-ab95-4484-b621-d7b5be2ffb29",
          "level": "中"
        },
        {
          "uuid": "aca140a9-ac15-4b0c-a508-85534c4def44",
          "level": "high"
        }
      ]
    }
  },
  "errors": null
}
```

## Start a kNN classification

A classification can be started through one of the clients, or with a direct `curl` request to the RESTful API.

import ClassificationKnnPostArticles from '/_includes/code/classification.knn.post.articles.mdx';

<ClassificationKnnPostArticles/>

A classification is started, and will run in the background. The following response is given after starting the classification, and the status can be fetched via the `v1/classifications/{id}` endpoint.

```json
{
  "basedOnProperties": [
    "summary"
  ],
  "class": "Article",
  "classifyProperties": [
    "hasPopularity"
  ],
  "id": "ee722219-b8ec-4db1-8f8d-5150bb1a9e0c",
  "meta": {
    "completed": "0001-01-01T00:00:00.000Z",
    "started": "2020-09-09T14:57:08.468Z"
  },
  "minimumUsableWords": 3,
  "status": "running",
  "tfidfCutoffPercentile": 80,
  "type": "knn",
  "k": 3
}
```


## Interpretation of results

Once the classification is finished, let's look at how the third article from the example above is classified. We run the following query:

```bash
curl http://localhost:8080/v1/objects/8676e36a-8d60-3402-b550-4e792bb9d32f?include=classification
```

And get the following result:

```json
{
  "class": "文章",
  "id": "8676e36a-8d60-3402-b550-4e792bb9d32f",
  "schema": {
    "uuid": "8676e36a-8d60-3402-b550-4e792bb9d32f",
    "summary": "在本周的《游戏通报秀》中，我们讨论了《最后的生还者2》最近的State of Play，我们终于看到了一些连续的游戏画面，并且我们还介绍了《我的世界地下城》和《怪物列车》的最新评论。您可以在上方观看视频，订阅并在iTunes或Google Play上收听音频，通过SoundCloud收听，通过Spotify进行流媒体播放，或在页面底部下载MP3文件。特别感谢才华横溢的Super Marcato Bros.为《游戏通报秀》提供了开场曲。您可以在他们的网站上听到更多他们的原创音乐和精彩的视频游戏音乐播客。《最后的生还者2》State of Play反应：6:32《我的世界地下城》评论讨论：21:39《怪物列车》：39:11社区邮件：51:23"
    "title": "GI Show - 《最后的我们 第二部分》State of Play，Minecraft Dungeons和Monster Train",
    "wordCount": 256,
    "hasPopularity": [{
      "beacon": "weaviate://localhost/aca140a9-ac15-4b0c-a508-85534c4def44",
      "href": "/v1/aca140a9-ac15-4b0c-a508-85534c4def44",
      "_classification": {
        "closestLosingDistance": 0.3898721002312689,
        "closestOverallDistance": 0.1290003538131714,
        "closestWinningDistance": 0.1290003538131714,
        "losingCount": 12,
        "meanLosingDistance": 0.5898721002312689,
        "meanWinningDistance": 0.3290003538131714,
        "overallCount": 50,
        "winningCount": 38
      }
    }]
  }
}
```

You can see that this article is predicted to also get a `"high"` popularity rating.

This returned information does not only show the values of the properties of the requested `Thing`, but also `_classification` information about how the property values are obtained. If a property value is obtained by user input, not by classification, then the `_classification` fields in the property schema will be `null`.

When a property value of a reference property is filled by classification, then `_classification` information will appear in the `_classification` field of this property. It contains information about winning and losing distances, which gives information about how the reference has been classified. The float numbers are a normalized distance (between 0 and 1), where 0 means equal and 1 would mean a perfect opposite. In kNN classification, the classification decision is based on vectors of the classes around a guessed vector.

- `closestLosingDistance`: The lowest distance of a neighbor in the losing group. Optional. If `k` equals the size of the winning group, there is no losing group.
- `closestOverallDistance`: The lowest distance of any neighbor, regardless of whether they were in the winning or losing group.
- `closestWinningDistance`: Closest distance of a neighbor from the winning group.
- `losingCount`: Size of the losing group, can be 0 if the winning group size equals `k`.
- `meanLosingDistance`: Mean distance of all neighbors from the losing group. Optional. If `k` equals the size of the winning group, there is no losing group.
- `meanWinningDistance`: Mean distance of all neighbors from the winning group.
- `overallCount`: Overall neighbors checked as part of the classification. In most cases this will equal `k`, but could be lower than `k` - for example if not enough data was present.
- `winningCount`: Size of the winning group, a number between 1 and `k`.

For example, if the kNN is set to 3, the closest 3 objects to the computed vector are taken into consideration. Let's say these 3 objects are of 2 different classes, then we classify the data object as the class of the majority. These two objects are "winning", and the other 1 object is "losing" in the classification. The distance of the winning data objects to the computed vector of the 'to be classified' data object is averaged and normalized. The same will be done to the losing data objects (in this case only 1).

`meanDistanceWinning` and `meanDistanceLosing` are a good indicators if you set the amount of k nearest neighbors right. For example if the `meanDistanceLosing` is way smaller than the `meanDistanceWinning`, than the set k values was too high because many their where many classifications to the same, but far group, and only one or a few classifications to a near group. Less abstract, this means that the 'to be classified' property is classified as a class that many other -not so similar- data objects have (winning but far away), and not as class of, losing, more similar data objects because they were in minority. In this case, the kNN was perhaps set too high, and a lower amount of kNN might lead to better classification.

Then, additional classification information about the classification of this data object is shown in the last `_classification` field on a higher level.

## Tips and Best Practices

### Training Data

- The more training data, the higher the performance of the classification. There is no rule for a minimum amount of training data, but the more the better (and more computationally intensive). The amount of training data can roughly be chosen by the amount of features n, using the formula: 1e[1, 2]+n.
- In addition, the training data should be representative for the data to be classified. The model should have relevant information to learn from. For example, it is hard to classify data for persons of age 60-70 when all persons in the training data are 18-25 years old.

### Optimal Value for kNN

There is no one optimal value for kNN. The optimal value is different for every classification problem, and depends on a lot of factors. There are however some tips to find a good k value:
- Large k values will result in classification to the most probably class around in a large space, which also makes it more computationally intensive.
- Small k values will result in a more unstable classification. Small changes in the training set and noise will result in large changes in classification.
- k is usually chosen not too high. This depends also on the amount of classes. A good start is taking k between 3 and 7 (3 <= k <=7).
- Check the distanceWinning and distanceLosing values of individual classified data objects. If distanceWinning is way larger than distanceLosing, then the k could be set too high. k can be optimized just like every other hyper parameter in other ML-algorithms just by plotting the overall validation error against k.

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />