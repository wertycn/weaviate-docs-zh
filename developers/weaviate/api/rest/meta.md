---
image: og/docs/api.jpg
sidebar_position: 16
title: REST - /v1/meta
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 使用方法

元端点接受一个 `GET` 请求:

```js
GET /v1/meta
```

And it returns the following fields:
- `hostname`: Weaviate实例的位置。
- `version`: Weaviate的版本。
- `modules`: 模块特定信息。

## 示例
以下命令：

import Meta from '/_includes/code/meta.mdx';

<Meta/>

返回：

```json
{
  "hostname": "http://[::]:8080",
  "modules": {
    "text2vec-contextionary": {
      "version": "en0.16.0-v0.4.21",
      "wordCount": 818072
    }
  },
  "version": "1.0.0"
}
```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />