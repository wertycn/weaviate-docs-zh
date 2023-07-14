---
image: og/docs/search.jpg
sidebar_position: 2
title: (TBC) Vector/Semantic Search
---

## 概述
<!-- TODO: 考虑将整个文档合并到“查询基础”中（以前是如何查询数据） -->

学习如何使用Weaviate执行向量搜索

<!-- TODO: 完成本页！ -->
<!-- :::caution 正在建设中。
从Weaviate Docs Classic迁移而来的“如何执行语义搜索”教程 -->
## 介绍

- Weaviate具有用于查询数据的RESTful API端点，但Weaviate的查询语言是[GraphQL](https://graphql.org/)。
- 在创建了[模式](../tutorials/schema.md)并[导入数据](/developers/weaviate/tutorials/import.md)之后，您可以查询Weaviate。
- 您可以执行简单的[`Get{}`](../api/graphql/get.md)查询来轻松检索数据，了解更多信息请参阅[此处](./how-to-query-data.md)。
- 为了根据语义缩小`Get{}`查询的搜索结果，可以在`Get{}`查询中使用`nearText`过滤器。在[此教程](#neartext-filter)中了解详情。
- 要以模糊方式搜索和查找数据对象，可以使用GraphQL的`Explore{}`函数，在[此教程](#explore-graphql-function)和[参考页面](../api/graphql/explore.md)中了解详情。

## 先决条件
 1. **连接到Weaviate实例。**\\
 如果您还没有设置Weaviate实例，请查看[快速入门指南](/developers/weaviate/quickstart/index.md)。在本指南中，我们假设您的实例在`http://localhost:8080`上运行，并且使用[text2vec-contextionary](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md)作为向量化模块。
 2. **上传模式**。\\
 了解如何创建和上传模式[此处](../tutorials/schema.md)。在本指南中，我们假设已经上传了类似的模式，其中包含`Publication`，`Article`和`Author`类。
 3. **添加数据**。\\
 确保您的Weaviate实例中有可用的数据，您可以在[上一个指南](/developers/weaviate/tutorials/how-to-import-data.md)中了解如何操作。在本教程中，我们假设存在`Publication`，`Article`和`Author`的数据对象。

## nearText过滤器
如果您想在已知类中对数据对象进行语义搜索，可以在`Get{}`查询中使用`nearText`过滤器。假设我们想查找与"时尚"相关的`Publication`，我们可以执行以下查询：

import HowtoSemanticSearchFilter from '/_includes/code/howto.semanticsearch.filter.mdx';

<HowtoSemanticSearchFilter/>

这将得到类似以下的结果。Vogue被选为唯一结果，因为没有其他与"时尚"和"高级定制"足够相关的出版物。

{
  "data": {
    "Get": {
      "Things": {
        "Publication": [
          {
            "name": "Vogue"
          }
        ]
      }
    }
  },
  "errors": null
}
```

## Explore GraphQL function
If you are not sure what classes you want to query, or want to perform a fuzzy search through your whole dataset, then you can use the `Explore{}` function instead of the `Get{}` function. In the `Explore{}` function you don't specify which classes you perform the semantic search on, so the semantic search will be performed on all the data objects. Since this search is fuzzy, the only fields you can return are the `beacon`, `certainty`, `className`; you cannot request property values of the data objects, since the property value names depend on the data object, defined in the schema.

Let's search for data object about fashion again, but now we are not only interested in `Publication` data objects, but in all data objects that have something to do with "fashion".

import HowtoSemanticSearchFunction from '/_includes/code/howto.semanticsearch.function.mdx';

<HowtoSemanticSearchFunction/>

As you can see, the same arguments are applied in the "explore" filter and the `Explore{}` function. There is however no class specified. Instead, the `className` is returned as one of the GraphQL fields. The result of this query contains both data objects from the class `Publication` and `Article`:

```json
{
  "data": {
    "Explore": [
      {
        "beacon": "weaviate://localhost/65010df4-da64-333d-b1ce-55c3fc9174ab",
        "certainty": 0.8257073,
        "className": "Article"
      },
      {
        "beacon": "weaviate://localhost/ac884d35-ccb4-3937-81f8-8474a4d7a549",
        "certainty": 0.79948425,
        "className": "Publication"
      },
      {
        "beacon": "weaviate://localhost/f2b7c189-9183-3095-a5bb-b619d7fe9703",
        "certainty": 0.7862817,
        {
  "results": [
    {
      "beacon": "weaviate://localhost/ae0c8f59-4aad-3ab7-a501-4a2f924ddcbe",
      "certainty": 0.84826905,
      "className": "Article"
    },
    {
      "beacon": "weaviate://localhost/21239ca9-8f09-3747-b369-ff41e0dfebdd",
      "certainty": 0.7857753,
      "className": "Article"
    },
    {
      "beacon": "weaviate://localhost/8f2cb04e-c3bb-344f-8fbd-f742bf36e653",
      "certainty": 0.77738225,
      "className": "Article"
    }
  ],
  "errors": null
}
```

If you are interested in property values of the returned objects, you will need to do a second query to to retrieve data of the beacon:

```bash
$ curl -s http://localhost:8080/v1/objects/{id}
```

So querying all property values of the first result can be done as follows:

```bash
`$ curl -s http://localhost:8080/v1/objects/65010df4-da64-333d-b1ce-55c3fc9174ab`
```

## Next steps

- Look for more ways to query your dataset in Weaviate with GraphQL queries, semantic search and other filters in the [GraphQL references guide](../api/graphql/index.md).
- Stay tuned for new tutorials, for example on interpretation of the semantic search results or how to set up a classification model!

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />