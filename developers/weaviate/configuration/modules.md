---
image: og/docs/configuration.jpg
sidebar_position: 11
title: Modules
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- :::caution 迁移自：
- 大部分是新写的内容
- 之前的`Configuration/Modules`内容已迁移到`References:Modules/index` -->
::: -->

:::info Related pages
- [概念：模块](../concepts/modules.md)
- [参考：模块](../modules/index.md)
- [参考：REST API：模块](../api/rest/modules.md)
:::

## Introduction

You can enable and configure Weaviate's [modules](../concepts/modules.md) by setting appropriate [environment variables](../config-refs/env-vars.md) as shown below.

:::tip What about WCS?
Weaviate云服务（WCS）实例已预先配置了模块。有关详细信息，请参阅[此页面](../../wcs/index.mdx#configuration)。
### 启用模块

您可以通过在`ENABLE_MODULES`变量中指定模块列表来启用模块。例如，下面的示例将启用`text2vec-contextionary`模块。

services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-contextionary'
```

If multiple modules are to be used, each of them can be separate by a comma.

In the below example, the `'text2vec-huggingface`, `generative-cohere`, and `qna-openai` modules will be enabled.

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-huggingface,generative-cohere,qna-openai'
```

### Module-specific variables

You may need to specify additional environment variables to configure each module where applicable. For example, the `backup-s3` module requires the backup S3 bucket to be set via `BACKUP_S3_BUCKET`, and the `text2vec-contextionary` module requires the inference API location via `TRANSFORMERS_INFERENCE_API`.

Refer to the individual [module documentation](../modules/index.md) for more details.

## Vectorizer modules

The [vectorization modules](../modules/retriever-vectorizer-modules/index.md) enable Weaviate to vectorize data at import, and to perform [`near<Media>`](../search/similarity.md#an-input-medium) searches such as `nearText`.

### Enable vectorizer modules

You can enable vectorizer modules by adding them to the `ENABLE_MODULES` environment variable. For example, the below will enable the `text2vec-cohere`, `text2vec-huggingface` and `text2vec-openai` vectorizer modules.

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-cohere,text2vec-huggingface,text2vec-openai'
```

You can find a list of available vectorizer modules [in this section](../modules/retriever-vectorizer-modules/index.md).

### Default vectorizer module

You can specify a default vectorization module with the `DEFAULT_VECTORIZER_MODULE` variable as below.

If a default vectorizer module is not set, you must set a vectorizer in the schema before you can use `near<Media>` or vectorization at import time.

The below will set `text2vec-huggingface` as the default vectorizer. Thus, `text2vec-huggingface` module will be used unless another vectorizer is specified for that class.

``` yaml
services:
  weaviate:
    environment:
      DEFAULT_VECTORIZER_MODULE: text2vec-huggingface
```

组合文本向量化模块会禁用 `Explore{}`。
## 生成模块

[生成模块](../modules/reader-generator-modules/index.md) 提供了[生成搜索](../search/generative.md)功能。

您可以在本节中查看可用的生成(`generative-xxx`)模块列表。

### 启用生成模块

您可以通过将所需的模块添加到`ENABLE_MODULES`环境变量来启用生成模块。例如，下面的示例将启用`generative-cohere`模块以及`text2vec-huggingface`向量化器。

services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-huggingface,generative-cohere'
```

您选择的`text2vec`模块并不限制您选择的`generative`模块，反之亦然。

```
:::

## Custom modules
See [here](../modules/other-modules/custom-modules.md) how you can create and use your own modules.

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />