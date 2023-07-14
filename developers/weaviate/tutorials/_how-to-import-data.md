---
image: og/docs/tutorials.jpg
sidebar_position: 3
title: How to import data
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

在本教程中，您将学习如何使用批量导入方法将数据导入到Weaviate中。

通过本教程的学习，您应该对导入数据的步骤有一个清晰的了解，并且知道何时使用批量导入方法。

<!-- :::caution 正在施工中。
从Weaviate Docs Classic的"如何导入数据"教程迁移而来 -->

# 简介

数据通过RESTful API添加。数据对象的语法如下：

```
{
  "class": "<类名>",  // 在模式创建期间定义的类名
  "id": "<UUID>",     // 可选项，必须是UUID格式
  "properties": {
    "<属性名>": "<属性值>", // 在模式创建期间定义的数据类型中指定
  }
}
```
```

# Prerequisites

We recommend reading the [Quickstart tutorial](../quickstart/index.md) first before tackling this tutorial.

1. **Connect to a Weaviate instance.**
For the tutorial, you will need a Weaviate instance running with the `text2vec-contextionary` module. We assume your instance is running at `http://localhost:8080`.
2. **Upload a schema**.
Learn how to create and upload a schema [here](./how-to-create-a-schema.md). In this guide we assume you have a similar schema uploaded with the classes `Publication`, `Article` and `Author`.

# Add a data object

Let's add a `Publication` with the name `New York Times` to your Weaviate instance. Not all properties have to be filled when adding a data object, so we will skip the `hasArticles` property for now, since we don't have any `Article` objects yet. Note that the `UUID` is given in the `id` parameter now, this is optional.

import CodeAddData from '/_includes/code/howto.add.data.things.mdx';

<CodeAddData />

# Add a data object with reference

If you want to add data object with a reference in a property, you need to use the `UUID` of the reference data object. Let's add the `Author` named `Jodi Kantor`, who writes for the `New York Times`:

import CodeAddRef from '/_includes/code/howto.add.data.things.reference.mdx';

<CodeAddRef />

You can also add references later, when the data object is already created. The following example first creates the `Author` with `name`, and later adds the reference to a `Publication`. This comes in handy when you need to create data objects first before you can add references.

import CodeAddRefLater from '/_includes/code/howto.add.data.things.add.reference.mdx';

<CodeAddRefLater />

# Next steps

<!-- TODO: point it towards search or the relevant content -->
<!-- - Take a look at [How to query data](./how-to-query-data) to learn how to interact with the data you just added. -->

- See the RESTful [API reference pages](/developers/weaviate/api/rest/index.md) for all API operations to add, modify and delete data.

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />