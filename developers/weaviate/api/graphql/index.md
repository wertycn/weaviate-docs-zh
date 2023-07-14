---
image: og/docs/api.jpg
sidebar_position: 0
title: GraphQL API
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## GraphQL

Weaviate的基本查询语言是[GraphQL](https://graphql.org/)。GraphQL是一种基于图数据结构的查询语言。它是一种高效的数据检索和修改方法，因为它解决了其他查询语言中常见的过度获取和欠获取的问题。

## 所有引用

所有引用都有各自的子页面。点击下面的一个引用以获取更多信息。

- [获取{}](./get.md)
- [聚合{}](./aggregate.md)
- [探索{}](./explore.md)
- [筛选器](./filters.md)
- [向量搜索参数](./vector-search-parameters.md)
- [附加属性](./additional-properties.md)

## 查询结构

您可以使用标准的GraphQL查询在Weaviate中查询语义类型。下面的示例只包含GraphQL查询。您可以将GraphQL查询POST到Weaviate，如下所示：

```bash
$ curl http://localhost/v1/graphql -X POST -H 'Content-type: application/json' -d '{GraphQL query}'
```

GraphQL JSON对象的定义如下：

```json
{
    "query": "{ # GRAPHQL QUERY }"
}
```

GraphQL查询遵循一种定义好的结构，旨在尽可能有效地与您的Weaviate数据进行交互。查询的结构如下：


```graphql
{
  <Function> {
      <Class> {
        <property>
        _<underscore-property>
      }
  }
}
```

- 当前在Weaviate的GraphQL中定义了三个函数：`Get{}`、`Aggregate{}`和`Explore{}`。[`Get{}`](./get.md)函数用于从Weaviate实例中轻松检索数据，而[`Aggregate{}`](./aggregate.md)用于获取数据对象及其属性的元信息。使用[`Explore{}`](./explore.md)，您可以通过语义搜索浏览数据，并使用略微不同的查询结构（没有定义`<className>`，因为您是以模糊的方式进行搜索）：

```graphql
{
  Explore (<search arguments>) {
      beacon
      certainty
      className
  }
}
```

- [**类**](/developers/weaviate/more-resources/glossary.md) 是您想要获取的类的名称，它在[模式](../rest/schema.md)中定义。
- 在查询中包含一个[**属性**](/developers/weaviate/more-resources/glossary.md)（小写）列表，可以指定您要返回的属性值。如果属性是指向另一个对象（信标）的引用，则使用以下结构：

```graphql
{
  <Function> {
    <Class> {
      <property>
      <propertyWithReference>
        ... on <ClassOfBeacon> {
          <property>
          _additional {
            <additionalProperty>
          }
        }
      _additional {
        <additionalProperty>
      }
    }
  }
}
```

- 要获取有关数据对象的元信息（例如用于解释或可视化目的），请使用[**附加属性**](./additional-properties.md)。

## 限制

GraphQL的整数数据目前只支持`int32`，不支持`int64`。这意味着在Weaviate中，当前具有大于`int32`的整数值的整数数据字段将无法通过GraphQL查询返回。我们正在解决这个[问题](https://github.com/weaviate/weaviate/issues/1563)。目前的解决方法是使用`string`代替。

## 一致性级别

GraphQL（`Get`）查询使用可调整的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-read-consistency)运行。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />