---
image: og/docs/configuration.jpg
sidebar_position: 2
title: Schema
---

import Badges from '/_includes/badges.mdx';

:::info Related pages
- [Tutorial: Schema](../tutorials/schema.md)
- [How to: Configure a schema](../configuration/schema-configuration.md)
- [References: REST API: Schema](../api/rest/schema.md)
- [Concepts: Data Structure](../concepts/data.md)
:::

## 简介

本页面包含与模式相关的详细信息，例如参数和可用配置。

## 模式创建

### 自动模式

:::info Available in Weaviate versions `1.5.0` and higher
:::

如果在添加数据之前没有手动创建模式，则会自动生成模式。此功能默认启用，但可以通过设置`AUTOSCHEMA_ENABLED: 'false'`（例如在`docker-compose.yml`中）来禁用。

它具有以下特点：

- 如果要添加的对象包含模式中不存在的属性，则在导入之前将添加相应的属性。
* 如果要添加的对象包含与现有模式类型冲突的属性，将会抛出错误。（例如，尝试将文本导入到模式中已存在的`int`字段）。
* 当将对象导入到新类时，将创建包括所有属性的类。
* 自动模式还会自动识别数组数据类型，例如`int[]`、`text[]`、`number[]`、`boolean[]`和`date[]`。

### 数据类型

可通过其他配置来帮助自动模式推断属性以满足您的需求。

* `AUTOSCHEMA_DEFAULT_NUMBER=number` - 为任何数值创建`number`列（与`int`等相对）。
* `AUTOSCHEMA_DEFAULT_DATE=date` - 为任何类似日期的值创建`date`列。

以下内容是不允许的：
* 除非明确与支持的两种类型 `phoneNumber` 或 `geoCoordinates` 匹配，否则不允许使用任何映射类型。
* 除非明确是引用类型，否则禁止使用任何数组类型。在这种情况下，Weaviate需要解析beacon并查看解析后的beacon的类名，因为它需要ClassName来修改模式。

### 类

类描述了一个数据对象，可以是以名词形式（如*Person*、*Product*、*Timezone*）或动词形式（如*Move*、*Buy*、*Eat*）表达。

类名始终以大写字母开头。这有助于在属性中将类与原始数据类型区分开来。例如，`dataType: ["text"]` 表示属性是一个文本，而 `dataType: ["Text"]` 表示属性是一个指向名为 `Text` 的类的交叉引用类型。

在第一个字母之后，类名可以使用任何与GraphQL兼容的字符。当前（截至 `v1.10.0+`）的类名验证正则表达式为 `/^[A-Z][_0-9A-Za-z]*$/`。

:::info Capitalization
Class and property names are treated equally no matter how the first letter is cased, eg "Article" == "article".

Generally, however, Weaviate follows GraphQL conventions where classes start with a capital letter and properties start with a lowercase letter.
:::

### 属性

每个类都有属性。属性定义了您将在Weaviate对象中添加的数据值的类型。在模式中，您至少定义属性的名称和其[dataType](../config-refs/datatypes.md)。属性名称允许在名称中使用`/[_A-Za-z][_0-9A-Za-z]*/`。

## 类对象

包含属性的完整类对象示例：

```json
{
  "class": "string",                        // The name of the class in string format
  "description": "string",                  // A description for your reference
  "vectorIndexType": "hnsw",                // Defaults to hnsw, can be omitted in schema definition since this is the only available type for now
  "vectorIndexConfig": {
    ...                                     // Vector index type specific settings, including distance metric
  },
  "vectorizer": "text2vec-contextionary",   // Vectorizer to use for data objects added to this class
  "moduleConfig": {
    "text2vec-contextionary": {
      "vectorizeClassName": true            // Include the class name in vector calculation (default true)
    }
  },
  "properties": [                           // An array of the properties you are adding, same as a Property Object
    {
      "name": "string",                     // The name of the property
      "description": "string",              // A description for your reference
      "dataType": [                         // The data type of the object as described above. When creating cross-references, a property can have multiple data types, hence the array syntax.
        "text"
      ],
      "moduleConfig": {                     // Module-specific settings
        "text2vec-contextionary": {
          "skip": true,                     // If true, the whole property will NOT be included in vectorization. Default is false, meaning that the object will be NOT be skipped.
          "vectorizePropertyName": true,    // Whether the name of the property is used in the calculation for the vector position of data objects. Default false.
        }
      },
      "indexInverted": true                 // Optional, default is true. By default each property is fully indexed both for full-text, as well as vector search. You can ignore properties in searches by explicitly setting index to false.
    }
  ],
  "invertedIndexConfig": {                  // Optional, index configuration
    "stopwords": {
      ...                                   // Optional, controls which words should be ignored in the inverted index, see section below
    },
    "indexTimestamps": false,               // Optional, maintains inverted indices for each object by its internal timestamps
    "indexNullState": false,                // Optional, maintains inverted indices for each property regarding its null state
    "indexPropertyLength": false            // Optional, maintains inverted indices for each property by its length
  },
  "shardingConfig": {
    ...                                     // Optional, controls behavior of class in a multi-node setting, see section below
  },
  "multiTenancyConfig": {"enabled": true}   // Optional, for enabling multi-tenancy for this class (default: false)
}
```

### 向量化器

向量化器 (`"vectorizer": "..."`) 可以在架构对象中针对每个类进行指定。请查看[模块页面](/developers/weaviate/modules/index.md)以获取可用的向量化器模块。

#### 没有向量化器的 Weaviate

您可以通过设置 `"vectorizer": "none"` 来在不使用向量化器的情况下使用 Weaviate。这可能在您希望从自定义模型上传自己的向量（[在此处查看如何上传](../api/rest/objects.md#with-a-custom-vector)），或者希望创建一个没有任何向量的类时非常有用。

### vectorIndexType

vectorIndexType 默认为 [`hnsw`](/developers/weaviate/concepts/vector-index.md#hnsw)，因为这是目前唯一可用的向量索引算法。

### vectorIndexConfig

请查看[`hnsw`页面](/developers/weaviate/configuration/indexes.md#how-to-configure-hnsw)，了解您可以配置的`hnsw`参数。其中包括设置与Weaviate一起使用的距离度量。

### shardingConfig

:::note
Introduced in v1.8.0.
:::

`"shardingConfig"`控制一个类应该如何在多个节点上进行[分片和分布](/developers/weaviate/concepts/cluster.md)。所有的值都是可选的，默认设置如下：

```json
  "shardingConfig": {
    "virtualPerPhysical": 128,
    "desiredCount": 1,           // defaults to the amount of Weaviate nodes in the cluster
    "actualCount": 1,
    "desiredVirtualCount": 128,
    "actualVirtualCount": 128,
    "key": "_id",
    "strategy": "hash",
    "function": "murmur3"
  }
```

各个字段的详细含义如下：

* `"desiredCount"`：*整数，不可变，可选*，默认值为集群中的节点数。该值控制应为该类索引创建多少个分片。通常的设置是将一个类分布在集群中的所有节点上，但您也可以将此值明确设置为较低的值。如果`"desiredCount"`大于集群中的物理节点数量，则一些节点
  将包含多个分片。

* `"actualCount"`: *整数，只读*。通常与所需计数匹配，除非在创建时存在问题。

* `"virtualPerPhysical"`: *整数，不可更改，可选*，默认为 `128`。
  Weaviate使用虚拟分片。这有助于在重新分片时减少数据移动量。

* `"desiredVirtualCount"`: *整数，只读*。与 `desiredCount *
  virtualPerPhysical` 匹配。

* `"actualVirtualCount"`：*整数，只读*。类似于`actualCount`，但用于虚拟分片，而不是物理分片。

* `"strategy"`：*字符串，可选，不可变*。从`v1.8.0`开始，仅支持`"hash"`。该值控制Weaviate如何决定新对象属于哪个（虚拟 - 因此是物理）分片。哈希计算是在`"key"`中指定的字段上执行的。

* `"key"`：*字符串，可选，不可变*。从`v1.8.0`开始，仅支持`"_id"`。
  该值控制用于哈希函数的分区键，以确定目标分片。目前，只能使用内部的id字段（包含对象的UUID）来确定目标分片。以后可能会支持自定义键。

* `"function"`：*字符串，可选，不可变*. 从`v1.8.0`开始，只支持`"murmur3"`作为哈希函数。它描述了用于哈希的函数。
  `"key"`属性用于确定哈希值，进而确定目标（虚拟 - 因此也是物理）分片。`"murmur3"`创建一个64位哈希值，使哈希冲突的可能性非常低。

### replicationConfig

可以使用模式通过`replicationConfig`参数来设置[复制](../configuration/replication.md)配置。

`factor`参数设置了该类对象要存储的副本数量。

```json
{
  "class": "Article",
  "vectorizer": "text2vec-openai",
  // highlight-start
  "replicationConfig": {
    "factor": 3,
  },
  // highlight-end
}
```

### invertedIndexConfig > stopwords（停用词列表）

:::note
This feature was introduced in `v1.12.0`.
:::

`text` 属性可能包含非常常见且对搜索结果没有贡献的词语。忽略这些词语可以加快包含停用词的查询速度，因为它们可以自动从查询中移除。这种加速在得分搜索（如 `BM25`）中非常显著。

停止词配置使用预设系统。您可以选择一个预设来使用特定语言的最常见停止词。如果您需要更精细的控制，可以添加额外的停止词或删除您认为不应包含在列表中的停止词。另外，您还可以通过使用空白的（`"none"`）预设并添加所有所需的停止词来创建自定义停止词列表。

```json
  "invertedIndexConfig": {
    "stopwords": {
      "preset": "en",
      "additions": ["star", "nebula"],
      "removals": ["a", "the"]
    }
  }
```

该配置允许通过类进行停用词的配置。如果未设置，这些值将默认设置为以下默认值：

| 参数 | 默认值 | 可接受值 |
| --- | --- | --- |
| `"preset"` | `"en"` | `"en"`, `"none"` |
| `"additions"` | `[]` | *任何自定义单词列表* |
| `"removals"` | `[]` | *任何自定义单词列表* |

:::note
- If none is the selected preset, then the class' stopwords will consist entirely of the additions list.
- If the same item is included in both additions and removals, then an error is returned
:::

从`v1.18`版本开始，停用词已经被索引，但在BM25算法中会被跳过。这意味着停用词被包含在倒排索引中，但在应用BM25算法时，它们不会被考虑在内作为相关性排序的依据。

现在可以在运行时配置停用词。在您的数据被索引之后，您可以使用RESTful API来[更新](/developers/weaviate/api/rest/schema#parameters-2)停用词列表。

以下是如何更新停用词列表的示例请求：

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

class_obj = {
    "invertedIndexConfig": {
        "stopwords": {
            "preset": "en",
            "additions": ["where", "is", "the"]
        }
    }
}

client.schema.update_config("Article", class_obj)
```

### invertedIndexConfig > indexTimestamps

:::note
This feature was introduced in `v1.13.0`.
:::

要执行按时间戳筛选的查询，首先必须配置目标类以通过其内部时间戳为每个对象维护一个倒排索引 - 目前包括 `creationTimeUnix` 和 `lastUpdateTimeUnix`。通过将 `invertedIndexConfig` 对象的 `indexTimestamps` 字段设置为 `true` 来完成此配置。

```json
  "invertedIndexConfig": {
    "indexTimestamps": true
  }
```

### invertedIndexConfig > indexNullState

:::note
This feature was introduced in `v1.16.0`.
:::

要执行按null或非null进行筛选的查询，目标类必须首先配置为对跟踪对象是否为null的类的每个属性维护一个倒排索引。可以通过将`invertedIndexConfig`对象的`indexNullState`字段设置为`true`来进行此配置。

```json
  "invertedIndexConfig": {
    "indexNullState": true
  }
```

### invertedIndexConfig > indexPropertyLength

:::note
This feature was introduced in `v1.16.0`.
:::

要执行按属性长度过滤的查询，目标类必须首先配置为维护此属性的倒排索引。通过将`invertedIndexConfig`对象的`indexPropertyLength`字段设置为`true`来进行此配置。

```json
  "invertedIndexConfig": {
    "indexPropertyLength": true
  }
```

:::note
Using these features requires more resources, as the additional inverted indices must be created/maintained for the lifetime of the class.
:::

### invertedIndexConfig > bm25

BM25的设置包括[自由参数`k1`和`b`](https://en.wikipedia.org/wiki/Okapi_BM25#The_ranking_function)，它们是可选的。默认值(`k1` = 1.2和`b` = 0.75)适用于大多数情况。

如果有必要，可以在模式中为每个类配置它们，并且可以选择性地在每个属性上进行覆盖。

```json
{
  "class": "Article",
  # Configuration of the sparse index
  "invertedIndexConfig": {
    "bm25": {
      "b": 0.75,
      "k1": 1.2
    }
  },
  "properties": [
    {
      "name": "title",
      "description": "title of the article",
      "dataType": [
        "text"
      ],
      # Property-level settings override the class-level settings
      "invertedIndexConfig": {
        "bm25": {
          "b": 0.75,
          "k1": 1.2
        }
      },
      "indexFilterable": true,
      "indexSearchable": true,
    }
  ]
}
```

### multiTenancyConfig

:::info Available from `v1.20` onwards
:::

`multiTenancyConfig`的值将确定是否为此类启用[multi-tenancy](../concepts/data.md#multi-tenancy)。如果启用，此类的对象将为每个租户进行隔离。默认情况下它是禁用的。

要启用它，请将`enabled`键设置为`true`，如下所示：

```json
{
  "class": "MultiTenancyClass",
  // highlight-start
  "multiTenancyConfig": {"enabled": true}
  // highlight-end
}
```

## 属性对象

属性名称允许在名称中使用 `/[_A-Za-z][_0-9A-Za-z]*/`。

完整属性对象的示例：

```json
{
    "name": "string",                     // The name of the property
    "description": "string",              // A description for your reference
    "dataType": [                         // The data type of the object as described above. When creating cross-references, a property can have multiple dataTypes.
      "text"
    ],
    "tokenization": "word",               // Split field contents into word-tokens when indexing into the inverted index. See "Property tokenization" below for more detail.
    "moduleConfig": {                     // Module-specific settings
      "text2vec-contextionary": {
          "skip": true,                   // If true, the whole property will NOT be included in vectorization. Default is false, meaning that the object will be NOT be skipped.
          "vectorizePropertyName": true   // Whether the name of the property is used in the calculation for the vector position of data objects. Default false.
      }
    },
    "indexFilterable": true,              // Optional, default is true. By default each property is indexed with a roaring bitmap index where available for efficient filtering.
    "indexSearchable": true               // Optional, default is true. By default each property is indexed with a searchable index for BM25-suitable Map index for BM25 or hybrid searching.
}
```

### 属性标记化

:::note
This feature was introduced in `v1.12.0`.
:::

您可以自定义如何对 `text` 数据进行分词和建立倒排索引。分词会影响 [`bm25`](../api/graphql/vector-search-parameters.md#bm25) 和 [`hybrid`](../api/graphql/vector-search-parameters.md#hybrid) 操作符以及 [`where` 过滤器](../api/graphql/filters.md) 的返回结果。

可以通过属性定义中的 `tokenization` 字段来自定义 `text` 属性的分词方式：

```json
{
  "classes": [
    {
      "class": "Question",
      "properties": [
        {
          "dataType": ["text"],
          "name": "question",
          // highlight-start
          "tokenization": "word"
          // highlight-end
        },
      ],
      ...
      "vectorizer": "text2vec-openai"
    }
  ]
}
```

每个标记将在倒排索引中单独进行索引。例如，如果您有一个值为`Hello, (beautiful) world`的`text`属性，下表显示了每种标记化方法的索引标记：

| 标记化方法 | 说明 | 索引标记 |
|---------------------|------------------------------------------------------------------------------|----------------------------------|
| `word`（默认）       | 保留只包含字母和数字的字符，将它们转换为小写，并按空格分割。                     | `hello`，`beautiful`，`world`    |
| `lowercase`         | 将整个文本转换为小写，并按空格分割。                                       | `hello,`，`（beautiful）`，`world` |
| `whitespace`        | 在空白处分割文本。搜索/过滤变得区分大小写。        | `Hello,`, `(beautiful)`, `world` |
| `field`             | 在修剪空白字符后对整个字段进行索引。                  | `Hello, (beautiful) world`       |

### 分词和搜索/过滤

分词将会影响到过滤器或关键词搜索的行为。这是因为过滤器或关键词搜索在与倒排索引进行匹配之前也会被分词。

以下表格显示了一个示例场景，展示了使用筛选器或关键字搜索来判断具有值`Hello, (beautiful) world`的`text`属性是否匹配。

- **行**：各种分词方法。
- **列**：各种搜索字符串。

|   | `Beautiful` | `(Beautiful)` | `(beautiful)` | `Hello, (beautiful) world` |
|---|-------------|---------------|---------------|----------------------------|
| `word` (默认)    | ✅ | ✅ | ✅ | ✅ |
| `lowercase`         | ❌ | ✅ | ✅ | ✅ |
| `whitespace`        | ❌ | ❌ | ✅ | ✅ |
| `field`             | ❌ | ❌ | ❌ | ✅ |

:::caution `string` is deprecated
The `string` data type has been deprecated from Weaviate `v1.19` onwards. Please use `text` instead.

<details>
  <summary>
    Pre <code>v1.19</code> tokenization behavior
  </summary>

**Tokenization with `text`**

`text` properties are always tokenized, and by all non-alphanumerical characters. Tokens are then lowercased before being indexed. For example, a `text` property value `Hello, (beautiful) world`, would be indexed by tokens `hello`, `beautiful`, and `world`.

Each of these tokens will be indexed separately in the inverted index. This means that a search for any of the three tokens with the `Equal` operator under `valueText` would return this object regardless of the case.

**Tokenization with `string`**

`string` properties allow the user to set whether it should be tokenized, by setting the `tokenization` class property.

If `tokenization` for a `string` property is set to `word`, the field will be tokenized. The tokenization behavior for `string` is different from `text`, however, as `string` values are only tokenized by white spaces, and casing is not altered.

So, a `string` property value `Hello, (beautiful) world` with `tokenization` set as `word` would be split into the tokens `Hello,`, `(beautiful)`, and `world`. In this case, the `Equal` operator would need the exact match including non-alphanumerics and case (e.g. `Hello,`, not `hello`) to retrieve this object.

`string` properties can also be indexed as the entire value, by setting `tokenization` as `field`. In such a case the `Equal` operator would require the value `Hello, (beautiful) world` before returning the object as a match.

**Default behavior**

`text` and `string` properties default to `word` level tokenization for backward-compatibility.

</details>
:::

## 配置语义索引

import VectorizationBehavior from '/_includes/vectorization.behavior.mdx';

<VectorizationBehavior/>

例如，这个数据对象，

```js
Article = {
  summary: "Cows lose their jobs as milk prices drop",
  text: "As his 100 diary cows lumbered over for their Monday..."
}
```

将被向量化为:

```md
article cows lose their jobs as milk prices drop as his diary cows lumbered over for their monday...
```

默认情况下，将考虑`类名`和所有属性`值`的计算，但不会对属性`名称`进行索引。可以通过`vectorizeClassName`对每个类进行向量化行为配置，通过`skip`和`vectorizePropertyName`对每个属性进行配置。

### 默认距离度量

Weaviate允许您配置`DEFAULT_VECTOR_DISTANCE_METRIC`，该配置将应用于每个类，除非单独进行覆盖。您可以选择以下选项：`cosine`（默认）、`dot`、`l2-squared`、`manhattan`、`hamming`。

```python
class_obj = {
    "class": "Article",
    "vectorIndexConfig": {
        "distance": "dot",
    },
}

client.schema.create_class(class_obj)
```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />