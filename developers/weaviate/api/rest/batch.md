---
image: og/docs/api.jpg
sidebar_position: 13
title: REST - /v1/batch
---

import Badges from '/_includes/badges.mdx';
import BeaconsRequireLocalhost from '/_includes/beacon-localhost.md';

<Badges/>

## 批量创建对象

用于将数据对象批量发送到Weaviate。

:::tip Multi-tenancy
The `batch` endpoint supports classes where [multi-tenancy](../../concepts/data.md#multi-tenancy) is enabled. For example, batch creation of objects works similarly to [single object creation](./objects.md#create-a-data-object), by passing the `tenant` parameter in the object body.
:::

### 性能

:::tip
Import speeds, especially for large datasets, will drastically improve when using the batching endpoint.
:::

需要记住的几点：

1. 如果您使用的矢量化器支持 GPU 加速，请尽量启用，这将大幅提升导入速度。
2. 避免对多个数据对象使用重复的向量。
3. 处理错误。如果忽略错误，可能会导致导入过程中出现显著的延迟。
1. 如果您的导入在特定数量的对象（例如2M）之后变慢，请检查您的模式中的[`vectorCacheMaxObjects`](../../configuration/indexes.md#how-to-configure-hnsw)是否大于对象的数量。另请参阅[此示例](https://github.com/weaviate/semantic-search-through-wikipedia-with-weaviate/blob/d4711f2bdc75afd503ff70092c3c5303f9dd1b3b/step-2/import.py#L58-L59)。
1. 在使用矢量化器时，有一些方法可以改善您的设置，就像我们在维基百科演示数据集中展示的那样。订阅我们在论坛上发布的[公告类别](https://forum.weaviate.io/c/announcements/7)，以便及时了解更多关于这个主题的内容。

### 方法和URL

```js
POST /v1/batch/objects[?consistency_level=ONE|QUORUM|ALL]
```

### 参数

URL支持一个可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)查询参数：

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | ---- |------------ |
| `consistency_level` | 查询参数 | 字符串 | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)：`ONE`，`QUORUM`（默认值）或`ALL`。 |

POST请求体要求包含以下字段：

| 名称 | 类型 | 是否必填 | 描述 |
| ---- | ---- | ---- | ---- |
| `objects` | 数据对象数组 | 是 | [对象](./objects.md#parameters-1)的数组 |

### 示例请求

<BeaconsRequireLocalhost />

import BatchObjects from '/_includes/code/batch.objects.mdx';

<BatchObjects/>

## 使用Python客户端批量创建对象

针对Python客户端的具体文档可以在[weaviate-python-client.readthedocs.io](https://weaviate-python-client.readthedocs.io/en/stable/weaviate.batch.html)找到。了解有关批处理的不同类型和提示与技巧，请访问[Weaviate Python客户端页面](/developers/weaviate/client-libraries/python.md)。

## 批量创建引用

用于批量添加数据对象之间的交叉引用。

### 方法和URL

```js
POST /v1/batch/references
```

### 参数

URL支持一个可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)查询参数：

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | ---- |------------ |
| `consistency_level` | 查询参数 | 字符串 | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency): `ONE`, `QUORUM` (默认) 或 `ALL`。 |

POST请求的请求体是一个包含以下字段的元素数组：

| 名称 | 类型 | 必填 | 描述 |
| ---- | ---- | ---- | ---- |
| `from` | Weaviate Beacon（长格式） | 是 | Beacon，以交叉引用属性名称结尾：`weaviate://localhost/{ClassName}/{id}/{crefPropertyName}` |
| `to` | Weaviate Beacon（普通格式） | 是 | Beacon，格式为`weaviate://localhost/{ClassName}/{id}` |

<BeaconsRequireLocalhost />

:::note
For backward compatibility, you can omit the class name in the
short-form beacon format that is used for `to`. You can specify it as
`weaviate://localhost/{id}`. This is, however, considered deprecated and will be
removed with a future release, as duplicate IDs across classes could mean that
this beacon is not uniquely identifiable. For the long-form beacon - used as part
of `from` - you always need to specify the full beacon, including the reference
property name.
:::

### 示例请求

import BatchReferences from '/_includes/code/batch.references.mdx';

<BatchReferences/>


有关Python中批处理的详细信息和说明，请参阅[weaviate.batch.Batch](https://weaviate-python-client.readthedocs.io/en/latest/weaviate.batch.html#weaviate.batch.Batch)文档。

## 批量删除

您可以使用HTTP动词`DELETE`在`/v1/batch/objects`端点上删除与特定表达式匹配的所有对象。要确定对象是否匹配，会使用[where-Filter](../graphql/filters.md#where-filter)。请求体接受一个单一的过滤器，但会删除所有匹配的对象。它会返回匹配的对象数量以及任何潜在的错误。请注意，使用此过滤器一次可以删除的对象数量是有限制的，下面会进行解释。

### 每个查询的最大删除次数

使用单个查询删除的对象数量是有上限的。这样可以防止意外的内存激增和非常长时间运行的请求，这些请求容易出现客户端超时或网络中断的问题。如果筛选器匹配了很多对象，那么只会删除前面的 `n` 个元素。您可以通过在 [Weaviate 的配置](../../config-refs/env-vars.md) 中设置 `QUERY_MAXIMUM_RESULTS` 来配置 `n` 的值。默认值是 10,000。对象的删除顺序与使用相同的筛选器在 [Get 查询](../graphql/get.md) 中返回的顺序相同。如果要删除超过限制数量的对象，请多次运行相同的查询，直到不再匹配任何对象。


### 删除前的试运行

您可以使用试运行选项，在删除任何对象之前，查看将使用您指定的筛选器删除的对象。根据配置的详细程度，您将收到受影响对象的总数或受影响 ID 的列表。

### 方法和 URL

```js
DELETE /v1/batch/objects[?consistency_level=ONE|QUORUM|ALL]
```

### 参数

URL支持一个可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)查询参数:

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | ---- |------------ |
| `consistency_level` | 查询参数 | 字符串 | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency): `ONE`, `QUORUM`（默认值）或 `ALL`。|

请求体需要以下字段:

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | -------- | ----------- |
| `match` | 对象 | 是 | 描述如何查找要删除的对象的对象（请参见下面的示例） |
| `output` | 字符串 | 否 | 可选的详细程度，`minimal`（默认）或`verbose` |
| `dryRun` | 布尔值 | 否 | 如果为true，则不会立即删除对象，而只是列出。 默认为`false`。 |

#### 请求体详细信息

```yaml
{
  "match": {
    "class": "<ClassName>",  # required
    "where": { /* where filter object */ },  # required
  },
  "output": "<output verbosity>",  # Optional, one of "minimal" or "verbose". Defaults to "minimal".
  "dryRun": <bool>  # Optional. If true, objects will not be deleted yet, but merely listed. Defaults to "false".
}
```

`output`的可能取值:

| 值 | 效果 |
| ----- | ------ |
| `minimal` | 结果只包含计数。如果删除成功，将省略有关对象的信息。只有在发生错误时，对象才会被描述。 |
| `verbose` | 结果列出了所有受影响的对象及其ID和删除状态，包括成功和失败的删除。


#### 详细的响应体内容

```yaml
{
  "match": {
    "class": "<ClassName>",        # matches the request
    "where": { /* where filter object */ },  # matches the request
  },
  "output": "<output verbosity>",  # matches the request
  "dryRun": <bool>,
  "results": {
    "matches": "<int>",            # how many objects were matched by the filter
    "limit": "<int>",              # the most amount of objects that can be deleted in a single query, matches QUERY_MAXIMUM_RESULTS
    "successful": "<int>",         # how many objects were successfully deleted in this round
    "failed": "<int>",             # how many objects should have been deleted but could not be deleted
    "objects": [{                  # one JSON object per weaviate object
      "id": "<id>",                # this successfully deleted object would be omitted with output=minimal
      "status": "SUCCESS",         # possible status values are: "SUCCESS", "FAILED", "DRYRUN"
      "error": null
    }, {
      "id": "<id>",                # this error object will always be listed, even with output=minimal
      "status": "FAILED",
      "errors": {
         "error": [{
             "message": "<error-string>"
         }]
      }
    }]
  }
}
```


### 示例请求

import BatchDeleteObjects from '/_includes/code/batch.delete.objects.mdx';

<BatchDeleteObjects/>

## 错误处理

发送批量请求到您的Weaviate实例时，可能会出现错误。这可能是由于多种原因造成的，例如与Weaviate的连接丢失，或者您尝试添加的单个数据对象中存在错误。

您可以检查是否发生错误，以及错误的类型。

批量请求成功时，批量请求总是会返回HTTP `200`状态码。这意味着批量请求已成功发送到Weaviate，并且连接或批量处理没有出现问题，请求也没有格式错误 (`4xx`状态码)。然而，通过`200`状态码，仍然可能存在未包含在响应中的数据对象的个别失败情况。因此，`200`状态码并不能保证每个批量项都已被添加/创建。一个未经检查个别结果的批量请求可能会忽略个别数据对象的错误示例：将与模式冲突的对象添加到批量中（例如，不存在的类名）。

以下Python代码可用于处理批处理中每个数据对象的错误。

```python
import weaviate

client = weaviate.Client("http://localhost:8080")


def check_batch_result(results: dict):
  """
  Check batch results for errors.

  Parameters
  ----------
  results : dict
      The Weaviate batch creation return value, i.e. returned value of the client.batch.create_objects().
  """

  if results is not None:
    for result in results:
      if 'result' in result and 'errors' in result['result']:
        if 'error' in result['result']['errors']:
          print(result['result']['errors']['error'])

object_to_add = {
    "name": "Jane Doe",
    "writesFor": [{
        "beacon": "weaviate://localhost/f81bfe5e-16ba-4615-a516-46c2ae2e5a80"
    }]
}

with client.batch(batch_size=100, callback=check_batch_result) as batch:
  batch.add_data_object(object_to_add, "Author", "36ddd591-2dee-4e7e-a3cc-eb86d30a4303")
```

这也可以用于批量添加参考文献。请注意，发送批处理，特别是参考文献，会跳过一些对象和参考文献级别的验证。在上述单个数据对象上添加此验证，可以减少错误未被发现的可能性。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />