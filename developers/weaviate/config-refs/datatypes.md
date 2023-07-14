---
image: og/docs/configuration.jpg
sidebar_position: 3
title: Data types
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::info Related pages
- [Configuration: Schema](../configuration/schema-configuration.md)
- [References: REST API: Schema](../api/rest/schema.md)
- [Concepts: Data Structure](../concepts/data.md)
:::

## 简介

在创建属性时，Weaviate需要知道你将提供的数据类型。Weaviate接受以下类型：

import DataTypes from '/_includes/datatypes.mdx';

<DataTypes />

(*)虽然Weaviate支持`int64`，但GraphQL目前仅支持`int32`，不支持`int64`。这意味着当前在Weaviate中具有大于`int32`的整数值的_integer_数据字段将不会在使用GraphQL查询时返回。我们正在解决这个[问题](https://github.com/weaviate/weaviate/issues/1563)。目前的解决方法是使用`string`。

## 数据类型：`text`

### 分词配置

请参考[此部分](../config-refs/schema.md#property-tokenization)了解如何配置`text`属性的分词行为。

:::tip `string` is deprecated

Prior to `v1.19`, Weaviate supported an additional datatype `string`, which was differentiated by tokenization behavior to `text`. As of `v1.19`, this type is deprecated and will be removed in a future release.

Please use `text` instead, which now supports all tokenizations options previously available through `string`.
:::
## 数据类型: `cross-reference`

[`cross-reference`](../more-resources/glossary.md) 类型是 Weaviate 的图元素: 您可以创建一个从一个对象到另一个对象的链接。在模式中，您可以定义多个类，一个属性可以指向这些类中的一个，在一个字符串列表中。`dataType` 列表中的字符串是在模式的其他位置定义的类的名称。例如:

```json
{
  "properties": [
    {
      "name": "hasWritten",
      "dataType": [
        "Article",
        "Blog"
      ]
    }
  ]
}
```

## 数据类型: `date`

Weaviate要求使用包括日期、时间和偏移量的[RFC 3339](https://datatracker.ietf.org/doc/rfc3339/)格式的日期。

例如:

- `"1985-04-12T23:20:50.52Z"`.
- `"1996-12-19T16:39:57-08:00"`.
- `"1937-01-01T12:00:27.87+00:20"`.

如果您想将日期列表作为一个Weaviate数据值添加，您可以使用上述格式在数组中，例如: `["1985-04-12T23:20:50.52Z", "1937-01-01T12:00:27.87+00:20"]`

## 数据类型: `blob`

数据类型`blob`接受任何二进制数据。数据应该是`base64`编码的，并作为一个`string`传递。特点如下：
* Weaviate不对编码的数据类型进行假设。一个模块（例如`img2vec`）可以根据需要检查文件头，但Weaviate本身不会这样做。
* 在存储时，数据会进行`base64`解码（因此Weaviate存储更高效）。
* 在提供服务时，数据会进行`base64`编码（因此可以安全地作为`json`提供）。
* 没有最大文件大小限制。
* 无论设置如何，该 `blob` 字段始终在倒排索引中被跳过。这意味着您不能在Weaviate GraphQL的`where`过滤器中按照该 `blob` 字段进行搜索，并且相应地没有 `valueBlob` 字段。根据模块的不同，该字段可以在模块特定的过滤器中使用（例如，在 `img2vec-neural` 过滤器中的 `nearImage`{}）。

示例：

数据类型 `blob` 可以在数据模式中作为属性数据类型使用，如下所示：

```json
{
  "properties": [
    {
      "name": "image",
      "dataType": ["blob"]
    }
  ]
}
```

要获取图像的Base64编码值，您可以运行以下命令，或者使用Weaviate客户端中的辅助方法来完成：

```bash
$ cat my_image.png | base64
```

您可以使用`blob`数据类型将数据导入到Weaviate中，方法如下：

```bash
$ curl \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "class": "FashionPicture",
      "id": "36ddd591-2dee-4e7e-a3cc-eb86d30a4302",
      "properties": {
          "image": "iVBORw0KGgoAAAANS..."
      }
  }' \
    http://localhost:8080/v1/objects
```
## 数据类型：`uuid`

:::info Available from `v1.19` onwards
:::

专用的`uuid`和`uuid[]`数据类型比将相同的数据存储为文本更节省空间。

-   每个`uuid`是一个128位（16字节）的数字。
-   可过滤的索引使用Roaring位图。

:::note Aggregate/sort currently not possible
It is currently not possible to aggregate or sort by `uuid` or `uuid[]` types.
:::

## 数据类型: `geoCoordinates`

Weaviate允许您存储与事物或动作相关的地理坐标。在查询Weaviate时，您可以使用此类型在该区域的半径范围内查找项目。地理坐标值是一个浮点数，并按照[十进制度](https://en.wikipedia.org/wiki/Decimal_degrees)的方式进行处理，符合[ISO标准](https://www.iso.org/standard/39242.html#:~:text=For%20computer%20data%20interchange%20of,minutes%2C%20seconds%20and%20decimal%20seconds)。

一个使用地理坐标在数据对象中的示例：

```json
{
  "City": {
    "location": {
      "latitude": 52.366667,
      "longitude": 4.9
    }
  }
}
```

## 数据类型: `phoneNumber`

有一个特殊的原始数据类型 `phoneNumber`。当一个电话号码被添加到该字段时，输入将被规范化和验证，不同于单一字段，如 `number` 和 `string`。数据字段是一个对象，而不是类似于 `geoCoordinates` 的平面类型。该对象有多个字段:

```yaml
{
  "phoneNumber": {
    "input": "020 1234567",                       // Required. Raw input in string format
    "defaultCountry": "nl",                       // Required if only a national number is provided, ISO 3166-1 alpha-2 country code. Only set if explicitly set by the user.
    "internationalFormatted": "+31 20 1234567",   // Read-only string
    "countryCode": 31,                            // Read-only unsigned integer, numerical country code
    "national": 201234567,                        // Read-only unsigned integer, numerical representation of the national number
    "nationalFormatted": "020 1234567",           // Read-only string
    "valid": true                                 // Read-only boolean. Whether the parser recognized the phone number as valid
  }
}
```

有两个可接受输入的字段。`input`字段必须始终设置，而`defaultCountry`字段只在特定情况下设置。有两种可能的情况：
- 当您在`input`字段中输入国际号码（例如`"+31 20 1234567"`）时，无需输入`defaultCountry`。底层解析器将自动识别号码的国家。
- 当您输入一个国家号码（例如 `"020 1234567"`）时，您需要在 `defaultCountry` 中指定国家（在这种情况下为 `"nl"`），以便解析器能够将号码正确地转换为所有格式。 `defaultCountry` 中的字符串应该是一个 [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) 国家代码。

如上述代码片段所示，所有其他字段都是只读的。这些字段会自动填充，并在读取`phoneNumber`类型的字段时显示。

### 关联实例的数量

`cross-reference`类型的对象默认为`arrays`。这允许您链接到给定类的任意数量的实例（包括零个）。

在上面的示例中，我们的对象可以链接到：
* **0** 篇文章和 **1** 个博客
* **1** 篇文章和 **3** 个博客
* **2** 篇文章和 **5** 篇博客
* 等等。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />