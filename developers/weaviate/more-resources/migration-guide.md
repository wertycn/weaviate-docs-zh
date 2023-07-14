---
image: og/docs/more-resources.jpg
sidebar_position: 8
title: Migration Guide
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 版本1.19.0的迁移

此版本引入了`indexFilterable`和`indexSearchable`变量，用于新的文本索引，其值将根据`indexInverted`的值进行设置。

由于可筛选和可搜索是分开的索引，因此在从 `v1.19` 之前的 Weaviate 实例升级到 `v1.19` 时，`filterable` 不存在。但是，如果设置了环境变量 `INDEX_MISSING_TEXT_FILTERABLE_AT_STARTUP`，则可以在启动时为所有 `text/text[]` 属性创建缺失的 `filterable` 索引。

## 版本 v1.9.0 的更改日志

* 没有破坏性的更改

* *新功能*
  * ### 第一个多模态模块：CLIP 模块 (#1756, #1766)
    本版本[引入了`multi2vec-clip`模块](/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip.md)，该模块允许在单个向量空间中进行多模态矢量化。一个类可以拥有`image`或`text`字段，或者两者都有。同样，该模块提供了`nearText`和`nearImage`搜索，并允许进行各种搜索组合，例如在仅包含图像内容的情况下进行文本搜索以及其他各种组合。

    #### 如何使用

    下面是一个用于对图像和文本字段进行向量化的类的有效负载示例：
```json
{
    "class": "ClipExample",
    "moduleConfig": {
        "multi2vec-clip": {
            "imageFields": [
                "image"
            ],
            "textFields": [
                "name"
            ],
            "weights": {
              "textFields": [0.7],
              "imageFields": [0.3]
            }
        }
    }
}
```
        },
        "vectorIndexType": "hnsw",
        "vectorizer": "multi2vec-clip",
        "properties": [
          {
            "dataType": [
              "text"
            ],
            "name": "name"
          },
          {
            "dataType": [
                "blob"
            ],
            "name": "image"
          }
        ]
      }
      ```

    注意：
       - 在`moduleConfig.multi2vec-clip`中，`imageFields`和`textFields`不需要同时设置，但至少其中一个必须设置。
   - 在`moduleConfig.multi2vec-clip`中，`weights`是可选的。如果只有一个属性，则该属性承载全部权重。如果存在多个属性且未指定权重，则属性具有相等的权重。

    然后您可以像往常一样导入类的数据对象。将`text`或`string`字段填充为文本，或将`blob`字段填充为Base64编码的图像。

#### 限制
* 在`v1.9.0`版本中，该模块需要显式创建一个类。如果您依赖自动模式创建类，它将缺少有关哪些字段应该被矢量化的必需配置。这将在将来的版本中解决。

* *修复*
  * 修复了删除带有`geoCoordinates`的类会导致清理不完整而引发恐慌的错误（#1730）
  * 修复了模块中的错误不会转发给用户的问题（#1754）
  * 修复了某些文件系统（例如AWS EFS）上无法删除类的问题（#1757）

## 迁移到版本v1.8.0

### 迁移注意事项

版本`v1.8.0`引入了多分片索引和水平扩展。作为
数据集需要进行迁移。此迁移在首次启动Weaviate版本`v1.8.0`时会自动执行，无需用户干预。但是，迁移无法撤销。因此，我们建议仔细阅读以下迁移说明，并根据您的需求逐案进行最佳升级路径的决策。

#### 为什么需要进行数据迁移？

在`v1.8.0`之前的Weaviate版本不支持多分片索引功能。该功能是为了提高性能和扩展性而引入的。
已经计划好，因此数据已经包含在一个具有固定名称的单个分片中。需要进行迁移，将数据从单个固定分片移动到多分片设置中。分片的数量不会更改。当您在数据集上运行 `v1.8.0` 时，以下步骤会自动发生：

* Weaviate会发现您的类别缺少分片配置，并用默认值填充。
* 当分片启动时，如果它们在磁盘上不存在，但具有固定名称的分片存在，它们会自动填充缺失的分片。
  当 `v1.7.x` 版本中的名称存在时，Weaviate 会自动识别到需要进行迁移，并将数据移动到磁盘上。
* 当 Weaviate 运行起来后，数据已经迁移完成。

**重要提示：** 在迁移过程中，Weaviate 会将分片分配给集群中唯一可用的节点。您需要确保该节点具有稳定的主机名。如果您在 Kubernetes 上运行，主机名是稳定的（例如，第一个节点的主机名为 `weaviate-0`）。然而，在 `docker-compose` 下主机名可能不稳定。
默认为容器的ID。如果您删除了容器（例如`docker-compose down`）并重新启动它们，主机名将发生变化。这将导致Weaviate无法找到分片所属的节点而出现错误。发送错误消息的节点是拥有该分片的节点，但它无法识别它，因为它自己的名称已经更改。

为了解决这个问题，在启动之前您可以设置一个稳定的主机名。
通过设置环境变量`CLUSTER_HOSTNAME=node1`，可以解决Weaviate v1.8.0**的错误。实际名称并不重要，只要它是稳定的即可。

如果您忘记设置稳定的主机名，现在遇到了上述错误，您仍然可以显式设置之前使用的主机名，您可以从错误消息中推导出来。

示例：

如果您看到错误消息`"shard Knuw6a360eCY: resolve node name \"5b6030dbf9ea\" to host"`，您可以通过设置来使Weaviate再次可用。
`5b6030dbf9ea` 是主机名：`CLUSTER_HOSTNAME=5b6030dbf9ea`。

#### 应该升级还是重新导入？

请注意，除了新功能外，`v1.8.0` 还包含了大量的错误修复。其中一些错误也会影响到 HNSW 索引的写入磁盘方式。因此，不能排除磁盘上的索引与 `v1.8.0` 版本中新建的索引相比，质量较差的情况。
因此，如果您可以使用脚本进行导入，我们通常建议从头开始。
在进行新的`v1.8.0`设置并重新导入而不是迁移的情况下。

#### 升级后是否可以降级？

请注意，在首次启动`v1.8.0`时发生的数据迁移不可自动逆转。如果您计划在升级后降级到`v1.7.x`，则必须在升级之前显式创建状态备份。

### 更新日志


## 版本v1.7.2的更新日志
* 没有破坏性变更
* 新功能
  * ### 数组数据类型(#1691)
    添加了`boolean[]`和`date[]`类型。
* ### 使属性名称更宽松 (#1562)
  数据模式中的属性名称允许使用`/[_A-Za-z][_0-9A-Za-z]*/`的格式，即允许使用下划线，允许使用数字，并修复了关于结尾大写字符的问题。但是，由于GraphQL的限制，它不允许使用许多其他特殊字符，如破折号(-)或特定于语言的字符，如Umlauts等。
* Bug修复
  * ### 对数组数据类型进行聚合 (#1686)


## 版本 v1.7.0 的更新日志
* 没有破坏性改变
* 新功能
  * ### 数组数据类型 (#1611)
    从此版本开始，原始对象的属性不再限于单个属性，还可以包括原始类型的列表。数组类型可以像其他原始类型一样进行存储、过滤和聚合。

    Auto-schema将自动识别`string`/`text`和`number`/`int`类型的列表。您还可以通过使用以下数据类型`string[]`、`text[]`、`int[]`、`number[]`在模式中明确指定列表。被指定为数组的类型，即使只包含一个元素，也必须始终保持为数组。

* ### 新模块：`text-spellcheck` - 检查和自动纠正拼写错误的搜索词 (#1606)
    使用新的拼写检查模块来验证用户提供的搜索查询（在现有的`nearText`或`ask`函数中）是否拼写正确，甚至提供替代的正确拼写建议。拼写检查发生在查询时。

有两种使用该模块的方法：
1. 它提供了一个新的附加属性，用于检查（但不修改）提供的查询：
以下查询：
```graphql
{
  Get {
    Post(nearText: {
```

2. It can be used as a standalone query to check and suggest corrections for a given query:
The following query:
```graphql
{
  CheckSpell(query: "aple")
}
```
will return:
```graphql
{
  "suggestedQuery": "apple"
}
```

2. 它可以作为一个独立的查询来检查并为给定的查询提供纠正建议：
以下查询：
```graphql
{
  CheckSpell(query: "aple")
}
```
将返回：
```graphql
{
  "suggestedQuery": "apple"
}
```
          concepts: "missspelled text"
        }) {
          content
          _additional {
            spellCheck {
              changes {
                corrected
                original
              }
              didYouMean
              location
              originalText
            }
          }
        }
      }
    }
    ```

    will produce results similar to the following:

    ```
      "_additional": {
        "spellCheck": [
          {
            "changes": [
              {
                "corrected": "misspelled",
                "original": "missspelled"
              }
            ],
            "didYouMean": "misspelled text",
            "location": "nearText.concepts[0]",
            "originalText": "missspelled text"
          }
        ]
      },
      "content": "..."
    },
    ```
    2. 它通过在现有的`text2vec-*`模块中添加`autoCorrect`标志来扩展，如果查询拼写错误，可以自动纠正查询。

  * ### 新模块 `ner-transformers` - 使用transformers从Weaviate中提取实体 (#1632)
    使用基于transformers的模型可以在查询时从现有的Weaviate对象中提取实体。请注意，为了达到最佳性能，transformers模型应该在GPU上运行。也可以在CPU上运行，但吞吐量会较低。

    要使用该模块的功能，只需将查询扩展为以下新的 `_additional` 属性：

    ```graphql
{
  Get {
    Post {
      content
      _additional {
        tokens(
          properties: ["content"],    # 必填
          limit: 10,                  # 可选，整数
          certainty: 0.8              # 可选，浮点数
        ) {
          certainty
          endPosition
          entity
          property
          startPosition
          word
        }
      }
    }
  }
}
```
    它将返回类似以下的结果：

```
"_additional": {
  "tokens": [
    {
      "property": "content",
      "entity": "PER",
      "certainty": 0.9894614815711975,
      "word": "Sarah",
      "startPosition": 11,
      "endPosition": 16
    },
    {
      "property": "content",
      "entity": "LOC",
      "certainty": 0.7529033422470093,
      "word": "London",
      "startPosition": 31,
          * Bug修复
  * 聚合`number`数据类型时可能会出现卡顿问题 (#1660)

## 版本1.6.0的变更日志
* 没有破坏性变更
* 没有新功能
 * **零-shot分类（#1603）** 此版本添加了一种新的分类类型`zeroshot`，可与任何`vectorizer`或自定义向量一起使用。它选择与源对象之间距离最小的标签对象。链接使用交叉引用进行，类似于Weaviate中的现有分类。要启动零-shot分类，请在您的`POST /v1/classifications`请求中使用`"type": "zeroshot"`，并使用`"classifyProperties": [...]`指定您想要正常分类的属性。由于零-shot不涉及训练数据，因此您无法设置`trainingSetWhere`过滤器，但可以直接过滤源对象（`"sourceWhere"`）和标签对象（`"targetWhere"`）。
* 修复问题


## 版本 1.5.2 的更新日志

* 没有破坏性的改动
* 没有新增功能
* 修复的问题：
* ### 修复可能的数据竞争 (`short write`) (#1643)
  该版本修复了各种可能导致无法恢复的错误 `"short write"` 的数据竞争问题。这些竞争的可能性在 `v1.5.0` 中引入，并且我们强烈建议在 `v1.5.x` 时间线上运行的任何用户立即升级到 `v1.5.2`。

## 版本 1.5.1 的更新日志

* 没有破坏性的改动
* 没有新功能
* Bug修复:
* ### 在HNSW提交日志意外崩溃后的崩溃循环 (#1635)
  如果Weaviate在写入提交日志时被终止（例如OOMKill），则在下次重新启动后无法解析它，从而导致崩溃循环。此修复解决了这个问题。请注意，在此类崩溃中不会丢失数据：部分写入的提交日志尚未向用户确认，因此尚未给出任何写入保证。因此，可以安全地丢弃它。

* ### 链式Like运算符不起作用（#1638）
在此修复之前，在`where`过滤器中链式使用`Like`操作符时，每个`valueString`或`valueText`包含通配符(`*`)的情况下，通常只有第一个操作符的结果会被反映出来。此修复确保了链式操作（And或Or）的正确反映。此错误不会影响其他操作符（例如`Equal`，`GreaterThan`等），只会影响使用通配符的`Like`查询。

* ### 修复Auto Schema功能中潜在的数据竞争问题 (#1636)
  此修复改进了自动模式功能中不正确的同步，极端情况下可能导致数据竞争。

## 迁移到版本1.5.0

### 迁移注意事项
*此版本没有任何API级别的破坏性更改，但是它改变了Weaviate内部的整个存储机制。因此，无法进行原地更新。从之前的版本升级时，需要创建一个新的设置，并重新导入所有数据。先前的备份与此版本不兼容。*

### 更新日志
* 没有破坏性更改
* 新功能:
  * 基于LSM-Tree的存储。之前的Weaviate版本使用基于B+Tree的存储机制。这种机制无法满足大规模导入的高写入速度要求。此版本完全重写了Weaviate的存储层，采用了自定义的LSM-Tree方法。这导致导入时间大大加快，通常比之前的版本快100%以上。
  * *自动模式特性*。在导入之前无需创建模式即可导入数据对象。类将自动创建，仍然可以手动进行调整。Weaviate将根据第一次看到属性时猜测属性类型。默认值可以使用＃1539中概述的环境变量进行配置。该特性默认开启，但完全不会导致破坏。您仍然可以随意创建明确的模式。
* 修复：
  * *改进聚合查询*。减少某些聚合查询所需的分配量，加快查询速度，并减少聚合过程中遇到的超时次数。

请访问[此 GitHub 页面](https://github.com/weaviate/weaviate/releases/tag/v1.5.0)查看所有更改内容。

## 版本 1.4.0 的更新日志

* 无破坏性变更
* 新功能：
  * 图像模块[`img2vec-neural`](/developers/weaviate/modules/retriever-vectorizer-modules/img2vec-neural.md)
  * 为 `amd64` CPU（Intel、AMD）添加硬件加速
  * 支持整个 Weaviate 栈的 `arm64` 技术
  * 设置搜索时的 `ef`
  * 引入新的数据类型 `blob`
  * 跳过对类进行向量索引
* 修复：
  * 在 HNSW 向量索引中进行各种性能修复
  * 在矢量化时使属性顺序保持一致
  * 修复使用自定义向量时的 `PATCH` API 问题
  * 检测可能导致重复向量的模式设置，并打印警告信息
  * 修复了转换器模块上缺失的模式验证

请查看[此github页面](https://github.com/weaviate/weaviate/releases/tag/v1.4.0)获取所有更改信息。

## 版本1.3.0的更新日志

* 没有破坏性变更
* 新功能：[问答（Q&A）模块](/developers/weaviate/modules/reader-generator-modules/qna-transformers.md)
* 新功能：所有基于转换器的模块的新元信息

查看[此 GitHub 页面](https://github.com/weaviate/weaviate/releases/tag/v1.3.0) 获取所有更改信息。

## 版本 1.2.0 的更新日志

* 无破坏性更改
* 新功能：引入[Transformer 模块](/developers/weaviate/modules/reader-generator-modules/qna-transformers.md)

查看[此 GitHub 页面](https://github.com/weaviate/weaviate/releases/tag/v1.2.0) 获取所有更改信息。

## 版本 1.1.0 的更新日志

* 无破坏性更改
* 新功能：GraphQL中的`nearObject`搜索，用于获取最相似的对象。
* 架构更新：交叉引用批量导入速度改进。

请查看[此GitHub页面](https://github.com/weaviate/weaviate/releases/tag/v1.1.0)了解所有更改内容。

## 迁移到版本1.0.0

Weaviate 1.0.0版本于2021年1月12日发布，主要更新内容是模块化。从1.0.0版本开始，Weaviate是模块化的，意味着底层结构依赖于可插拔的向量索引，可插拔的向量化模块，并且具有扩展性，可以添加自定义模块。

Weaviate 1.0.0版本与0.23.2版本相比，在数据模式、API和客户端方面有大量的重大变化。以下是所有（重大）变化的概述。

对于特定客户端库的更改，请查看特定客户端的更改日志（[Go](/developers/weaviate/client-libraries/go.md#change-logs)，[Python](/developers/weaviate/client-libraries/python.md#change-logs)，[TypeScript/JavaScript](/developers/weaviate/client-libraries/typescript.mdx#changelog)和[CLI](/developers/weaviate/client-libraries/cli.md#change-logs)）。

此外，控制台的新版本已发布。请访问控制台文档获取更多信息。

### 概述
这里包含大部分整体变化，但并非所有细节。具体细节请参阅["变更"](#changes)。

#### 所有RESTful API的变更
* 从`/v1/schema/things/{ClassName}`变更为`/v1/schema/{ClassName}`
* 从`/v1/schema/actions/{ClassName}`变更为`/v1/schema/{ClassName}`
* 从`/v1/things`变更为`/v1/objects`
* 从`/v1/actions`变更为`/v1/objects`
* 从`/v1/batching/things`变更为`/v1/batch/objects`
* 将`/v1/batching/actions`更改为`/v1/batch/objects`
* 将`/v1/batching/references`更改为`/v1/batch/references`
* 附加数据对象的属性被分组在`?include=...`中，并且这些属性的前导下划线被移除
* 引入了`/v1/modules/`端点。
* `/v1/meta/`端点现在在`"modules"`中包含了特定模块的信息。

#### 所有GraphQL API的更改
* 移除了查询层次结构中的Things和Actions层
* 数据对象的引用属性现在是小写字母（之前是大写字母）
* 下划线属性，uuid和certainty现在被分组在对象`_additional`中
* `explore()`筛选器更名为`near<MediaType>`筛选器
* 在`Get{}`查询中引入了`nearVector(vector:[])`筛选器
* `Explore (concepts: ["foo"]){}`查询已更改为`Explore (near<MediaType>: ... ) {}`。

#### 所有数据模式更改
* 删除了Things和Actions
* 类别和属性配置已更改以支持模块和向量索引类型设置。

#### 所有数据对象的更改
* 数据对象中的 `schema` 更改为 `properties`。

#### Contextionary
* Contextionary 已更名为模块 `text2vec-contextionary`。
* `/v1/c11y/concepts` 更改为 `/v1/modules/text2vec-contextionary/concepts`。
* `/v1/c11y/extensions` 更改为 `/v1/modules/text2vec-contextionary/extensions`。
* `/v1/c11y/corpus` 已移除。

#### 其他内容
* 删除了短信标识和长信标中的`/things`和`/actions`
* 分类主体已更改以支持模块化
* `DEFAULT_VECTORIZER_MODULE`是一个新的环境变量

### 变更

#### 删除Things和Actions
从数据模式中删除了`Things`和`Actions`。这会导致模式定义和API端点发生以下变化:
1. **数据模式：** 在模式终点中删除了“语义类型”（`Things`和`Actions`）。这意味着URL将发生变化：
  * 从 `/v1/schema/things/{ClassName}` 变为 `/v1/schema/{ClassName}`
  * 从 `/v1/schema/actions/{ClassName}` 变为 `/v1/schema/{ClassName}`
2. **数据 RESTful API 终点：** 数据终点中删除了“语义类型”（`Things`和`Actions`）。取而代之，它将作为 `/objects` 进行命名空间处理。这意味着URL将发生变化：
  * 从 `/v1/things` 到 `/v1/objects`
  * 从 `/v1/actions` 到 `/v1/objects`
  * 从 `/v1/batching/things` 到 `/v1/batch/objects`（参见[批处理更名](#renaming-batching-to-batch)）
  * 从 `/v1/batching/actions` 到 `/v1/batch/objects`（参见[批处理更名](#renaming-batching-to-batch)）
1. **GraphQL:** 查询层次结构中的 `Semantic Kind` "level" 将被删除，不再替换（在 `Get` 和 `Aggregate` 查询中），即
   ```graphql
   {
     Get {
       Things {
  ClassName {
    propName
  }
}
}

将被转换为

```graphql
{
  Get {
    ClassName {
      propName
    }
  }
}
```

1. **数据信标：**`Semantic Kind`将从信标中删除：
   * **简短形式信标：**

     * `weaviate://localhost/things/4fbacd6e-1153-47b1-8cb5-f787a7f01718`

     转换为

     * `weaviate://localhost/4fbacd6e-1153-47b1-8cb5-f787a7f01718`

   * **长形式信标：**

     * `weaviate://localhost/things/ClassName/4fbacd6e-1153-47b1-8cb5-f787a7f01718/propName`

     转为

     * `weaviate://localhost/ClassName/4fbacd6e-1153-47b1-8cb5-f787a7f01718/propName`

#### 将 `/batching/` 重命名为 `/batch/`

* `/v1/batching/things` 变为 `/v1/batch/objects`
* `/v1/batching/actions` 变为 `/v1/batch/objects`
* `/v1/batching/references` 变为 `/v1/batch/references`


#### 在数据对象中将 "schema" 改为 "properties"

数据对象上的名称"schema"不直观，被替换为"properties"。更改如下：

```json
{
  "class": "Article",
  "schema": {
    "author": "Jane Doe"
  }
}
```

to

```json
{
  "class": "Article",
  "properties": {
    "author": "Jane Doe"
  }
}
```

#### GraphQL属性的一致大小写

以前，在模式定义中引用的属性始终是小写的，但在GraphQL中它们需要大写。例如：`Article { OfAuthor { … on Author { name } } } }`，即使属性被定义为ofAuthor。新的变化是，GraphQL中的大小写完全反映了模式定义中的大小写，因此上面的示例将变为：`Article { ofAuthor { … on Author { name } } } }`

#### GraphQL和RESTful API中的附加数据属性
自从进行模块化以来，模块可以为数据对象贡献附加属性（因此不是固定的），这些属性应该可以通过GraphQL和/或RESTful API检索到。
1. **REST**: `additional`属性（以前称为`"underscore"`属性）可以在RESTful查询调用中包含，例如`?include=...`，例如`?include=classification`。下划线将从名称中移除（例如，`?include=_classification`已被弃用）。在Open API规范中，所有附加属性将分组在`additional`对象中。例如：
    ```json
    {
      "class": "Article",
      "schema": { ... },
      "_classification": { … }
    }
    ```

    转换为

    ```json
    {
      "class": "Article",
      "properties": { ... },
      "additional": {
        "classification": { ... }
      }
    }
    ```
2. **GraphQL**: GraphQL查询中的`"underscore"`属性被重命名为`additional`属性。
   1. 数据对象的所有以前的`"underscore"`属性（例如`_certainty`）现在都被分组在`_additional {}`对象中（例如`_additional { certainty }`）。

```
   2. 现在将`uuid`属性放置在`_additional {}`对象中，并重命名为`id` （例如 `_additional { id }`）。
   这个例子涵盖了两个改变：

   从

   ```graphql
    {
      Get {
        Things {
          Article {
            title
            uuid
            certainty
            _classification
          }
        }
      }
    }
   ```

   到

   ```graphql
   {
     Get {
       Article {
         title
         _additional {      # 前导_防止冲突
           确定性
           id               # 替代 uuid
           classification
         }
       }
     }
   }
   ```

#### 模块化 RESTful 端点
随着 Weaviate 的模块化，引入了 `v1/modules/` 端点。

#### GraphQL 语义搜索

通过模块化，可以对非文本对象进行向量化。搜索不再限于使用Contextionary对文本和数据对象进行向量化，还可以应用于非文本对象或原始向量。以前在Get查询中的“探索”过滤器和GraphQL中的“探索”查询都与文本相关，但是在Weaviate的新版本中对该过滤器进行了以下更改：

1. 过滤器 `Get ( explore: {} ) {}` 被重命名为 `Get ( near<MediaType>: {} ) {}`。
   1. 新增: `Get ( nearVector: { vector: [.., .., ..] } ) {}` 是模块独立的，因此始终可用。
   2. `Get ( explore { concepts: ["foo"] } ) {}` 将变为 `Get ( nearText: { concepts: ["foo"] } ) {}`，仅在附加了 `text2vec-contextionary` 模块时可用。

    从

    ```graphql
      {
        Get {
          Things {
            1. 将以下GraphQL查询：

    ```graphql
    {
      Get {
        Article (explore: { concepts: ["foo"] } ) {
          title
        }
      }
    }
    ```

    转换为：

    ```graphql
    {
      Get {
        Article (near<MediaType>: ... ) {
          title
        }
      }
    }
    ```

2. 类似于在 `Get {}` API 中使用的 explore 排序器，`Explore {}` API 也假设是文本。进行以下更改：

   从

   ```graphql
    {
      Explore (concepts: ["foo"]) {
        beacon
      }
    }
    ```

   转换为
   ```

   to

   ```graphql
    {
      Explore (near<MediaType>: ... ) {
        beacon
      }
    }
   ```

#### 数据模式配置
1. **每个类的配置**

    通过模块化，可以为每个类配置向量化模块、整体类的模块特定配置、向量索引类型以及向量索引类型特定配置：
    * `vectorizer` 指示负责向量化的模块（如果有的话）。

    * `moduleConfig` 允许按模块（按名称）进行配置。
      * 有关 Contextionary 特定属性配置，请参阅[此处](#text2vec-contextionary)。
    * `vectorIndexType` 允许选择向量索引（默认为 [HNSW](/developers/weaviate/concepts/vector-index.md#hnsw)）
    * `vectorIndexConfig` 是传递给索引的任意对象进行配置（默认配置可以在[这里](/developers/weaviate/configuration/indexes.md#how-to-configure-hnsw)找到）

    这个示例中的所有更改如下：

```json
{
  "class": "Article",
  "vectorizeClassName": true,
  "description": "string",
  "properties": [ … ]
}
```

将变成

```json
{
  "class": "Article",
  "vectorIndexType": "hnsw",        # 默认为hnsw
  "vectorIndexConfig": {
    "efConstruction": 100
  },
  "moduleConfig": {
    "text2vec-contextionary": {
      "vectorizeClassName": true
    },
```
        "encryptor5000000": { "enabled": true }  # 示例
      },
      "description": "string",
      "vectorizer": "text2vec-contextionary",  # 默认可配置
      "properties": [ … ]
    }
    ```

2. **每个属性的配置**

  通过模块化，可以对每个属性进行特定模块的配置，如果可用的话，并且可以指定一个属性是否应该包含在倒排索引中。
  * `moduleConfig` 允许按模块（按名称）进行配置。
   * 请参阅 [此处](#text2vec-contextionary) 以获取Contextionary特定的属性配置。
* `index` 将变为 `indexInverted`：一个布尔值，指示是否应该在倒排索引中对属性进行索引。

以下是此示例中的所有更改:

```json
{
  "dataType": [ "text" ],
  "description": "string",
  "cardinality": "string",
  "vectorizePropertyName": true,
  "name": "string",
```
    ```json
"keywords": [ … ],
    "index": true
  }
  ```

将变为

```json
{
  "dataType": [ "text" ],
  "description": "string",
  "moduleConfig": {
    "text2vec-contextionary": {
      "skip": true,
      "vectorizePropertyName": true,
    }
  },
  "name": "string",
  "indexInverted": true
}
```

#### RESTful /meta 端点

`/v1/meta` 对象现在包含了新引入的命名空间 `modules.<moduleName>` 下的模块特定信息：

来自

```json
{
  "hostname": "string",
  "version": "string",
  "contextionaryWordCount": 0,
  "contextionaryVersion": "string"
}
```

to

```json
{
  "hostname": "string",
  "version": "string",
  "modules": {
    "text2vec-contextionary": {
      "wordCount": 0,
      "version": "string"
     }
  }
}
```

#### 模块化分类

某些分类类型与模块相关联（例如前面的“上下文”分类与`text2vec-contextionary`模块相关联）。我们区分了始终存在的字段和类型相关的字段。此外，通过在单独的属性中对`settings`和`filters`进行分组，改进了API。kNN分类是唯一一种在Weaviate Core中无需依赖模块即可使用的分类类型。前面的“上下文”分类与`text2vec-contextionary`模块相关联，参见[这里](#text2vec-contextionary)。下面是分类API POST请求体的更改示例：

从

```json
{
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "type": "knn",
  "k": 3,
  "sourceWhere": { … },
  "trainingSetWhere": { … },
  "targetWhere": { … },
}

```

至于

```json
{
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "type": "knn",
  "settings": {
    "k": 3
  },
  "filters": {
    "sourceWhere": { … },
    "trainingSetWhere": { … },
    "targetWhere": { … },
  }
}
```

And the API GET body:

From

```json
{
  "id": "ee722219-b8ec-4db1-8f8d-5150bb1a9e0c",
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "status": "running",
  "meta": { … },
  "type": "knn",
  "k": 3,
  "sourceWhere": { … },
  "trainingSetWhere": { … },
  "targetWhere": { … },
}
```

To

```json
{
  "id": "ee722219-b8ec-4db1-8f8d-5150bb1a9e0c",
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "status": "running",
  "meta": { … },
  "type": "knn",
  "settings": {
    "k": 3
  },
  "filters": {
    "sourceWhere": { … },
    "trainingSetWhere": { … },
    "targetWhere": { … },
  }
}
```

#### text2vec-contextionary
Contextionary成为Weaviate的第一个向量化模块，在正式使用中被重命名为`text2vec-contextionary`。这带来了以下变化：
1. **RESTful** 端点`/v1/c11y`更改为`v1/modules/text2vec-contextionary`：
   * `/v1/c11y/concepts`更改为`/v1/modules/text2vec-contextionary/concepts`
   * `/v1/c11y/extensions`更改为`/v1/modules/text2vec-contextionary/extensions`
   * `/v1/c11y/corpus`已移除
2. **数据模式：** 在模式定义中的`text2vec-contextionary`特定模块的配置选项
   1. **每个类别**。`"vectorizeClassName"`指示是否将类名纳入数据对象的向量计算中。

    ```json
    {
      "class": "Article",
      "moduleConfig": {
        "text2vec-contextionary": {
          "vectorizeClassName": true
        }
      },
      "description": "string",
      "vectorizer": "text2vec-contextionary",
      "properties": [ … ]
    }
    ```

   2. **按属性。** `skip` 指示是否跳过整个属性（包括值）从数据对象的向量位置。`vectorizePropertyName` 指示是否将属性名纳入数据对象的向量计算中。

    ```json
    {
      "dataType": [ "text" ],
      "description": "string",
      "moduleConfig": {
        "text2vec-contextionary": {
          "skip": true,
          "vectorizePropertyName": true,
        }
      },
      "name": "string",
      "indexInverted": true
    }
    ```
3. **上下文分类**。上下文分类依赖于`text2vec-contextionary`模块。可以在`/v1/classifications/`中通过分类名称`text2vec-contextionary-contextual`来激活：

从

```json
{
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "type": "contextual",
  "informationGainCutoffPercentile": 30,
  "informationGainMaximumBoost": 3,
  "tfidfCutoffPercentile": 80,
  "minimumUsableWords": 3,
  "sourceWhere": { … },
  "trainingSetWhere": { … },
  "targetWhere": { … },
}
```

至

```json
{
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "type": "text2vec-contextionary-contextual",
  "settings": {
    "informationGainCutoffPercentile": 30,
    "informationGainMaximumBoost": 3,
    "tfidfCutoffPercentile": 80,
    "minimumUsableWords": 3
  },
  "filters": {
    "sourceWhere": { … },
    "trainingSetWhere": { … },
    "targetWhere": { … }
  }
}
```

#### 默认矢量化模块
可以在新的环境变量中指定默认的矢量化模块，这样就不需要在模式中的每个数据类中指定。环境变量是`DEFAULT_VECTORIZER_MODULE`，可以设置为例如`DEFAULT_VECTORIZER_MODULE="text2vec-contextionary"`。

### 官方发布说明
官方发布说明可以在[GitHub](https://github.com/weaviate/weaviate/releases/tag/0.23.0)上找到。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />