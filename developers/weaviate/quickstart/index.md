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

欢迎您。在这里，您将在大约20分钟内快速了解Weaviate。

您将会:
- 构建一个向量数据库，并
- 使用*语义搜索*进行查询。

:::info Object vectors
With Weaviate, you have options to:
- Have **Weaviate create vectors**, or
- Specify **custom vectors**.

This tutorial demonstrates both methods.
:::

#### 源数据

我们将使用一个（小型）的测验数据集。

<details>
  <summary>我们使用了哪些数据？</summary>

这些数据来自一个电视测验节目（"Jeopardy!"）。

|    | 分类       | 问题                                                                                                              | 答案                    |
|---:|:-----------|:------------------------------------------------------------------------------------------------------------------|:------------------------|
|  0 | 科学       | 这个器官从血液中去除多余的葡萄糖并储存为糖原                                         | 肝脏                   |
|  1 | 动物       | 它是目前唯一一种属于长鼻目的活体哺乳动物                                          | 大象                   |
|  2 | 动物       | 除了这个身体特征外，恐龙鳄非常类似于鳄鱼                                        | 鼻子或吻部           |
|  3 | 动物       | 重达一吨左右，羚羊是非洲最大的这种动物物种                                                                  | 羚羊                    |
|  4 | 动物       | 所有有毒蛇中最重的是这种北美响尾蛇                                                                          | 钻石背响尾蛇            |
|  5 | 科学       | 2000年的新闻：冈尼森麝鸡不仅仅是另一种北方麝鸡，而是属于这个分类中的新物种                                    | 物种                    |
|  6 | 科学      | “延展性”的金属在冷却和压力下可以被拉成这个东西                                        | 金属线                      |
|  7 | 科学      | 在1953年，沃森和克里克建立了这个分子结构的模型，它是携带基因的物质                           | DNA                     |
|  8 | 科学      | 对这个对流层的变化是导致我们的天气变化的原因                                                 | 大气层                    |
|  9 | 科学    | 在70度的空气中，一架以大约每秒1,130英尺的速度飞行的飞机突破了音障                                      | 声音障碍           |

</details>

<hr/><br/>

## 创建一个实例

首先，创建一个 Weaviate 数据库。

1. 进入 [WCS 控制台](https://console.weaviate.cloud)，然后
    1. 点击 <kbd>使用 Weaviate 云服务登录</kbd>。
    1. 如果您还没有 WCS 账号，请点击 <kbd>注册</kbd>。
1. 使用您的 WCS 用户名和密码登录。
1. 点击<kbd>Create cluster</kbd>。

:::note <i class="fa-solid fa-camera-viewfinder"></i> <small>To create a WCS instance:</small>
<img src={WCScreateButton} width="100%" alt="Button to create WCS instance"/>
:::

<details>
  <summary>我可以使用其他方法吗？</summary>

可以。如果您喜欢其他方法，请参阅我们的[安装选项](../installation/index.md)页面。

</details>


然后：

1. 选择<kbd>免费沙盒</kbd>层级。
2. 提供一个*集群名称*。
3. 将*启用认证？*设置为<kbd>是</kbd>。

:::note <i class="fa-solid fa-camera-viewfinder"></i> <small>Your selections should look like this:</small>
<img src={WCSoptionsWithAuth} width="100%" alt="Instance configuration"/>
:::

点击<kbd>创建</kbd>。这个过程大约需要2分钟，完成后您会看到一个✔️的标记。

#### 记下集群详情

您需要:
- Weaviate的URL以及
- 认证详情（Weaviate的API密钥）。

点击<kbd>详情</kbd>以查看它们。

关于Weaviate的API密钥，点击<kbd><i class="fa-solid fa-key"></i></kbd>按钮。

:::note <i class="fa-solid fa-camera-viewfinder"></i> <small>Your WCS cluster details should look like this:</small>
<img src={WCSApiKeyLocation} width="60%" alt="Instance API key location"/>
:::

<hr/><br/>

## 安装客户端库

我们建议使用[Weaviate客户端库](../client-libraries/index.md)。要安装您首选的客户端库 <i class="fa-solid fa-down"></i>:

import CodeClientInstall from '/_includes/code/quickstart.clients.install.mdx';

:::info Install client libraries

<CodeClientInstall />

:::

<hr/><br/>

## 连接到 Weaviate

从 WCS 的 <kbd>Details</kbd> 标签中获取以下信息：
- Weaviate 的 **API key**，以及
- Weaviate 的 **URL**。

由于我们将使用 Hugging Face 推理 API 来生成向量，您还需要：
- Hugging Face 的 **推理 API key**。

因此，您可以按照以下方式实例化客户端：

import ConnectToWeaviateWithKey from '/_includes/code/quickstart.autoschema.connect.withkey.mdx'

<ConnectToWeaviateWithKey />

现在您已成功连接到 Weaviate 实例！

<hr/><br/>

## 定义一个类

接下来，我们定义一个数据集合（在Weaviate中称为"类"）来存储对象：

import CodeAutoschemaMinimumSchema from '/_includes/code/quickstart.autoschema.minimum.schema.mdx'

<CodeAutoschemaMinimumSchema />

<details>
  <summary>如果我想使用不同的向量化模块怎么办？</summary>

在这个例子中，我们使用了`Hugging Face`的推理API。但您也可以使用其他的。

:::tip Our recommendation
Vectorizer selection is a big topic - so for now, we suggest sticking to the defaults and focus on learning the basics of Weaviate.
:::

如果您确实想要更改矢量化器，只要满足以下条件即可：
- 该模块在您正在使用的Weaviate实例中可用，并且
- 您拥有该模块的API密钥（如果需要）。

以下每个模块都在免费的沙盒中可用。

- `text2vec-cohere`
- `text2vec-huggingface`
- `text2vec-openai`
- `text2vec-palm`

根据您的选择，请确保通过设置适当的行将推理服务的API密钥传递给头部。请记住将占位符替换为您的实际密钥。

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

这里创建了一个名为`Question`的类，告诉Weaviate要使用哪个`vectorizer`，并设置了向量化器的`moduleConfig`。

:::tip Is a `vectorizer` setting mandatory?
- No. You always have the option of providing vector embeddings yourself.
- Setting a `vectorizer` gives Weaviate the option of creating vector embeddings for you.
    - If you do not wish to, you can set this to `none`.
:::

现在您已经准备好向Weaviate添加对象了。

<hr/><br/>

## 添加对象

我们将使用**批量导入**的方式向Weaviate实例添加对象。

<details>
  <summary>为什么要使用批量导入？</summary>

批量导入提供了显著的导入性能改进，因此除非您有充分的理由不使用批量导入，比如单个对象的创建，否则几乎总是应该使用批量导入。

</details>

首先，您将使用`vectorizer`来创建对象向量。

### *选项1*：`vectorizer`

以下代码在不使用向量的情况下传递对象数据。这会导致Weaviate使用指定的`vectorizer`为每个对象创建一个向量嵌入。

从`/_includes/code/quickstart.autoschema.import.mdx`导入`CodeAutoschemaImport`。

以上代码：
- 加载对象，
- 初始化批处理过程，并
- 逐个将对象添加到目标类(`Question`)中。

### *选项2*：自定义`vector`

或者，您也可以提供自己的向量给Weaviate使用。

无论是否设置了 `vectorizer`，如果指定了一个向量，Weaviate 将使用它来表示对象。

import CodeAutoschemaImportCustomVectors from '/_includes/code/quickstart.autoschema.import.custom.vectors.mdx'

<CodeAutoschemaImportCustomVectors />

<details>
  <summary>使用 <code>vectorizer</code> 的自定义向量</summary>

请注意，您可以指定一个`vectorizer`并提供一个自定义向量。在这种情况下，请确保向量来自与`vectorizer`中指定的模型相同的模型。<p><br/></p>

在本教程中，它们来自`sentence-transformers/all-MiniLM-L6-v2` - 与向量器配置中指定的相同模型。

</details>

:::tip vector != object property
Do *not* specify object vectors as an object property. This will cause Weaviate to treat it as a regular property, rather than as a vector embedding.
:::

<hr/><br/>

# 将其整合在一起

以下代码将上述步骤整合在一起。您可以自行运行它将数据导入到您的Weaviate实例中。

<details>
  <summary>端到端代码</summary>

:::tip Remember to replace the **URL**, **Weaviate API key** and **inference API key**
:::

import CodeAutoschemaEndToEnd from '/_includes/code/quickstart.autoschema.endtoend.mdx'

<CodeAutoschemaEndToEnd />

恭喜您成功构建了一个向量数据库！

</details>

<hr/><br/>

## 查询

现在，我们可以运行查询。

### 语义搜索

让我们尝试进行相似性搜索。我们将使用`nearText`搜索来查找与`biology`最相似的测验对象。

import CodeAutoschemaNeartext from '/_includes/code/quickstart.autoschema.neartext.mdx'

<CodeAutoschemaNeartext />

您应该看到类似以下结果（根据使用的模块/模型可能会有所变化）：

import BiologyQuestionsJson from '/_includes/code/quickstart.biology.questions.mdx'

<BiologyQuestionsJson />

响应包含最与单词“biology”最相似的前两个对象（由于设置了`limit`）。

:::tip Why is this useful?
Notice that even though the word `biology` does not appear anywhere, Weaviate returns biology-related entries.

This example shows why vector searches are powerful. Vectorized data objects allow for searches based on degrees of similarity, as shown here.
:::

### 使用过滤器进行语义搜索

您可以为示例添加一个布尔过滤器。例如，让我们运行相同的搜索，但只在具有"category"值为"ANIMALS"的对象中进行搜索。

import CodeAutoschemaNeartextWithWhere from '/_includes/code/quickstart.autoschema.neartext.where.mdx'

<CodeAutoschemaNeartextWithWhere />

您应该会看到类似以下的结果（这些结果可能因所使用的模块/模型而有所不同）：

import BiologyQuestionsWhereJson from '/_includes/code/quickstart.biology.where.questions.mdx'

<BiologyQuestionsWhereJson />

响应包括一个列表，其中包含与单词“biology”最相似的前2个对象（由于设置了`limit`）- 但仅来自“ANIMALS”类别。

:::tip Why is this useful?
Using a Boolean filter allows you to combine the flexibility of vector search with the precision of `where` filters.
:::


<!-- 注意：添加了生成式搜索示例，但目前隐藏它，因为它会使新用户的工作流程变得非常困难。1）他们现在需要一个OpenAI/Cohere密钥。2）模式需要包括生成式模块的定义。3）生成式API的速率限制较低，可能会很痛苦。 -->

<!-- ### 生成式搜索

现在让我们尝试一下生成式搜索。我们将检索一组结果，就像我们上面所做的那样，然后使用LLM以简明的方式解释每个答案。

import CodeAutoschemaGenerative from '/_includes/code/quickstart.autoschema.generativesearch.mdx'

<CodeAutoschemaGenerative />

您应该会看到类似以下的结果（根据使用的模型可能会有所不同）：

import BiologyGenerativeSearchJson from '/_includes/code/quickstart.biology.generativesearch.mdx'

<BiologyGenerativeSearchJson />

在这里，我们可以看到Weaviate检索到了与之前相同的结果。但现在它还包括了一个额外的生成文本，其中包含了对每个答案的简明解释。

:::tip Why is this useful?
Generative search sends retrieved data from Weaviate to a large language model (LLM). This allows you to go beyond simple data retrieval, but transform the data into a more useful form, without ever leaving Weaviate.
::: -->

<hr/><br/>

## 总结

干得好！你已经完成了以下任务：
- 创建了自己的基于云的向量数据库，使用Weaviate，
- 填充了数据对象，
    - 使用推理API，或者
    - 使用自定义向量，
- 执行了文本相似性搜索。

接下来的路由由你决定。我们在下面提供了一些链接，或者你可以查看侧边栏。

<!-- TODO - 提供一些具体的“中级”学习路径 -->

## 故障排除和常见问题解答

我们在下面提供了一些常见问题的答案，或者可能出现的问题。

#### 如何确认类创建

<details>
  <summary>查看答案</summary>

如果您不确定类是否已创建，您可以通过访问此处的[`schema`端点](../api/rest/schema.md)（将URL替换为您的实际端点）来确认：

```
https://some-endpoint.weaviate.network/v1/schema
```

您应该看到：

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

在模式中应指示已添加`Question`类。

:::note REST & GraphQL in Weaviate
Weaviate uses a combination of RESTful and GraphQL APIs. In Weaviate, RESTful API endpoints can be used to add data or obtain information about the Weaviate instance, and the GraphQL interface to retrieve data.
:::

</details>

#### 如果你看到<code>Error: Name 'Question' already used as a name for an Object class</code>

<details>
  <summary>查看答案</summary>

如果你尝试创建一个在你的Weaviate实例中已经存在的类，你可能会看到这个错误。在这种情况下，你可以按照下面的说明删除该类。

import CautionSchemaDeleteClass from '/_includes/schema-delete-class.mdx'

<CautionSchemaDeleteClass />

</details>

#### 如何确认数据导入

<details>
  <summary>查看答案</summary>

要确认数据导入成功，请转到[`objects`端点](../api/rest/objects.md)，并检查所有对象是否已导入（请使用实际的端点替换）。

```
https://some-endpoint.weaviate.network/v1/objects
```

您应该看到：

```json
{
    "deprecations": null,
    "objects": [
        ...  // Details of each object
    ],
    "totalResults": 10  // You should see 10 results here
}
```

您应该能够确认您已经导入了所有的 `10` 个对象。

</details>

#### 如果`nearText`搜索不起作用

<details>
  <summary>查看答案</summary>

要执行基于文本的（`nearText`）相似性搜索，您需要启用一个向量化器，并在您的类中进行配置。

请确保按照[此部分](#定义一个类)所示进行配置。

如果仍然不起作用，请[与我们联系](#更多资源)！

</details>

#### 我的沙盒会被删除吗？

<details>
  <summary>注意：沙盒到期和选项</summary>

import SandBoxExpiry from '/_includes/sandbox.expiry.mdx';

<SandBoxExpiry/>

</details>

## 下一步

import WhatNext from '/_includes/quickstart.what-next.mdx';

<WhatNext />

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />