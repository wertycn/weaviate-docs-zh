---
image: og/docs/further-guides.jpg
sidebar_position: 1
title: (TBC) Bring your own vectors
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- TODO: 完善这个页面！ -->
<!-- :::caution 施工中。
从Weaviate Docs Classic的"How to use Weaviate without modules"教程迁移而来。 -->
## 概述
虽然我们为向量化提供了许多不同的[模块](../modules/index.md)，但您仍然可以在没有任何模块的情况下使用Weaviate。相反，您可以为每个数据条目手动添加一个向量，并仍然利用Weaviate的向量数据库和搜索功能。

例如，您的数据集可能已经包含一组向量，或者您可能希望使用一个在Weaviate的任何模块中都不可用的向量化器。也许您希望利用已经为自己设置的向量化流程。

无论出于什么原因，您将在本页面上看到如何将"自己的"向量带入Weaviate。在本指南结束时，您将看到如何：
- 启动一个关闭自动向量化的Weaviate实例
- 添加具有手动分配向量的对象
- 在Weaviate中对对象进行向量和标量搜索

### 先决条件

<!-- 对于SW:您认为像这样定义不同级别的先决条件如何？ -->
import BasicPrereqs from '/_includes/prerequisites-quickstart.md';

<BasicPrereqs />

## 设置Weaviate

### 下载Docker Compose配置文件。
<!-- TODO: {{site.weaviate_version needs to be replaced}} -->
curl -o docker-compose.yml "https://configuration.weaviate.io/v2/docker-compose/docker-compose.yml?modules=standalone&runtime=docker-compose&weaviate_version={{ site.weaviate_version }}"
```

This will download the `docker-compose.yml` file. If you inspect its contents with your favorite text editor, you should see the below lines amongst others:

```yaml
services:
  weaviate:
    environment:
      DEFAULT_VECTORIZER_MODULE: 'none'
      ENABLE_MODULES: ''

```

当在Weaviate中使用自定义向量时，关键的环境变量是`DEFAULT_VECTORIZER_MODULE`。在这里，我们将其定义为`none`，这样Weaviate的默认行为就是在导入数据时**不**进行向量化。

虽然这个配置在任何情况下都不包括任何向量化器，但我们注意到`DEFAULT_VECTORIZER_MODULE`变量也适用于当您在Weaviate中使用向量化器模块时。
```
由于我们不需要任何向量化模块，我们可以将`ENABLE_MODULES`环境变量保留为空白。这将告诉Weaviate在启动时不使用任何额外的模块。

### 启动Weaviate
通过运行以下命令启动Weaviate实例：
docker-compose up -d
```

Weaviate should now be running and exposed on your host port `8080`. You can verify with `docker ps` or simply send a test query to Weaviate, such as the below:

```bash
curl localhost:8080/v1/schema
```

Weaviate which should respond with: `{"classes":[]}`.

## Add a data schema

Weaviate allows the user to specify a Weaviate vectorizer to be used at class level. This is done with the `vectorizer` parameter at the `class` level as below.

```json
{
  "classes": [{
      "class": "Post",
      "vectorizer": "none",  # 明确告诉Weaviate不要对任何内容进行向量化处理，我们自己提供向量
      "properties": [{
          "name": "content",
          "dataType": ["text"]
      }]
  }]
}
```

上面的定义将告诉Weaviate不对属于`Post`类的对象进行向量化。

由于我们将`DEFAULT_VECTORIZER_MODULE`环境变量设置为`none`，因此在本教程中不需要额外设置任何选项。

当没有提供类的模式时，Weaviate的[自动模式](../configuration/schema-configuration.md#auto-schema)功能会生成一个模式。

因此，您可以按照上述示例定义一个模式，或者完全跳过此步骤。如果您要定义一个模式，可以按照下面的代码示例进行操作：

使用其中一个客户端或使用curl命令将其添加到Weaviate中：

import CustomVectorsSchemaCreate from '/_includes/code/howto.customvectors.schemacreate.mdx';

<CustomVectorsSchemaCreate/>

<!-- TODO - 我们是否应该编写一个关于查询数据模式的标准片段？ -->

## 将数据导入到Weaviate

现在我们可以开始将数据导入到Weaviate中了。

导入数据的过程与其他示例中的过程几乎相同。主要区别在于每个对象都应包含一个`vector`属性，其中包含对象的向量。在您喜欢的客户端中运行下面的其中一个代码片段：

<!-- TODO - 重写此代码示例以使用批量导入 -->
import HowToAddData from '/_includes/code/howto.customvectors.adddata.mdx';

<HowToAddData/>

<!-- TODO - 应该编写一个关于查询数据对象（包含向量在结果中）的标准片段 -->
现在，您的Weaviate实例应该包含这些数据对象，包括我们上面分配的自定义向量。

有关创建对象的更多信息，请参阅[API参考](../api/rest/objects.md#with-a-custom-vector)。

## 查询和搜索数据

重要的是，即使没有向量化模块，Weaviate仍然可以执行向量搜索。

通过GraphQL，可以像其他情况一样进行向量搜索。例如，您可以使用Weaviate通过使用[`nearVector`过滤器](../api/graphql/vector-search-parameters.md#nearVector)输入一个向量来进行向量搜索。

让我们在这里尝试一个示例：

import HowToNearVector from '/_includes/code/howto.customvectors.nearvector.mdx';

<HowToNearVector/>

当您运行此查询时，Weaviate将返回与查询向量最接近的向量，就像在配置了其他模块的情况下一样。
```

我们注意到，在启用向量化模块时，某些向量搜索过滤器才可用。例如，在此配置中，`nearText`过滤器将不可用，因为Weaviate无法对查询对象进行向量化。
:::

## Wrap-up

As you see, manual vectorization involves some additional steps in comparison to using Weaviate's own vectorization modules. So this may not be the best workflow for many Weaviate users.

But if you require a particular vectorizer or have external sources of vectorization, you can incorporate Weaviate to use your own vectors like in this example.

## More Resources

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />