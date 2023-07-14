---
image: og/docs/modules/ref2vec-centroid.jpg
sidebar_position: 7
title: ref2vec-centroid
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 简介

`ref2Vec-centroid` 模块用于基于引用向量的质心计算对象向量。其思想是通过计算对象引用的向量的质心向量，从而实现对象簇之间的关联。这在根据用户的行为或偏好的聚合来进行推荐等应用中非常有用。

## 如何启用

### Weaviate云服务

该模块在WCS上默认启用。

### Weaviate开源版

可以在docker-compose配置文件中指定在Weaviate实例中使用哪些模块。可以像这样添加Ref2Vec-centroid：

```yaml
---
version: '3.4'
services:html
  weaviate:
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
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_MODULES: 'ref2vec-centroid'
      CLUSTER_HOSTNAME: 'node1'
...
```

## 配置方法

在您的Weaviate模式中，您必须定义您希望该模块如何对您的数据进行向量化。如果您对Weaviate模式还不熟悉，您可能需要先查看[Weaviate模式教程](/developers/weaviate/tutorials/schema.md)。

例如，这是一个配置为使用ref2vec-centroid的`Article`类。只需在类级别添加一个`moduleConfig`字段，其中包含两个字段：

1. `referenceProperties`：类的引用属性列表，用于计算质心。
2. `method`：计算质心的方法。目前只支持`mean`。

`Article`类将其`hasParagraphs`属性指定为仅在计算`Article`对象的向量时使用的唯一引用属性。

需要注意的是，与其他的矢量化模块（例如text2vec/multi2vec/image2vec）不同，ref2vec-centroid不是根据对象的内容生成嵌入向量。相反，该模块的目的是根据其*引用*的向量来计算对象的向量。

在这种情况下，`Paragraph`类被配置为使用text2vec-contextionary模块生成向量。因此，`Article`类的向量表示是从引用的`Paragraph`实例中获取的text2vec-contextionary向量的平均值。

尽管此示例使用text2vec-contextionary为`Paragraph`类生成向量，但对于用户提供的向量，ref2vec-centroid的行为保持不变。在这种情况下，ref2vec-centroid的输出仍将被计算为参考向量的平均值；唯一的区别是参考向量的来源。

```json
{
  "classes": [
    {
      "class": "Article",
      "description": "A class representing a published article",
      "moduleConfig": {
        "ref2vec-centroid": {
          "referenceProperties": ["hasParagraphs"],
          "method": "mean"
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Title of the article",
          "name": "title"
        }
        ,
        {
          "dataType": [
            "Paragraph"
          ],
          "description": "Paragraphs belonging to this article",
          "name": "hasParagraphs"
        }
      ],
      "vectorizer": "ref2vec-centroid"
    },
    {
      "class": "Paragraph",
      "description": "Paragraphs belonging to an Article",
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            "text2vec-contextionary": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "name": "content"
        }
      ],
      "vectorizer": "text2vec-contextionary"
    }
  ]
}
```

## 如何使用

现在`Article`类已经正确配置为使用ref2vec-centroid模块，我们可以开始创建一些对象了。如果还没有任何`Paragraph`对象可供引用，或者我们暂时不想引用`Paragraph`对象，那么新创建的`Article`对象的向量将被设置为`nil`。

一旦我们准备好引用一个或多个现有的`Paragraph`对象（具有非空向量），我们的`Article`对象将自动分配一个质心向量，该向量是使用所有被`Article`对象引用的`Paragraph`对象的向量计算得出的。

### 更新质心

一个被配置为使用ref2vec-centroid的类的对象，在以下事件发生时，它的向量将被计算（或重新计算）：
- 使用已分配为属性的引用创建对象
  - 对象 `POST`：创建一个带有引用的新对象
  - 批量对象 `POST`：一次性创建多个对象，每个对象都带有引用
- 更新现有对象的引用列表。请注意，这可以通过多种方式进行：
  - 对象 `PUT`：使用新的引用集更新对象的所有属性。这将完全替换对象的现有引用列表为新提供的引用列表
  - `PATCH`对象：通过将任何新提供的引用添加到对象的现有引用列表中来更新现有对象
  - 引用`POST`：创建对现有对象的新引用
  - 引用`PUT`：更新对象的所有引用
- 从对象中删除引用。请注意，这可以通过多种方式实现：
  - 对象`PUT`：更新对象的所有属性，删除所有引用
  - 引用 `DELETE`: 从对象的引用列表中删除现有引用

**注意:** 目前不支持批量添加引用。这是因为批量引用功能是专门为了避免更新向量索引的成本而构建的。如果这是您重要的用例，并且希望在生产环境中看到该功能，请随时在GitHub上提交一个 [功能请求](https://github.com/weaviate/weaviate/issues/new)。

### 进行查询操作

此模块可与现有的[nearVector](/developers/weaviate/api/graphql/vector-search-parameters.md#nearvector)和[`nearObject`](/developers/weaviate/api/graphql/vector-search-parameters.md#nearobject)筛选器一起使用。它不添加任何额外的GraphQL扩展，如`nearText`。

## 附加信息

:::caution
It is important to note that updating a _referenced_ object will not automatically trigger an update to the _referencing_ object's vector.
:::

换句话说，使用我们的`Article`/`Paragraph`示例：

假设一个`Article`对象，名称为`"关于现代蚁群哲学"`, 引用了三个`Paragraph`对象: `"引言"`, `"正文"`, 和`"结论"`. 随着时间的推移，`"正文"`可能会根据对工蚁和战士蚁之间动态关系的更多研究进行更新。在这种情况下，文章的现有向量将不会根据重构后的`"正文"`生成新的向量。

如果我们想要重新计算“现代蚂蚁群的哲学”的质心向量，我们需要触发更新操作。例如，我们可以删除对“body”的引用然后再添加回去，或者只需使用相同的对象进行`PUT`操作来更新`Article`对象。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />