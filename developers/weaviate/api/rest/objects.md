---
image: og/docs/api.jpg
sidebar_position: 12
title: REST - /v1/objects
---

import Badges from '/_includes/badges.mdx';
import BeaconsRequireLocalhost from '/_includes/beacon-localhost.md';
import BeaconsBackCompatOmitClassname from '/_includes/beacons-backcompat-omit-class.md'

<Badges/>

## 列出数据对象

:::tip Do you want to list all objects from Weaviate?
Use the [`after`](#exhaustive-listing-using-a-cursor-after) parameter.
:::

按创建顺序逆序列出数据对象。数据将以对象数组的形式返回。

import HowToGetObjectCount from '/_includes/how.to.get.object.count.mdx';

:::tip After a class object count?
A: This `Aggregate` query will output a total object count in a class.

<HowToGetObjectCount/>
:::

#### 方法和URL

没有任何限制（跨类别，默认限制为25）：

```http
GET /v1/objects
```

包含可选查询参数：

```http
GET /v1/objects?class={ClassName}&limit={limit}&include={include}
```

#### 参数

:::note All parameters below are optional URL query parameters
:::

| 名称 | 类型 | 描述 |
| ---- | ---- | ----------- |
| `class` | 字符串 | 使用类名按类别列出对象。 |
| `limit` | 整数 | 返回的数据对象的最大数量。默认为25。 |
| `offset` | 整数 | 返回对象的偏移量（返回对象的起始索引）。<br/><br/>不能与 `after` 一起使用。<br/>应与 `limit` 结合使用。 |
| `after` | string | 要列出对象的ID之后的对象的ID（不包括ID）。<br/><br/>必须与`class`一起使用。<br/>不能与`offset`或`sort`一起使用。<br/>应与`limit`一起使用。 |
| `include` | string | 包括额外的信息，例如分类信息。<br/><br/>允许的值包括：`classification`，`vector`，`featureProjection`和其他模块特定的附加属性。 |
| `sort` | string | 要排序的属性名称 - 例如 `sort=city`<br/><br/>也可以提供多个名称 - 例如 `sort=country,city` |
| `order` | string | 排序顺序。<br/><br/>可能的值：`asc`（默认）和 `desc`。 <br/>应与 `sort` 一起使用。|

### 分页：`offset`

:::tip
You can use `limit` and `offset` for paging results.
:::

`offset`参数是一种灵活的分页结果的方式，它允许与`sort`等参数一起使用。它受到`QUERY_MAXIMUM_RESULTS`值的限制，该值设置了可以使用此参数列出的对象的最大总数。

获取前10个对象：
```http
GET /v1/objects?class=MyClass&limit=10
```

获取第二批10个对象：
```http
GET /v1/objects?class=MyClass&limit=10&offset=10
```

获取下一个批次的10个对象：
```http
GET /v1/objects?class=MyClass&limit=10&offset=20
```

### 使用游标进行详尽列表：`after`

:::tip
- Available from version `v1.18.0`.
- You can use `class`, `limit` and `after` for listing an entire object set from a class.
- The `after` parameter is based on the order of ids. It can therefore only be applied to list queries without sorting.
:::

您可以使用`after`参数从Weaviate实例中检索所有对象。`after`参数（“Cursor API”）根据id的顺序检索类的对象。您可以将上一个检索到的对象的id作为游标传递，以开始下一页的检索。

在没有指定`class`的情况下，无法使用`after`参数。

对于类似于`offset=0`的空值，请在请求中设置`after=`或`after`（即空字符串）。

#### 示例

获取 `MyClass` 的前10个对象：
```http
GET /v1/objects?class=MyClass&limit=10
```

如果上述检索到的集合中的最后一个对象是 `b1645a32-0c22-5814-8f35-58f142eadf7e`，您可以按照以下方式检索其后的下10个 `MyClass` 对象：

```http
GET /v1/objects?class=MyClass&limit=10&after=b1645a32-0c22-5814-8f35-58f142eadf7e
```

### 示例排序

:::tip
You can use `sort` and `order` to sort your results.
:::

按作者姓名升序排序:
```http
GET /v1/objects?class=Book&sort=author_name
```

按作者姓名降序排序：
```http
GET /v1/objects?class=Book&sort=author_name&order=desc
```

按作者姓名排序，然后按标题排序。
```http
GET /v1/objects?class=Book&sort=author_name,title
```

按作者名排序，然后按标题排序，顺序为：
```http
GET /v1/objects?class=Book&sort=author_name,title&order=desc,asc
```

### 响应字段

对于数据对象的`GET`查询的响应将提供有关所有对象（或单个对象）的信息[(或单个对象)](#get-a-data-object)。除了关于数据对象的一般信息，如模式信息和属性值之外，还将显示基于请求中的`include`字段或`additional properties`的元信息。

#### 响应格式

```js
{
  "objects": [/* list of objects, see below */],
  "deprecations": null,
}
```

### 对象字段

| 字段名 | 数据类型 | 必需的 `include` 或 `additional` 字段 | 描述 |
| ------ | -------- | ----------------------------------- | ---- |
| `class` | 字符串 | 无 | 类名。 |
| `creationTimeUnix` | Unix 时间戳 | 无 | 数据对象创建的时间戳。 |
| `id` | UUID | 无 | 数据对象的 UUID。 |
| `lastUpdateTimeUnix` | Unix 时间戳 | 无 | 数据对象最后更新的时间戳。 |
| `properties` > `{propertyName}` | dataType | none | 表示一个属性的名称和值。 |
| `properties` > `{crefPropertyName}` > `classification` > `closestLosingDistance` | float | `classification` | 失败组中最近的邻居的最小距离。可选。如果 `k` 等于获胜组的大小，则没有失败组。 |
| `properties` > `{crefPropertyName}` > `classification` > `closestOverallDistance` | float | `classification` | 无论邻居是否属于获胜组，都是最低距离。 |
| `properties` > `{crefPropertyName}` > `classification` > `closestWinningDistance` | float | `classification` | 距离获胜组最近的邻居的距离。 |
| `properties` > `{crefPropertyName}` > `classification` > `losingCount` | 整数 | `classification` | 失败组的大小，如果获胜组大小等于 `k`，可能为 0。 |
| `properties` > `{crefPropertyName}` > `classification` > `meanLosingDistance` | 浮点数 | `classification` | 失败组的平均距离。它是一个归一化的距离（介于 0 和 1 之间），其中 0 表示相等，1 表示完全相反。 |
| `properties` > `{crefPropertyName}` > `classification` > `meanWinningDistance` | float | `classification` | 获胜组的平均距离。它是一个标准化的距离（在0到1之间），其中0表示相等，1表示完全相反。 |
| `属性` > `{crefPropertyName}` > `分类` > `overallCount` | 整数 | `分类` | 作为分类的一部分检查的总邻居数。在大多数情况下，这将等于`k`，但可能低于`k` - 例如，如果没有足够的数据。 |
| `属性` > `{crefPropertyName}` > `分类` > `winningCount` | 整数 | `分类` | 获胜组的大小，介于1和`k`之间的数字。 |
| `vector` | 浮点数列表 | `vector` | 为对象计算的向量嵌入。 |
| `classification` > `basedOn` | 字符串 | `classification` | 基于哪个属性进行分类的属性名称。 |
| `classification` > `classifiedFields` | 字符串 | `classification` | 分类的属性。 |
| `classification` > `completed` | 时间戳 | `classification` | 分类完成的时间。 |
| `classification` > `id` | UUID | `classification` | 分类的ID。 |
| `classification` > `scope` | 字符串列表 | `classification` | 进行分类的初始字段。 |
| `featureProjection` > `vector` | 浮点数列表 | `featureProjection` | 特征投影的二维或三维向量坐标。 |

### 状态码和错误情况

| 原因 | 描述 | 结果 |
| ---- | ---- | ---- |
| 不存在对象 | 未提供 `?class`。整个 Weaviate 实例中不存在对象。 | `200 OK` - 无错误 |
| 有效的类，没有对象存在 | 提供了`?class`，类存在，但没有对象存在 | `200 OK` - 无错误 |
| 无效的类 | 提供了`?class`，类不存在 | `404 Not Found` |
| 验证 | 其他无效的用户请求 | `422 Unprocessable Entity` |
| 授权 | 不允许查看资源 | `403 Forbidden` |
| 服务器端错误 | 用户输入正确，但请求失败的其他原因。 | `500 Internal Server Error` - 包含详细的错误消息 |

#### 示例请求

import SemanticKindGet from '/_includes/code/semantic-kind.get.mdx';

<SemanticKindGet/>

## 创建数据对象

创建一个新的数据对象。提供的元数据和模式值将被验证。

### `objects` vs `batch`

:::tip
The `objects` endpoint is meant for individual object creations.
:::

如果您计划导入大量对象，最好使用 [`/v1/batch`](./batch.md) 端点，这样更加高效。否则，按顺序发送多个单独的请求会导致性能损失较大：

1. 每个顺序请求在服务器端由单个线程处理，而大部分服务器资源是空闲的。此外，如果您只有在第一个请求完成后才发送第二个请求，那么会等待很多网络开销。
1. 并行导入更加高效。这样可以减少连接开销，并在服务器端使用多个线程进行索引。
2. 您不需要自己进行并行化，可以使用[`/v1/batch`](./batch.md)端点来实现。即使您从单个客户端线程发送批处理请求，批处理中的对象也会由多个服务器线程处理。
1. 使用批处理端点时，导入速度，尤其是对于大型数据集，将显著提高。

:::note Idempotence of POST requests in `objects` and `batch`
The idempotence behavior differs between these two endpoints. POST /batch/objects is idempotent, and will overwrite any existing object given an id. POST /objects will fail if an id is provided which already exists in the class.

To update an existing object with the `objects` endpoint, use the [PUT or PATCH method](#update-a-data-object).
:::

#### 方法和URL

```http
POST /v1/objects[?consistency_level=ONE|QUORUM|ALL]
```

:::note
The class name is not specified in the URL, as it is part of the request body.
:::

#### 参数

URL支持一个可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)查询参数：

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | ---- |------------ |
| `consistency_level` | 查询参数 | 字符串 | 可选的一致性级别：`ONE`，`QUORUM`（默认）或`ALL`。 |

新对象的请求体具有以下字段：

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | -------- |------------ |
| `class` | 字符串 | 是 | 在架构中定义的类名 |
| `properties` | 数组 | 是 | 包含新数据对象的属性值的对象 |
| `properties` > `{propertyName}` | 数据类型 | 是 | 根据设置的数据类型定义的属性及其值 |
| `id` | v4 UUID | 否 | 对象的可选ID |
| `vector` | `[float]` | no | 可选的[自定义向量](#with-a-custom-vector) |
| `tenant` | `string` | no | 可选的租户名称。必须先启用[多租户](../../concepts/data.md#multi-tenancy)。 |

#### 示例请求

import SemanticKindCreate from '/_includes/code/semantic-kind.create.mdx';

<SemanticKindCreate/>

### 使用地理坐标

如果您想提供一个 [`geoCoordinates`](/developers/weaviate/config-refs/datatypes.md#datatype-geocoordinates) 属性，您需要将 `latitude` 和 `longitude` 指定为浮点型的十进制度数：

import SemanticKindCreateCoords from '/_includes/code/semantic-kind.create.geocoordinates.mdx';

<SemanticKindCreateCoords/>

### 使用自定义向量

创建数据对象时，您可以配置Weaviate使用向量化模块生成一个向量，或者您可以自己提供向量。我们有时将此称为“自定义”向量。

在对象创建过程中，您可以在以下两种情况下提供自定义向量：
- 您在该类别中不使用向量化器，或者
- 您使用向量化器，但希望在对象创建阶段绕过它。

您可以按如下方式创建带有自定义向量的数据对象：
1. 在[data schema](../../configuration/schema-configuration.md#specify-a-vectorizer)中的相关类中设置`"vectorizer"`。
    - 如果您根本不使用向量化器，请相应地配置该类。您可以进行以下操作：
        - 将默认的向量化器模块设置为`"none"`（`DEFAULT_VECTORIZER_MODULE="none"`），或者
        - 将类的`"vectorizer"`设置为`"none"` (`"vectorizer": "none"`)（*注意：类的`vectorizer`设置将覆盖`DEFAULT_VECTORIZER_MODULE`参数*）。
    - 如果您希望绕过向量化器进行对象创建：
      - 将向量化器设置为与生成自定义向量时相同的向量化器，并具有相同的设置
    > *注意：除了检查向量长度之外，不对该向量进行任何验证。*
2. 然后，在对象创建过程中将向量附加在特殊的`"vector"`字段上。例如，如果添加单个对象，可以使用以下代码：

import SemanticKindCreateVector from '/_includes/code/semantic-kind.create.vector.mdx';

<SemanticKindCreateVector/>

:::note
You can set custom vectors for batch imports as well as single object creation.
:::

参见[如何使用自定义向量进行搜索](../graphql/vector-search-parameters.md#nearvector)。

## 获取数据对象

收集一个单独的数据对象。

#### 方法和URL

自`v1.14`起可用，并且是首选方式：
```bash
GET /v1/objects/{ClassName}/{id}[?consistency_level=ONE|QUORUM|ALL]
```

import RestObjectsCRUDClassnameNote from '/_includes/rest-objects-crud-classname-note.md';

<details>
  <summary>获取没有类名的数据对象已被弃用</summary>

以下语法仅用于向后兼容，已被弃用：
```bash
GET /v1/objects/{id}
```

<RestObjectsCRUDClassnameNote/>

</details>


#### URL参数

| 名称 | 位置 | 类型 | 描述 |
| ---- |----------| ---- | ----------- |
| `{ClassName}` | 路径 | 字符串 | 对象所属的类的名称。 |
| `{id}` | 查询参数 | uuid | 要检索的数据对象的uuid。 |
| `include` | 查询参数 | 字符串 | 包含额外的信息，如分类信息。允许的值包括：`classification`，`vector`。 |
| `consistency_level` | 查询参数 | 字符串 | 可选 [一致性级别](../../concepts/replication-architecture/consistency.md#tunable-read-consistency): `ONE`, `QUORUM` (默认) 或 `ALL`。 |

#### 示例请求

[响应字段](#response-fields)在上面的对应部分中有解释。

import SemanticKindObjectGet from '/_includes/code/semantic-kind.object.get.mdx';

<SemanticKindObjectGet/>


## 检查数据对象是否存在

可以使用相同的端点和`HEAD` HTTP方法来检查数据对象是否存在，而无需检索它。在内部，它跳过了从磁盘读取对象的过程（仅检查是否存在），因此不会使用资源进行编组、解析等操作。
此外，生成的HTTP请求没有正文；仅通过状态代码指示对象的存在（当对象存在时为`204`，当不存在时为`404`，在无效的ID上为`422`）。

#### 方法和URL

自 `v1.14` 版本起可用，并且是首选方式:
```bash
HEAD /v1/objects/{ClassName}/{id}[?consistency_level=ONE|QUORUM|ALL]
```

<details>
  <summary>检查一个没有类名的数据对象是否存在已过时</summary>

下面的语法仅供向后兼容，并已被弃用：
```bash
HEAD /v1/objects/{id}
```

<RestObjectsCRUDClassnameNote/>

</details>

#### URL参数

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | ---- | ----------- |
| `{ClassName}` | 路径 | 字符串 | 对象所属类的名称 |
| `{id}` | 路径 | uuid | 要检索的数据对象的uuid |
| `consistency_level` | 查询参数 | 字符串 | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-read-consistency): `ONE`, `QUORUM` (默认) 或 `ALL`。 |
| `tenant` | 查询参数 | 字符串 | 可选的租户名称。必须先启用[多租户](../../concepts/data.md#multi-tenancy)。 |

#### 示例请求

import SemanticKindObjectHead from '/_includes/code/semantic-kind.object.head.mdx';

<SemanticKindObjectHead/>

## 更新数据对象

根据其uuid更新单个数据对象。

#### 方法和URL

在RESTful API中，接受`PUT`和`PATCH`两种方法。`PUT`会替换数据对象的所有属性值，而`PATCH`仅覆盖给定的属性。

从`v1.14`版本开始提供，也是首选方式：
```bash
PUT /v1/objects/{ClassName}/{id}[?consistency_level=ONE|QUORUM|ALL]
PATCH /v1/objects/{ClassName}/{id}[?consistency_level=ONE|QUORUM|ALL]
```

<details>
  <summary>更新没有类名的数据对象已废弃</summary>

以下仅供向后兼容使用，已废弃：
```bash
PUT /v1/objects/{id}
PATCH /v1/objects/{id}
```

<RestObjectsCRUDClassnameNote/>

</details>

:::info Recalculating vectors on update
If the class is configured with a vectorizer, Weaviate will only compute a new vector for an updated object if the update changes the underlying text to be vectorized.
:::

#### 参数

该URL具有两个必需的路径参数，并支持一个可选的查询参数用于[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)：

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | ---- | ----------- |
| `{ClassName}` | 路径 | 字符串 | 对象所属的类的名称 |
| `{id}` | 路径 | UUID | 要更新的数据对象的UUID |
| `consistency_level` | 查询参数 | 字符串 | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency): `ONE`, `QUORUM` (默认) 或 `ALL`。 |

替换对象的请求体具有以下字段：

| 名称 | 类型 | 必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `class` | 字符串 | 是 | 在模式中定义的类名 |
| `id` | string | ? | `PUT` 请求需要与 URL 中传递的 id 相同 |
| `properties` | array | yes | 包含新数据对象的属性值的对象 |
| `properties` > `{propertyName}` | dataType | yes | 根据设置的 dataType，指定属性和其值 |
| `vector` | `[float]` | no | 可选的 [自定义向量](#with-a-custom-vector) |
| `tenant` | `string` | no | 可选的租户名称。必须先启用[多租户](../../concepts/data.md#multi-tenancy)功能。 |

#### 示例请求

import SemanticKindObjectUpdate from '/_includes/code/semantic-kind.object.update.mdx';

<SemanticKindObjectUpdate/>

如果更新成功，将不返回任何内容。

## 删除数据对象

从Weaviate中删除单个数据对象。

#### 方法和URL

自 `v1.14` 版本起可用，且为首选方式：
```http
DELETE /v1/objects/{ClassName}/{id}[?consistency_level=ONE|QUORUM|ALL]
```

<details>
  <summary>删除没有类名的数据对象已经过时</summary>

下面的语法仅适用于向后兼容，已经过时：
```bash
DELETE /v1/objects/{id}
```

<RestObjectsCRUDClassnameNote/>

</details>

#### URL参数

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | ---- | ----------- |
| `{ClassName}` |  路径 | 字符串 | 对象所属类的名称 |
| `{id}` | 路径 | uuid | 要删除的数据对象的uuid |
| `consistency_level` | 查询参数 | 字符串 | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency): `ONE`, `QUORUM` (默认) 或 `ALL`。 |
| `tenant` | 查询参数 | 字符串 | 可选的租户名称。必须先启用[多租户](../../concepts/data.md#multi-tenancy)。 |

#### 示例请求

import SemanticKindObjectDelete from '/_includes/code/semantic-kind.object.delete.mdx';

<SemanticKindObjectDelete/>

如果删除成功，将不会返回任何内容。

## 验证数据对象

您可以在不创建对象的情况下验证其模式和元数据。如果对象的模式有效，则请求应该返回`True`/`true`（对于客户端）或在纯RESTful请求中不返回任何内容。否则，将返回一个错误对象。

#### 方法和URL

```http
POST /v1/objects/validate
```

:::note
As with creating an object, the class name is not specified through the URL, as it is part of the request body.
:::

#### 参数

验证对象的请求体具有以下字段：

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | -------- | ----------- |
| `class` | 字符串 | 是 | 在架构中定义的类名 |
| `properties` | 数组 | 是 | 包含新数据对象的属性值的对象 |
| `properties` > `{propertyName}` | 数据类型 | 是 | 属性及其值，根据设置的数据类型 |
| `id` | v4 uuid | no<sup>*</sup> | 数据对象的ID。<br/><sup>*客户端需要提供ID。</sup> |

#### 示例请求

import SemanticKindValidate from '/_includes/code/semantic-kind.validate.mdx';

<SemanticKindValidate/>


## 交叉引用

[交叉引用](../../config-refs/datatypes.md#datatype-cross-reference)是用于通过[信标](../../more-resources/glossary.md)从源对象链接到另一个对象的对象属性。

:::note Cross-references do not affect vectors
Creating cross-references does not affect object vectors in either direction.
:::

### 添加交叉引用

`POST` 请求将一个引用添加到给定属性的交叉引用数组中，该属性位于由其类名和id指定的源对象中。

#### 方法和URL

自`v1.14`版本起可用，并且是首选方法：

```http
POST /v1/objects/{ClassName}/{id}/references/{propertyName}[?consistency_level=ONE|QUORUM|ALL]
```

<details>
  <summary>添加没有类名的交叉引用已被弃用</summary>

以下语法仅供向后兼容使用，已被弃用：
```bash
POST /v1/objects/{id}/references/{propertyName}
```

<RestObjectsCRUDClassnameNote/>

</details>

#### 参数

URL包含三个必填的路径参数，并支持一个可选的查询参数，用于[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)：

| 名称 | 位置 | 类型 | 描述 |
| ---- | ---- | ---- | ---- |
| `{ClassName}` |  路径 | 字符串 | 对象所属的类的名称，例如 `Article` |
| `{id}` | 路径 | uuid | 要添加引用的对象的uuid |
| `{propertyName}` | 路径 | 字符串 | 交叉引用属性的名称，例如 `author` |
| `consistency_level` | 查询参数 | 字符串 | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)：`ONE`，`QUORUM`（默认值）或`ALL`。 |
| `tenant` | 查询参数 | 字符串 | 可选的租户名称。必须先启用[多租户](../../concepts/data.md#multi-tenancy)。 |

请求体是一个包含以下字段的对象：

| 名称 | 类型 | 必需 | 描述 |
| ---- | ---- | ---- | ---- |
| `beacon` | Weaviate Beacon | 是 | 引用的 Beacon URL，格式为 `weaviate://localhost/<ClassName>/<id>` |

<BeaconsRequireLocalhost />

<BeaconsBackCompatOmitClassname />

#### 示例请求

import SemanticKindObjectReferenceAdd from '/_includes/code/semantic-kind.object.reference.add.mdx';

<SemanticKindObjectReferenceAdd/>

如果添加成功，将不返回任何内容。

### 更新交叉引用

`PUT` 请求用于更新指定类名和ID的对象的指定属性中的*所有*引用。

#### 方法和URL

自`v1.14` 版本起可用，并且是首选方法：
```http
PUT /v1/objects/{ClassName}/{id}/references/{propertyName}[?consistency_level=ONE|QUORUM|ALL]
```

<details>
  <summary>更新交叉引用时不带类名已经过时</summary>

下面的语法仅供向后兼容使用，已经过时：
```bash
PUT /v1/objects/{id}/references/{propertyName}
```

<RestObjectsCRUDClassnameNote/>

</details>

#### 参数

该URL包含三个必需的路径参数，并支持一个可选的查询参数，用于[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)：

| 名称 | 位置 | 类型 | 描述 |
| ---- | ---- | ---- | ---- |
| `{ClassName}` | 路径 | 字符串 | 对象所属的类的名称 |
| `{id}` | 路径 | uuid | 要更新引用的对象的uuid |
| `{propertyName}` | 路径 | 字符串 | 交叉引用属性的名称 |
| `consistency_level` | 查询参数 | 字符串 | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency): `ONE`、`QUORUM`（默认）或`ALL`。 |
| `tenant` | 查询参数 | 字符串 | 可选的租户名称。首先必须启用[多租户](../../concepts/data.md#multi-tenancy)。 |

`PUT`请求的请求体是一个beacons列表:

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | -------- | ----------- |
| `beacon` | Weaviate Beacon array | 是 | 以`weaviate://localhost/<ClassName>/<id>`格式的beacons数组 |

<BeaconsRequireLocalhost />

<BeaconsBackCompatOmitClassname />

#### 示例请求

import SemanticKindObjectReferenceUpdate from '/_includes/code/semantic-kind.object.reference.update.mdx';

<SemanticKindObjectReferenceUpdate/>

如果更新成功，将不会返回任何内容。

### 删除交叉引用

从给定对象的指定属性的引用列表中删除给定主体中给定的单个引用（如果存在于列表中）。无论如何，都会返回`204 No Content`。

#### 方法和URL

自`v1.14`起可用，并且是首选方法：
```http
DELETE /v1/objects/{ClassName}/{id}/references/{propertyName}[?consistency_level=ONE|QUORUM|ALL]
```

<details>
  <summary>删除没有类名的交叉引用已被弃用</summary>

以下语法仅供向后兼容并已被弃用：
```bash
DELETE /v1/objects/{id}/references/{propertyName}
```

<RestObjectsCRUDClassnameNote/>

</details>

#### 参数

该URL包含两个必需的路径参数，并支持一个可选的查询参数用于[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)：

| 名称 | 位置 | 类型 | 描述 |
| ---- | -------- | ---- | ----------- |
| `{id}` | 路径 | uuid | 要从中删除引用的对象的uuid |
| `{propertyName}` | path | string | 交叉引用属性的名称 |
| `consistency_level` | query param | string | 可选的[一致性级别](../../concepts/replication-architecture/consistency.md#tunable-write-consistency)：`ONE`，`QUORUM`（默认）或`ALL`。 |
| `tenant` | query param | string | 可选的租户名称。首先必须启用[多租户](../../concepts/data.md#multi-tenancy)。 |

请求体是一个信标对象：

| 名称 | 类型 | 是否必需 | 描述 |
| ---- | ---- | -------- | ----------- |
| `beacon` | Weaviate Beacon | 是 | 引用的信标URL，格式为 `weaviate://localhost/<类名>/<id>` |

<BeaconsRequireLocalhost />

:::note
For backward compatibility, beacons generally support an older,
deprecated format without the class name, as well. This means you might find
beacons with the old, deprecated format, as well as beacons with the new format
in the same Weaviate instance. When deleting a reference, the beacon specified
has to match the beacon to be deleted exactly. In other words, if a beacon is
present using the old format (without class id) you also need to specify it the
same way.
:::

#### 示例请求

import SemanticKindObjectReferenceDelete from '/_includes/code/semantic-kind.object.reference.delete.mdx';

<SemanticKindObjectReferenceDelete/>

如果添加成功，将不返回任何内容。

### 多租户

在使用多租户时，只能建立以下交叉引用：

- 从多租户对象到非多租户对象。
- 从多租户对象到多租户对象，只要它们属于同一个租户。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />