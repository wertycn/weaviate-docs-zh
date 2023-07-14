---
image: og/docs/howto.jpg
sidebar_position: 70
title: Generative search
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/search.generative.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.generative.ts';

## 概述

本页面将向您展示如何在Weaviate中执行“生成式”搜索。

:::info Related pages
- [API References: GraphQL: Get](../api/graphql/get.md)
:::

## 需求

要使用生成式搜索功能，您必须：
1. 配置Weaviate以使用生成器模块（[`generative-openai`](../modules/reader-generator-modules/generative-openai.md)，[`generative-cohere`](../modules/reader-generator-modules/generative-cohere.md)，[`generative-palm`](../modules/reader-generator-modules/generative-palm.md)），
2. 配置目标类别中的`generative-*`模块的参数，
3. 指定一个查询来检索一个或多个对象，
4. 提供一个[`单个提示`](#single-prompt)或者一个[`分组任务`](#grouped-task)来生成文本。

<details>
  <summary>我如何使用一个生成器模块来<strong>配置Weaviate</strong>？</summary>

  您必须在相关的配置文件（例如 `docker-compose.yml`）中启用所需的生成搜索模块，并（可选）指定相应的推理服务（OpenAI、Cohere、PaLM）API密钥，或者（推荐）要求客户端代码在每个请求中提供它。您可以使用[Weaviate配置工具](../installation/docker-compose.md#configurator)生成此文件。
  
  以下是配置文件中的相关设置。请确保对应的环境变量已设置（例如 `$OPENAI_APIKEY`、`$COHERE_APIKEY` 或 `$PALM_APIKEY`），除非您希望客户端提供 API 密钥（推荐）。

<Tabs groupId="modules">
<TabItem value="OpenAI" label="OpenAI">

```yaml
services:
  weaviate:
    environment:
      OPENAI_APIKEY: $OPENAI_APIKEY
      ENABLE_MODULES: '...,generative-openai,...'
```

</TabItem>
<TabItem value="Cohere" label="Cohere">

```yaml
services:
  weaviate:
    environment:
      COHERE_APIKEY: $COHERE_APIKEY
      ENABLE_MODULES: '...,generative-cohere,...'
```

</TabItem>
<TabItem value="PaLM" label="PaLM">

```yaml
services:
  weaviate:
    environment:
      PALM_APIKEY: $PALM_APIKEY
      ENABLE_MODULES: '...,generative-palm,...'
```

</TabItem>
</Tabs>
</details>

<details>
  <summary>如何在目标类中配置生成模块？</summary>

您可以通过`moduleConfig.generative-*`属性来配置目标类中的生成搜索模块的参数。请参考相关模块页面中的"模式配置"部分。
</details>

:::info For more detail
See the relevant module page for:
- [generative-openai](../modules/reader-generator-modules/generative-openai.md)
- [generative-cohere](../modules/reader-generator-modules/generative-cohere.md)
- [generative-palm](../modules/reader-generator-modules/generative-palm.md)
:::


## 单个提示

**单个提示**生成式搜索为查询结果中的每个对象返回一个生成的响应。对于**单个提示**生成式搜索，您必须指定在提示中使用哪些对象*属性*。

在下面的示例中，查询：
1. 检索与`世界历史`相关的两个`JeopardyQuestion`对象，
1. 为每个对象准备一个提示，基于提示语 `"将以下内容转换为Twitter提问。为了增加趣味性，可以包含表情符号，但不要包括答案：{question}。"`, 其中 `{question}` 是对象的属性，
2. 获取每个对象的生成文本（共2个），
3. 将生成文本作为每个对象的一部分，与 `question` 属性一起返回。

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleGenerativePython"
  endMarker="# END SingleGenerativePython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// SingleGenerative TS"
  endMarker="// END SingleGenerative TS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleGenerativeGraphQL"
  endMarker="# END SingleGenerativeGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleGenerative Expected Results"
  endMarker="# END SingleGenerative Expected Results"
  language="json"
/>

</details>

### 单个提示属性选择

在使用单个提示进行生成式搜索时，您必须指定在提示中使用哪些对象的属性。

作为提示的一部分，不需要使用查询中检索到的属性。

在下面的示例中，查询：
1. 检索与“世界历史”相关的两个“JeopardyQuestion”对象，
2. 为每个对象准备一个提示，基于提示“将这个测验问题：{question}和答案：{answer}转换为一条有趣的推文。”其中`{question}`和`{answer}`是对象的属性，
3. 检索每个对象的生成文本（总共2个），以及
1. 将生成的文本作为每个对象的一部分返回。

注意，查询中不检索`question`和`answer`属性，但在提示中使用。

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleGenerativePropertiesPython"
  endMarker="# END SingleGenerativePropertiesPython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// SingleGenerativeProperties TS"
  endMarker="// END SingleGenerativeProperties TS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleGenerativePropertiesGraphQL"
  endMarker="# END SingleGenerativePropertiesGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成类似下面的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# SingleGenerativeProperties Expected Results"
  endMarker="# END SingleGenerativeProperties Expected Results"
  language="json"
/>

</details>

## 分组任务

**分组任务**通过为整个查询结果集生成响应来工作。

在使用**分组任务**进行生成搜索时，所需的参数是用户提示。默认情况下，除非[另有说明](#grouped-task-property-selection)，否则将包含所有属性的组合提示。

### 示例

在下面的示例中，查询：
1. 检索与“可爱动物”相关的三个`JeopardyQuestion`对象，
2. 将用户提示与检索到的对象集合组合起来构建分组任务，
1. 使用分组任务检索一个生成的文本，并
2. 将生成的文本作为返回的第一个对象的一部分，并返回请求的`points`属性。

请注意，提示中包含有关动物类型的信息（来自`answer`属性），即使没有显式地检索`answer`属性。

<Tabs groupId="languages">
<TabItem value="py" label="Python">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GroupedGenerativePython"
  endMarker="# END GroupedGenerativePython"
  language="py"
/>

</TabItem>
<TabItem value="js" label="JavaScript/TypeScript">

<FilteredTextBlock
  text={TSCode}
  startMarker="// GroupedGenerative TS"
  endMarker="// END GroupedGenerative TS"
  language="js"
/>

</TabItem>
<TabItem value="graphql" label="GraphQL">

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GroupedGenerativeGraphQL"
  endMarker="# END GroupedGenerativeGraphQL"
  language="graphql"
/>

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该生成如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GroupedGenerative Expected Results"
  endMarker="# END GroupedGenerative Expected Results"
  language="json"
/>

</details>

### 分组任务属性选择

:::info Requires Weaviate `v1.18.3` or higher
:::

您可以指定包含在“分组任务”提示中的属性。使用此功能可以限制提示中提供的信息并减少提示的长度。

在下面的示例中，提示只包括“question”和“answer”属性。请注意，“answer”属性在查询中没有显式检索，但在提示中使用。

<!-- TODO - 添加客户端代码（如果有） -->

<Tabs groupId="languages">
  <TabItem value="python" label="Python">
  
  <FilteredTextBlock
    text={PythonCode}
    startMarker="# GroupedGenerativeProperties Python"
    endMarker="# END GroupedGenerativeProperties Python"
    language="py"
  />
  
  </TabItem>
  <TabItem value="js" label="JavaScript/TypeScript">
  
  <FilteredTextBlock
    text={TSCode}
    startMarker="// GroupedGenerativeProperties"
    endMarker="// END GroupedGenerativeProperties"
    language="ts"
  />
  
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
  
  <FilteredTextBlock
    text={PythonCode}
    startMarker="# GroupedGenerativePropertiesGraphQL"
    endMarker="# END GroupedGenerativePropertiesGraphQL"
    language="graphql"
  />

</TabItem>
</Tabs>

<details>
  <summary>示例响应</summary>

它应该产生如下所示的响应：

<FilteredTextBlock
  text={PythonCode}
  startMarker="# GroupedGenerativeProperties Expected Results"
  endMarker="# END GroupedGenerativeProperties Expected Results"
  language="json"
/>

</details>

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
