---
image: og/docs/quickstart-tutorial.jpg
sidebar_position: 0
title: Quickstart Tutorial
---

import Badges from '/_includes/badges.mdx';

<Badges/>

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import WCSoptionsWithAuth from '../../wcs/img/wcs-options-with-auth.png';
import WCScreateButton from '../../wcs/img/wcs-create-button.png';
import WCSApiKeyLocation from '../../wcs/img/wcs-apikey-location.png';

## 概述

欢迎。在这里，您将在<i class="fa-solid fa-timer"></i>大约20分钟内快速了解Weaviate。

您将会：
- 构建一个向量数据库，以及
- 使用*语义搜索*对其进行查询。

:::info 对象向量
在Weaviate中，您有以下选项：
- 由**Weaviate创建向量**，或者
- 指定**自定义向量**。

本教程演示了这两种方法。
:::

#### 源数据

我们将使用一个（微小的）测验数据集。

<details>
  <summary>我们使用的是什么数据？</summary>

这些数据来自一个电视测验节目（"Jeopardy!"）

|    | 类别       | 问题                                                                                                              | 答案                    |
|---:|:-----------|:------------------------------------------------------------------------------------------------------------------|:------------------------|
|  0 | 科学       | 这个器官将多余的葡萄糖从血液中去除，并储存为糖原                                                          | 肝脏                     |
|  1 | 动物       | 它是唯一一种生活在长鼻目中的哺乳动物                                                                 | 大象                     |
|  2 | 动物       | 长吻鳄看起来与鳄鱼非常相似，除了这个身体特征                                                             | 鼻子或吻部               |
|  3 | 动物       | 重约一吨，羚羊是非洲最大的这种动物物种                                                                   | 羚羊                     |
|  4 | 动物       | 所有有毒蛇中最重的是这种北美响尾蛇                                                | 菱斑响尾蛇               |
|  5 | 科学       | 2000年的新闻：Gunnison雀鸟不仅仅是另一种北方雀鸟，而是这一分类中的一种新的物种   | 种类                     |
|  6 | 科学       | "可延展"的金属在冷却并受压力下可以被拉成这个                                        | 电线                     |
|  7 | 科学    | 1953年，沃森和克里克建立了这种分子结构的模型，这种分子结构是携带基因的物质              | DNA                     |
|  8 | 科学    | 对这个对流层的变化是天气的来源                                               | 大气层          |
|  9 | 科学    | 在70度的空气中，以约1130英尺/秒的速度行驶的飞机打破了这个障碍                                      | 声音障碍           |

</details>

<hr/><br/>

## 创建实例

首先，创建一个Weaviate数据库。

1. 前往[WCS控制台](https://console.weaviate.cloud)，然后
    1. 点击 <kbd>使用Weaviate Cloud Services登录</kbd>。
    2. 如果您没有WCS账户，点击 <kbd>注册</kbd>。
2. 使用您的WCS用户名和密码登录。
3. 点击 <kbd>创建集群</kbd>。

:::note <i class="fa-solid fa-camera-viewfinder"></i> <small>创建WCS实例的注意事项：</small>
<img src={WCScreateButton} width="100%" alt="Button to create WCS instance"/>
:::

<details>
  <summary>我可以使用其他方法吗？</summary>

可以的。如果您喜欢其他方法，请参阅我们的[安装选项](../installation/index.md)页面。

</details>


然后：

1. 选择<kbd>Free sandbox</kbd>层级。
1. 提供一个*Cluster name*。
1. 将*Enable Authentication?*设置为<kbd>YES</kbd>。

:::note <i class="fa-solid fa-camera-viewfinder"></i> <small>您的选择应该如下所示：</small>
<img src={WCSoptionsWithAuth} width="100%" alt="实例配置"/>
:::

点击 <kbd>创建</kbd>。这个过程需要大约2分钟，完成后会显示一个✔️标记。

#### 记下集群详细信息

您需要：
- Weaviate的URL，
- 认证详细信息（Weaviate API密钥）。

点击 <kbd>详情</kbd> 查看它们。

对于Weaviate API密钥，点击 <kbd><i class="fa-solid fa-key"></i></kbd> 按钮。

::::note <i class="fa-solid fa-camera-viewfinder"></i> <small>您的WCS集群详细信息应该如下所示:</small>
<img src={WCSApiKeyLocation} width="60%" alt="实例API密钥位置"/>
:::

<hr/><br/>

## 安装客户端库

我们建议使用[Weaviate客户端](../client-libraries/index.md)。要安装您首选的客户端 <i class="fa-solid fa-down"></i>:

import CodeClientInstall from '/_includes/code/quickstart.clients.install.mdx';

:::info 安装客户端库

<CodeClientInstall />

:::

<hr/><br/>

## 连接到 Weaviate

从 WCS 的 <kbd>Details</kbd> 选项卡中获取以下信息：
- Weaviate 的 **API 密钥**，以及
- Weaviate 的 **URL**。

而且，因为我们将使用 Hugging Face 推理 API 来生成向量，您还需要：
- 一个 Hugging Face **推理 API 密钥**。

因此，按照以下方式实例化客户端：

import ConnectToWeaviateWithKey from '/_includes/code/quickstart.autoschema.connect.withkey.mdx'

<ConnectToWeaviateWithKey />

现在您已经连接到您的Weaviate实例！

<hr/><br/>

## 定义一个类

接下来，我们定义一个数据集合（在Weaviate中称为"类"）来存储对象：

import CodeAutoschemaMinimumSchema from '/_includes/code/quickstart.autoschema.minimum.schema.mdx'

<CodeAutoschemaMinimumSchema />

<details>
  <summary>如果我想使用其他的向量化模块怎么办？</summary>

在这个例子中，我们使用了`Hugging Face`的推断API，但您也可以使用其他的模块。

:::tip 我们的推荐
选择矢量化器是一个很大的话题 - 所以现在，我们建议使用默认设置，并专注于学习 Weaviate 的基础知识。
:::

如果您确实想要更改矢量化器，可以这样做，只要满足以下条件：
- 该模块在您使用的 Weaviate 实例中可用，并且
- 您有该模块的 API 密钥（如果需要）。

以下每个模块都在免费的沙盒中可用。

- `text2vec-cohere`
- `text2vec-huggingface`
- `text2vec-openai`
- `text2vec-palm`

根据您的选择，请确保通过以下适当的行将推理服务的 API 密钥设置为头部，记得将占位符替换为您的实际密钥：

```js
"X-Cohere-Api-Key": "YOUR-COHERE-API-KEY",  // For Cohere
"X-HuggingFace-Api-Key": "YOUR-HUGGINGFACE-API-KEY",  // For Hugging Face
"X-OpenAI-Api-Key": "YOUR-OPENAI-API-KEY",  // For OpenAI
"X-Palm-Api-Key": "YOUR-PALM-API-KEY",  // For PaLM
```

此外，我们还提供了建议的 `vectorizer` 模块配置。

<Tabs groupId="inferenceAPIs">
<TabItem value="cohere" label="Cohere">

```json
class_obj = {
  "class": "Question",
  "vectorizer": "text2vec-cohere",
}
```

</TabItem>
<TabItem value="huggingface" label="Hugging Face">

```js
class_obj = {
  "class": "Question",
  "vectorizer": "text2vec-huggingface",
  "moduleConfig": {
    "text2vec-huggingface": {
      "model": "sentence-transformers/all-MiniLM-L6-v2",  // Can be any public or private Hugging Face model.
      "options": {
        "waitForModel": true,  // Try this if you get a "model not ready" error
      }
    }
  }
}
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```js
class_obj = {
  "class": "Question",
  "vectorizer": "text2vec-openai",
  "moduleConfig": {
    "text2vec-openai": {
      "model": "ada",
      "modelVersion": "002",
      "type": "text"
    }
  }
}
```

</TabItem>
<TabItem value="palm" label="PaLM">

```js
class_obj = {
  "class": "Question",
  "vectorizer": "text2vec-palm",
  "moduleConfig": {
    "text2vec-palm": {
      "projectId": "YOUR-GOOGLE-CLOUD-PROJECT-ID",    // Required. Replace with your value: (e.g. "cloud-large-language-models")
      "apiEndpoint": "YOUR-API-ENDPOINT",             // Optional. Defaults to "us-central1-aiplatform.googleapis.com".
      "modelId": "YOUR-GOOGLE-CLOUD-MODEL-ID",        // Optional. Defaults to "textembedding-gecko".
    },
  }
}
```

</TabItem>
</Tabs>

</details>

这里创建了一个名为`Question`的类，告诉Weaviate要使用哪个`vectorizer`，并为vectorizer设置了`moduleConfig`。

:::tip `vectorizer`设置是必需的吗？
- 不是必需的。您始终可以选择自己提供向量嵌入。
- 设置`vectorizer`使Weaviate有可能为您创建向量嵌入。
    - 如果您不希望这样做，可以将其设置为`none`。
:::

现在您已经准备好向Weaviate添加对象了。

<hr/><br/>

## 添加对象

我们将使用**批量导入**流程将对象添加到我们的Weaviate实例中。

<details>
  <summary>为什么使用批量导入？</summary>

批量导入提供了显著的导入性能改进，因此除非有充分的理由不使用批量导入，如单个对象创建，否则几乎总是应该使用批量导入。

</details>

首先，您将使用`vectorizer`来创建对象向量。

### *选项1*：`vectorizer`

下面的代码在没有向量的情况下传递对象数据。这会导致Weaviate使用指定的`vectorizer`为每个对象创建一个向量嵌入。

import CodeAutoschemaImport from '/_includes/code/quickstart.autoschema.import.mdx'

<CodeAutoschemaImport />

上述代码：
- 加载对象，
- 初始化批处理过程，并
- 逐个将对象添加到目标类（`Question`）中。

### *选项2*：自定义`vector`

或者，您也可以为Weaviate提供自己的向量。

无论是否设置了`vectorizer`，如果指定了一个向量，Weaviate将使用它来表示对象。

import CodeAutoschemaImportCustomVectors from '/_includes/code/quickstart.autoschema.import.custom.vectors.mdx'

<CodeAutoschemaImportCustomVectors />

<details>
  <summary>使用`vectorizer`的自定义向量</summary>

请注意，您可以指定一个`vectorizer`，同时提供一个自定义的向量。在这种情况下，请确保向量来自与`vectorizer`中指定的模型相同的模型。<p><br/></p>

在本教程中，它们来自于`sentence-transformers/all-MiniLM-L6-v2` - 与在vectorizer配置中指定的相同。

</details>

:::提示 向量 != 对象属性
不要将对象向量指定为对象属性。这会导致Weaviate将其视为常规属性，而不是向量嵌入。

:::

<hr/><br/>

# 将其组合起来

以下代码将上述步骤组合在一起。您可以自行运行它来将数据导入到Weaviate实例中。

<details>
  <summary>端到端代码</summary>

:::tip 记得替换**URL**、**Weaviate API密钥**和**推理API密钥**
:::

import CodeAutoschemaEndToEnd from '/_includes/code/quickstart.autoschema.endtoend.mdx'

<CodeAutoschemaEndToEnd />

恭喜，您已成功构建了一个向量数据库！

</details>

<hr/><br/>

## 查询

现在，我们可以运行查询。

### 语义搜索

让我们尝试一个相似性搜索。我们将使用`nearText`搜索来查找与`biology`最相似的测验对象。

import CodeAutoschemaNeartext from '/_includes/code/quickstart.autoschema.neartext.mdx'

<CodeAutoschemaNeartext />

您应该会看到类似于以下结果（这些可能因所使用的模块/模型而异）：

import BiologyQuestionsJson from '/_includes/code/quickstart.biology.questions.mdx'

<BiologyQuestionsJson />

响应包括与单词“biology”最相似的前2个对象（由于设置了`limit`）。

:::tip 为什么这很有用？
请注意，尽管单词“biology”并未出现在任何地方，Weaviate返回与生物学相关的条目。

这个例子展示了为什么向量搜索是强大的。向量化的数据对象允许基于相似度的搜索，如此处所示。
:::

### 带过滤器的语义搜索

您可以向您的示例添加一个布尔过滤器。例如，让我们运行相同的搜索，但只搜索具有“category”值为“ANIMALS”的对象。

import CodeAutoschemaNeartextWithWhere from '/_includes/code/quickstart.autoschema.neartext.where.mdx'

<CodeAutoschemaNeartextWithWhere />

您应该会看到类似于以下结果（根据使用的模块/模型可能会有所不同）：

import BiologyQuestionsWhereJson from '/_includes/code/quickstart.biology.where.questions.mdx'

<BiologyQuestionsWhereJson />

响应包含一个由相似度最高的前2个对象组成的列表（由于设置了`limit`）其向量与单词`biology`最相似 - 但仅来自于"ANIMALS"类别。

:::tip 这有什么用处？
使用布尔过滤器可以将向量搜索的灵活性与`where`过滤器的精确性结合起来。
:::


<!-- 注意：添加了生成式搜索示例；但是暂时隐藏起来，因为这会使新用户的工作流程变得非常困难。 1）他们现在需要一个OpenAI / Cohere密钥。 2）模式需要包含生成模块定义。 3）生成式API的速率限制较低，可能会很痛苦。 -->

<!-- ### 生成式搜索

现在让我们尝试一下生成式搜索。我们将先像之前那样检索一组结果，然后再使用LLM以通俗的语言解释每个答案。

import CodeAutoschemaGenerative from '/_includes/code/quickstart.autoschema.generativesearch.mdx'

<CodeAutoschemaGenerative />

您应该会看到一个类似这样的结果（根据使用的模型可能会有所不同）：

import BiologyGenerativeSearchJson from '/_includes/code/quickstart.biology.generativesearch.mdx'

<BiologyGenerativeSearchJson />

在这里，我们看到Weaviate检索到了与之前相同的结果。但现在它还包括了一个额外的、生成的文本，其中包含了对每个答案的简明解释。

:::tip 这有什么用？
生成式搜索将从Weaviate检索到的数据发送到一个大型语言模型（LLM）。这使您能够超越简单的数据检索，将数据转化为更有用的形式，而无需离开Weaviate。
::: -->

<hr/><br/>

## 总结

做得好！您已经：
- 使用Weaviate创建您自己的基于云的向量数据库，
- 使用数据对象填充数据库，
    - 使用推理API，或者
    - 使用自定义向量，
- 进行文本相似性搜索。

接下来的路由取决于您。我们在下面提供了一些链接 - 或者您可以查看侧边栏。

<!-- TODO - 提供一些具体的“中级”学习路径 -->

## 故障排除和常见问题解答

我们在下面提供了一些常见问题或潜在问题的答案。

#### 如何确认类别创建是否成功

<details>
  <summary>查看答案</summary>

如果您不确定类是否已创建，您可以通过访问此处的[`schema`端点](../api/rest/schema.md)（将URL替换为实际的端点）来确认：

```
https://some-endpoint.weaviate.network/v1/schema
```

您应该看到:

```json
{
    "classes": [
        {
            "class": "Question",
            ...  // truncated additional information here
            "vectorizer": "text2vec-huggingface"
        }
    ]
}
```

在模式中应该指示已添加`Question`类。

:::note REST和GraphQL在Weaviate中
Weaviate使用RESTful和GraphQL API的组合。在Weaviate中，可以使用RESTful API端点添加数据或获取有关Weaviate实例的信息，并使用GraphQL接口检索数据。
:::

</details>

#### 如果您看到<code>Error: Name 'Question' already used as a name for an Object class</code>

<details>
  <summary>查看答案</summary>

如果您尝试在Weaviate实例中创建一个已经存在的类，可能会出现此错误。在这种情况下，您可以按照以下说明删除该类。

import CautionSchemaDeleteClass from '/_includes/schema-delete-class.mdx'

<CautionSchemaDeleteClass />

</details>

#### 如何确认数据导入

<details>
  <summary>查看答案</summary>

为了确认数据导入成功，请转到[`objects`端点](../api/rest/objects.md)检查所有对象是否已导入（请用实际的端点替换）。

```
https://some-endpoint.weaviate.network/v1/objects
```

您应该会看到：

```json
{
    "deprecations": null,
    "objects": [
        ...  // Details of each object
    ],
    "totalResults": 10  // You should see 10 results here
}
```

您应该能够确认您已导入了所有的`10`个对象。

</details>

#### 如果`nearText`搜索不起作用

<details>
  <summary>查看答案</summary>

要执行基于文本(`nearText`)相似性搜索，您需要启用一个矢量化器，并在您的类中进行配置。

请确保您按照[此部分](#define-a-class)所示进行了配置。

如果仍然不起作用，请[联系我们](#more-resources)！

</details>

#### 我的沙箱会被删除吗？

<details>
  <summary>注意：沙盒过期和选项</summary>

import SandBoxExpiry from '/_includes/sandbox.expiry.mdx';

<SandBoxExpiry/>

</details>

## 下一步

import WhatNext from '/_includes/quickstart.what-next.mdx';

<WhatNext />

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />