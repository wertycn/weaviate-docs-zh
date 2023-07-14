---
image: og/docs/api.jpg
sidebar_position: 7
title: GraphQL - Vector search parameters
---

import Badges from '/_includes/badges.mdx';

<Badges/>

import TryEduDemo from '/_includes/try-on-edu-demo.mdx';

<TryEduDemo />

## 设置搜索参数

向类级别的GraphQL查询中添加向量搜索参数。

例如：

import GraphQLFiltersExample from '/_includes/code/graphql.filters.example.mdx';

<GraphQLFiltersExample/>

## 内置参数

内置搜索参数在所有的Weaviate实例中都可用，无需任何模块。

Weaviate提供以下内置参数：
* [nearVector](#nearvector)
* [nearObject](#nearobject)
* [hybrid](#hybrid)
* [bm25](#bm25)
* [group](#group)

## 模块特定参数

某些Weaviate模块提供了特定的搜索参数。

通过添加相关模块，您可以使用以下参数：
* [nearText](#neartext)
* [ask](#ask)

## nearVector

此过滤器允许您在输入向量的附近找到数据对象。它由`Get{}`函数支持。

* 注意：此参数与[GraphQL `Explore{}`函数](./explore.md)不同
* 注意：不能使用多个`'near'`参数，也不能同时使用`'near'`参数和[`'ask'`](/developers/weaviate/modules/reader-generator-modules/qna-transformers.md)过滤器

### 变量

| 变量 | 是否必需 | 类型 | 描述 |
| --- | --- | --- | --- |
| `vector` | 是 | `[float]` | 此变量接受一个向量嵌入，形式为浮点数数组。该数组的长度应与该类中的向量长度相同。 |
| `distance` | 否 | `float` | 对象特征和提供的过滤器值之间所需的相似度程度。不能与 `certainty` 变量一起使用。距离字段的值的解释取决于所使用的[距离度量](/developers/weaviate/config-refs/distances.md)。 |
| `certainty` | no | `float` | 结果项目与搜索向量之间的归一化距离。归一化后的值介于0（完全相反）和1（相同向量）之间。不能与 `distance` 变量一起使用。 |

### 示例

import GraphQLFiltersNearVector from '/_includes/code/graphql.filters.nearVector.mdx';

<GraphQLFiltersNearVector/>

### 附加信息

如果距离度量是 `cosine`，您也可以使用 `certainty` 代替 distance。
`distance`。确定性将距离归一化到0..1的范围内，其中0表示完全相反（余弦距离为2），1表示具有相同角度的向量（余弦距离为0）。确定性在非余弦距离度量上不可用。

## nearObject

此筛选器允许您通过UUID在其他数据对象附近查找数据对象。它由`Get{}`函数支持。

* 注意：您不能同时使用多个`near<Media>`参数，或者同时使用`near<Media>`参数和[`ask`](/developers/weaviate/modules/reader-generator-modules/qna-transformers.md)参数。
* 注意：您可以在参数中指定对象的`id`或`beacon`，以及所需的`certainty`。
* 请注意，第一个结果将始终是过滤器本身的对象。
* 近似对象搜索也可以与`text2vec`模块结合使用。

### 变量

| 变量 | 必填 | 类型 | 描述 |
| ------ | ------ | ---- | ------ |
| `id` | 是 | `UUID` | 以 UUID 格式表示的数据对象标识符。 |
| `beacon` | 是 | `url` | 以 Beacon URL 格式表示的数据对象标识符。例如，`weaviate://<hostname>/<kind>/id`。 |
| `distance` | 否 | `float` | 对象特征与提供的过滤器值之间的相似度要求的程度。不能与`certainty`变量一起使用。距离字段的值的解释取决于所使用的[距离度量](/developers/weaviate/config-refs/distances.md)。 |
| `certainty` | no | `float` | 结果项与搜索向量之间的标准化距离。标准化到0（完全相反）到1（完全相同）之间。不能与`distance`变量一起使用。 |

### 示例

import GraphQLFiltersNearObject from '/_includes/code/graphql.filters.nearObject.mdx';

<GraphQLFiltersNearObject/>

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "_additional": {
            "distance": -1.1920929e-07
          },
          "name": "The New York Times Company"
        },
        {
          "_additional": {
            "distance": 0.059879005
          },
          "name": "New York Times"
        },
        {
          "_additional": {
            "distance": 0.09176409
          },
          "name": "International New York Times"
        },
        {
          "_additional": {
            "distance": 0.13954824
          },
          "name": "New Yorker"
        },
        ...
      ]
    }
  }
}
```

</details>

## 混合搜索
此筛选器允许您将[BM25](#bm25)和向量搜索相结合，以获得两种搜索方法的最佳效果。它由`Get{}`函数支持。

### 变量

| 变量名       | 必需     | 类型       | 描述                                                                        |
|--------------|----------|------------|-----------------------------------------------------------------------------|
| `query`      | 是       | `string`   | 搜索查询                                                               |
| `alpha`      | 否       | `float`    | 每个搜索算法的权重，默认为0.75                           |
| `vector`     | 否       | `[float]`  | 可选项，提供自定义的向量                                          |
| `properties` | 否       | `[string]` | 限制BM25搜索的属性列表，默认为所有文本属性 |
| `fusionType` | no       | `string` | 混合融合算法的类型（从 `v1.20.0` 版本开始可用）              |

* 注意：
    * `alpha` 可以是从 0 到 1 的任意数字，默认为 0.75。
        * `alpha` = 0 强制使用纯**关键字**搜索方法（BM25）
        * `alpha` = 1 强制使用纯**向量**搜索方法
        * `alpha` = 0.5 平均权衡 BM25 和向量方法
    * `fusionType` 可以是 `rankedFusion` 或 `relativeScoreFusion`
        * `rankedFusion`（默认）将BM25和向量搜索方法的倒排排名相加
   * `relativeScoreFusion`将BM25和向量搜索方法的归一化得分相加

### GraphQL响应

GraphQL结果中的`_additional`属性公开了`score`。结果按照得分降序排序。

```json
{
  "_additional": {
    "score": "0.016390799"
  }
}
```


### 示例

import GraphQLFiltersHybrid from '/_includes/code/graphql.filters.hybrid.mdx';

<GraphQLFiltersHybrid/>

### 带有向量参数的示例
如果您提供自己的嵌入向量，可以将向量查询提供给`vector`变量。如果Weaviate正在处理向量化，则可以忽略`vector`变量并使用上面的示例代码片段。

import GraphQLFiltersHybridVector from '/_includes/code/graphql.filters.hybrid.vector.mdx';

<GraphQLFiltersHybridVector/>

### 使用 Where 过滤器的 Hybrid 模式

从 `v1.18` 开始，您可以在 `hybrid` 模式下使用 [`where` 过滤器](../graphql/filters.md#where-filter)。

import GraphQLFiltersHybridFilterExample from '/_includes/code/graphql.filters.hybrid.filter.example.mdx';

<GraphQLFiltersHybridFilterExample/>

### 限制 BM25 属性

从`v1.19`开始，`hybrid`接受一个字符串数组`properties`，用于限制BM25搜索组件将搜索的属性集。如果未指定，则将搜索所有文本属性。

在下面的示例中，`alpha`参数设置接近0以支持BM25搜索，将`properties`从`"question"`更改为`"answer"`将得到不同的结果集。

import GraphQLFiltersHybridProperties from '/_includes/code/graphql.filters.hybrid.properties.mdx';

<GraphQLFiltersHybridProperties/>


## BM25

`bm25`操作符执行关键字（稀疏向量）搜索，并使用BM25F排名函数对结果进行评分。BM25F（**B**est **M**atch **25** with Extension to Multiple Weighted **F**ields）是BM25的扩展版本，它将评分算法应用于多个字段（`properties`），从而产生更好的结果。

搜索是不区分大小写的，大小写匹配不会给予分数优势。停用词会被删除。[目前不支持词干处理](https://github.com/weaviate/weaviate/issues/2439)。

### 模式配置

[可配置和可选的自由参数 `k1` 和 `b`](https://en.wikipedia.org/wiki/Okapi_BM25#The_ranking_function)。有关更多详细信息，请参阅[模式参考](../../config-refs/schema.md#invertedindexconfig--bm25)。

### 变量
`bm25`操作符支持以下变量：

| 变量 | 是否必需 | 描述 |
| ---- | -------- | ---- |
| `query` | 是 | 关键字搜索查询。 |
| `properties` | 否 | 要搜索的属性（字段）数组，默认为类中的所有属性。 |

:::info Boosting properties
Specific properties can be boosted by a factor specified as a number after the caret sign, for example `properties: ["title^3", "summary"]`.
:::

### 示例查询

import GraphQLFiltersBM25 from '/_includes/code/graphql.filters.bm25.mdx';

<GraphQLFiltersBM25/>

### GraphQL 响应

GraphQL结果中的`_additional`属性暴露了评分（score）:

```json
{
  "_additional": {
    "score": "5.3201",
    "distance": null,  # always null
    "certainty": null  # always null
  }
}
```

<details>
  <summary>预期响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "certainty": null,
            "distance": null,
            "score": "3.4985464"
          },
          "title": "Tim Dowling: is the dog’s friendship with the fox sweet – or a bad omen?"
        }
      ]
    }
  },
  "errors": null
}
```

</details>

### 使用 Where 过滤器的 BM25
在 `v1.18` 版本中引入了 [`where` 过滤器](../graphql/filters.md#where-filter)，您现在可以在 `bm25` 中使用它。

import GraphQLFiltersBM25FilterExample from '/_includes/code/graphql.filters.bm25.filter.example.mdx';

<GraphQLFiltersBM25FilterExample/>

<details>
  <summary>预期的响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "summary": "Sometimes, the hardest part of setting a fishing record is just getting the fish weighed. A Kentucky fisherman has officially set a new record in the state after reeling in a 9.05-pound saugeye. While getting the fish in the boat was difficult, the angler had just as much trouble finding an officially certified scale to weigh it on. In order to qualify for a state record, fish must be weighed on an officially certified scale. The previous record for a saugeye in Kentucky ws an 8 pound, 8-ounce fish caught in 2019.",
          "title": "Kentucky fisherman catches record-breaking fish, searches for certified scale"
        },
        {
          "summary": "Unpaid last month because there wasn\u2019t enough money. Ms. Hunt picks up shifts at JJ Fish & Chicken, bartends and babysits. three daughters is subsidized,and cereal fromErica Hunt\u2019s monthly budget on $12 an hourErica Hunt\u2019s monthly budget on $12 an hourExpensesIncome and benefitsRent, $775Take-home pay, $1,400Varies based on hours worked. Daycare, $600Daycare for Ms. Hunt\u2019s three daughters is subsidized, as are her electricity and internet costs. Household goods, $300Child support, $350Ms. Hunt picks up shifts at JJ Fish & Chicken, bartends and babysits to make more money.",
          "title": "Opinion | What to Tell the Critics of a $15 Minimum Wage"
        },
        ...
      ]
    }
  }
}

```

</details>

## 分组

您可以使用分组操作符将类似的概念（也称为实体合并）组合在一起。有两种方法可以将具有语义相似性的对象分组在一起。

### 变量

| 变量 | 是否必填 | 类型 | 描述 |
| ---- | -------- | ---- | ---- |
| `type` | 是 | `string` | 您可以选择仅显示最接近的概念（`closest`），或将所有相似实体合并为一个字符串（`merge`）。 |
| `force` | 是 | `float` | 用于特定移动的力量。必须介于0和1之间，其中0等同于无移动，1等同于最大可能的移动。 |

### 示例

import GraphQLFiltersGroup from '/_includes/code/graphql.filters.group.mdx';

<GraphQLFiltersGroup/>

这将导致以下结果。请注意，出版物`International New York Times`、`The New York Times Company`和`New York Times`被合并。没有完全重叠的属性值都将显示出来，在括号之前是最核心概念的值。

<details>
  <summary>预期的响应</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "name": "Fox News"
        },
        {
          "name": "Wired"
        },
        {
          "name": "The New York Times Company (New York Times, International New York Times)"
        },
        {
          "name": "Game Informer"
        },
        {
          "name": "New Yorker"
        },
        {
          "name": "Wall Street Journal"
        },
        {
          "name": "Vogue"
        },
        {
          "name": "The Economist"
        },
        {
          "name": "Financial Times"
        },
        {
          "name": "The Guardian"
        },
        {
          "name": "CNN"
        }
      ]
    }
  }
}
```

</details>

## nearText

通过以下模块启用：
- [text2vec-openai](../../modules/retriever-vectorizer-modules/text2vec-openai.md),
- [text2vec-cohere](../../modules/retriever-vectorizer-modules/text2vec-cohere.md),
- [text2vec-huggingface](../../modules/retriever-vectorizer-modules/text2vec-huggingface.md),
- [text2vec-transformers](../../modules/retriever-vectorizer-modules/text2vec-transformers.md),
- [text2vec-contextionary](../../modules/retriever-vectorizer-modules/text2vec-contextionary.md)。
- [multi2vec-clip](../../modules/retriever-vectorizer-modules/multi2vec-clip.md)。

该过滤器允许您在单个或多个概念的向量表示附近找到数据对象。它由`Get{}`函数支持。

### 变量

| 变量 | 必填 | 类型 | 描述 |
| --- | --- | --- | --- |
| `concepts` | 是 | `[string]` | 一个包含自然语言查询或单个单词的字符串数组。如果使用多个字符串，将计算并使用质心。了解更多关于如何解析概念的信息，请参阅[这里](#concept-parsing)。 |
| `certainty` | no | `float` | 对象特征与提供的过滤器值之间所需的相似度程度。<br/>值可以介于0（无匹配）和1（完全匹配）之间。<br/><i className="fas fa-triangle-exclamation"/> 不能与 `distance` 变量同时使用。 |
| `distance` | 否 | `float` | 结果项与搜索向量之间的归一化距离。<br/>距离字段的值的解释取决于所使用的[距离度量](/developers/weaviate/config-refs/distances.md)。<br/><i className="fas fa-triangle-exclamation"/> 不能与`certainty`变量一起使用。|
| `autocorrect` | 否 | `boolean` | 自动纠正输入文本值 |
| `moveTo` | 否 | `object{}` | 将搜索词移动到由关键词描述的另一个向量附近 |
| `moveTo{concepts}` | 否 | `[string]` | 一个字符串数组 - 自然语言查询或单个单词。如果使用多个字符串，将计算并使用一个质心。 |
| `moveTo{objects}` | 否 | `[UUID]` | 要将结果移动到的对象ID。这用于在向量空间中将NLP搜索结果"偏向"特定方向。 |
| `moveTo{force}` | 否 | `float` | 对特定运动施加的力。必须在0和1之间，其中0等同于没有运动，1等同于最大可能的运动。 |
| `moveAwayFrom` | 否 | `object{}` | 将搜索词从由关键词描述的另一个向量中移开 |
| `moveAwayFrom{concepts}` | 否 | `[string]` | 一个字符串数组 - 自然语言查询或单个单词。如果使用多个字符串，将计算并使用质心。 |
| `moveAwayFrom{objects}`| 否 | `[UUID]` | 要从中移动结果的对象ID。这用于在向量空间中将NLP搜索结果“偏向”某个方向。 |
| `moveAwayFrom{force}`| 否 | `float` | 要施加到特定移动的力量。必须介于0和1之间，其中0等同于无移动，而1等同于最大移动。 |

### 示例 I

此示例演示了使用`nearText`筛选器的基本概述。

import GraphQLFiltersNearText from '/_includes/code/graphql.filters.nearText.mdx';

<GraphQLFiltersNearText/>

### 示例 II

您还可以将结果偏向于其他数据对象的向量表示。例如，在这个查询中，我们将关于"在亚洲旅行"的查询偏向于一篇关于食物的文章。

import GraphQLFiltersNearText2Obj from '/_includes/code/graphql.filters.nearText.2obj.mdx';

<GraphQLFiltersNearText2Obj/>

<details>
  <summary>期望的响应</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "certainty": 0.9619976580142975
          },
          "summary": "We've scoured the planet for what we think are 50 of the most delicious foods ever created. A Hong Kong best food, best enjoyed before cholesterol checks. When you have a best food as naturally delicious as these little fellas, keep it simple. Courtesy Matt@PEK/Creative Commons/FlickrThis best food Thai masterpiece teems with shrimp, mushrooms, tomatoes, lemongrass, galangal and kaffir lime leaves. It's a result of being born in a land where the world's most delicious food is sold on nearly every street corner.",
          "title": "World food: 50 best dishes"
        },
        {
          "_additional": {
            "certainty": 0.9297388792037964
          },
          "summary": "The look reflects the elegant ambiance created by interior designer Joyce Wang in Hong Kong, while their mixology program also reflects the original venue. MONO Hong Kong , 5/F, 18 On Lan Street, Central, Hong KongKoral, The Apurva Kempinski Bali, IndonesiaKoral's signature dish: Tomatoes Bedugul. Esterre at Palace Hotel TokyoLegendary French chef Alain Ducasse has a global portfolio of restaurants, many holding Michelin stars. John Anthony/JW Marriott HanoiCantonese cuisine from Hong Kong is again on the menu, this time at the JW Marriott in Hanoi. Stanley takes its name from the elegant Hong Kong waterside district and the design touches reflect this legacy with Chinese antiques.",
          "title": "20 best new Asia-Pacific restaurants to try in 2020"
        }
        ...
      ]
    }
  }
}
```

</details>

### 附加信息

#### 距离度量

如果距离度量为`cosine`，您还可以使用`certainty`代替`distance`。`certainty`将距离归一化到0..1的范围内，其中0表示完全相反（余弦距离为2），1表示具有相同角度的向量（余弦距离为0）。`certainty`在非余弦距离度量上不可用。

#### 概念解析

在概念数组中编写的字符串是模糊搜索的术语。在Explore查询中需要设置一个概念数组，并且该数组中的所有单词都应该存在于Contextionary中。

有三种方式来定义筛选器中的概念数组参数。

- `["New York Times"]` = 根据单词的出现次数确定一个向量位置
- `["New", "York", "Times"]` = 所有概念具有相似的权重。
- `["New York", "Times"]` = 上述两种方式的组合。

一个实际的例子是: `concepts: ["beatles", "John Lennon"]`

#### 语义路径

* 仅在`txt2vec-contextionary`模块中可用

语义路径返回一个从查询到数据对象的概念数组。这样可以让您看到Weaviate采取了哪些步骤以及如何解释查询和数据对象。

| 属性 | 描述 |
| --- | --- |
| `concept` | 在此步骤中找到的概念。 |
| `distanceToNext` | 下一步的距离（最后一步为null）。 |
| `distanceToPrevious` | 上一步的距离（第一步为null）。 |
| `distanceToQuery` | 步骤与查询之间的距离。 |
| `distanceToResult` | 步骤与结果之间的距离。 |

注意：只有在设置了 [`nearText: {}` 过滤器](#neartext) 作为探索术语时，才能构建语义路径，因为探索术语表示路径的起点，每个搜索结果表示路径的终点。由于 `nearText: {}` 查询目前只能在 GraphQL 中执行，因此 REST API 中没有 `semanticPath`。

示例：显示没有边的语义路径。

import GraphQLUnderscoreSemanticpath from '/_includes/code/graphql.underscoreproperties.semanticpath.mdx';

<GraphQLUnderscoreSemanticpath/>

## 问

由模块：[问答模块](/developers/weaviate/modules/reader-generator-modules/qna-transformers.md) 启用。

此过滤器允许您通过将结果传递给问答模型来返回问题的答案。

### 变量

| 变量 | 必需 | 类型 | 描述 |
| ---- | ---- | ---- | ---- |
| `question` 	| 是 	| `string` 	| 要回答的问题。   |
| `certainty` 	| 否 	| `float` 	| 对问题答案的期望最低确定度或置信度。值越高，搜索越严格。值越低，搜索越模糊。如果没有设置确定度，将返回任何可能的答案。  |
| `properties` 	| 否 	| `[string]` 	| 查询类的属性，其中包含文本。如果未设置属性，则会考虑所有属性。  |
| `rerank` 	| no 	| `boolean`	| 如果启用，qna模块将根据答案分数对结果进行重新排名。例如，如果第三个结果 - 根据之前的（语义）搜索确定的最可能的答案，结果3将被推到位置1，依此类推。*自v1.10.0起支持* |

### 示例

import QNATransformersAsk from '/_includes/code/qna-transformers.ask.mdx';

<QNATransformersAsk/>

### GraphQL响应

`_additional{}`属性被扩展为包含回答和回答的确定性。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />