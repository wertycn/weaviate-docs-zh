---
image: og/docs/tutorials.jpg
sidebar_position: 2
title: How to define a schema
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

本教程旨在向您展示如何在Weaviate中创建模式的示例。

通过完成本教程，您将对如何创建模式有一个很好的理解。您将开始了解为什么模式很重要，并找到模式定义所需的相关信息的位置。

### 关键要点

- 模式由类和属性组成，用于定义概念。
- 模式中的词（类和属性的名称）必须是`text2vec-contextionary`的一部分。
- 可以通过[RESTful API](../api/rest/schema.md)来修改模式。提供了Python、JavaScript和Go客户端。
- Weaviate中的类或属性是不可变的，但始终可以进行扩展。
- 请参阅[API参考指南](/developers/weaviate/api/index.md)中的概念、类、属性和数据类型。

## 先决条件

我们建议在开始本教程之前先阅读[快速入门教程](../quickstart/index.md)。

在本教程中，您需要一个使用`text2vec-contextionary`模块运行的Weaviate实例。我们假设您的实例正在`http://localhost:8080`上运行。

## 什么是模式？

import SchemaDef from '/_includes/definition-schema.md';

<SchemaDef/>

如果您开始导入数据而没有定义模式，它将触发[自动模式特性](/developers/weaviate/config-refs/schema.md#auto-schema)，Weaviate将为您创建一个模式。

尽管在某些情况下这可能是合适的，但在许多情况下，您可能希望明确定义一个模式。手动定义模式将有助于确保模式适合您的特定数据和需求。

## 创建您的第一个模式（使用Python客户端）

假设您想为一个[新闻出版物](../more-resources/example-datasets.md)数据集创建一个模式。该数据集包含来自金融时报、纽约时报、CNN、Wired等出版物的随机新闻**文章**。您还希望捕捉**作者**以及一些关于这些对象的元数据，如发表日期。

按照以下步骤创建并上传模式。

**1. 从空的JSON格式模式开始。**

模式以JSON格式定义。以下是一个空模式的示例：

```json
{
  "classes": []
}
```

**2. 定义类和属性。**

假设您想从这个数据集中捕获三个类别：`Publication`、`Article`和`Author`。请注意，这些词是*单数*（这是最佳实践，每个数据对象都是这些类别中的*一个*）。

类名始终以大写字母开头。属性始终以小写字母开头。当您想要将单词连接成一个类名或属性名时，可以使用驼峰命名法。有关模式类、属性和数据类型的更多信息，请点击[这里](/developers/weaviate/config-refs/schema.md)。

让我们使用JSON格式定义一个名为`Publication`的类，它具有`name`、`hasArticles`和`headquartersGeoLocation`属性。`name`是`Publication`的名称，以字符串格式表示。`hasArticles`将引用Article对象。我们需要在相同的模式中定义`Articles`类，以确保引用是可能的。`headquartersGeoLocation`将使用特殊的数据类型`geoCoordinates`。

请注意，类"Article"的属性"title"的数据类型为"string"，而属性"content"的数据类型为"text"。"string"值和"text"值在标记化方面有所不同。

```json
{
  "class": "Publication",
  "description": "A publication with an online source",
  "properties": [
    {
      "dataType": [
        "text"
      ],
      "description": "Name of the publication",
      "name": "name"
    },
    {
      "dataType": [
        "Article"
      ],
      "description": "The articles this publication has",
      "name": "hasArticles"
    },
    {
      "dataType": [
          "geoCoordinates"
      ],
      "description": "Geo location of the HQ",
      "name": "headquartersGeoLocation"
    }
  ]
}
```

将`Article`类和`Author`类添加到同一个模式中，这样你将得到以下类:

```json
[{
  "class": "Publication",
  "description": "A publication with an online source",
  "properties": [
    {
      "dataType": [
        "text"
      ],
      "description": "Name of the publication",
      "name": "name"
    },
    {
      "dataType": [
        "Article"
      ],
      "description": "The articles this publication has",
      "name": "hasArticles"
    },
    {
      "dataType": [
          "geoCoordinates"
      ],
      "description": "Geo location of the HQ",
      "name": "headquartersGeoLocation"
    }
  ]
}, {
  "class": "Article",
  "description": "A written text, for example a news article or blog post",
  "properties": [
    {
      "dataType": [
        "text"
      ],
      "description": "Title of the article",
      "name": "title"
    },
    {
      "dataType": [
        "text"
      ],
      "description": "The content of the article",
      "name": "content"
    }
  ]
}, {
  "class": "Author",
  "description": "The writer of an article",
  "properties": [
      {
        "dataType": [
            "text"
        ],
        "description": "Name of the author",
        "name": "name"
      },
      {
        "dataType": [
            "Article"
        ],
        "description": "Articles this author wrote",
        "name": "wroteArticles"
      },
      {
        "dataType": [
            "Publication"
        ],
        "description": "The publication this author writes for",
        "name": "writesFor"
      }
  ]
}]
```

现在，将这个类别列表添加到模式中，它将会像这样：

```json
{
  "classes": [{
    "class": "Publication",
    "description": "A publication with an online source",
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "description": "Name of the publication",
        "name": "name"
      },
      {
        "dataType": [
          "Article"
        ],
        "description": "The articles this publication has",
        "name": "hasArticles"
      },
      {
        "dataType": [
            "geoCoordinates"
        ],
        "description": "Geo location of the HQ",
        "name": "headquartersGeoLocation"
      }
    ]
  }, {
    "class": "Article",
    "description": "A written text, for example a news article or blog post",
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "description": "Title of the article",
        "name": "title"
      },
      {
        "dataType": [
          "text"
        ],
        "description": "The content of the article",
        "name": "content"
      }
    ]
  }, {
    "class": "Author",
    "description": "The writer of an article",
    "properties": [
      {
        "dataType": [
            "text"
        ],
        "description": "Name of the author",
        "name": "name"
      },
      {
        "dataType": [
            "Article"
        ],
        "description": "Articles this author wrote",
        "name": "wroteArticles"
      },
      {
        "dataType": [
            "Publication"
        ],
        "description": "The publication this author writes for",
        "name": "writesFor"
      }
    ]
  }]
}
```

**3. 使用Python客户端将模式上传到Weaviate。**

import HowtoSchemaCreatePython from '/_includes/code/howto.schema.create.python.mdx';

<HowtoSchemaCreatePython/>

## 创建您的第一个模式（RESTful API、Python或JavaScript）

目前，只有使用Python客户端才能一次性上传整个模式。如果您不使用Python，您需要逐个将类上传到Weaviate。可以按照以下步骤上传前面示例中的模式：

**1. 创建没有引用的类。**

   只有当Weaviate模式中存在这些类时，才能添加对其他类的引用。因此，我们首先创建没有引用的所有属性的类，然后在步骤2中添加引用。

   添加一个没有属性`hasArticles`的类`Publication`，并将其添加到正在运行的Weaviate实例中，如下所示：

import HowtoSchemaCreate from '/_includes/code/howto.schema.create.mdx';

<HowtoSchemaCreate/>

   使用`Article`和`Author`类执行类似的请求。

**2. 为现有的类添加引用属性。**

您的Weaviate模式中现在有三个类，但是我们还没有使用交叉引用将它们链接在一起。让我们在`hasArticles`属性中添加`Publication`和`Articles`之间的引用，像这样：

import HowtoSchemaPropertyAdd from '/_includes/code/howto.schema.property.add.mdx';

<HowtoSchemaPropertyAdd/>

   使用属性`wroteArticles`和`writesFor`对`Author`进行相应地引用，分别指向`Articles`和`Publication`，重复此操作。

## 下一步

<!-- - 转到下一个“如何”指南（./how-to-import-data.md）以了解如何导入数据。 -->
- 查看[RESTful API参考](../api/rest/schema.md)以获取所有模式API操作的概述。
- 阅读这篇文章：[Weaviate和模式创建](https://hackernoon.com/what-is-weaviate-and-how-to-create-data-schemas-in-it-7hy3460)

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />