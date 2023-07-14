---
image: og/docs/api.jpg
sidebar_position: 15
title: REST - /v1/classification
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 开始分类

Weaviate的分类功能允许您通过基于数据对象的语义含义进行交叉引用预测，从而对数据对象进行分类。Weaviate Core（不带任何模块）提供一种类型的分类：
- **[kNN分类](#knn-classification)**：使用k最近邻算法，需要训练数据来预测交叉引用。Weaviate找到相似的对象，并检查它们在过去是如何标记的。特别是当需要分类的对象之间没有逻辑语义关系时，kNN算法非常有帮助。

向量化模块 `text2vec-contextionary` 提供了第二种类型的分类。有关此分类类型的信息可以在 [这里](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md) 找到。
- **[上下文分类](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md)**: 基于上下文预测交叉引用，无需训练数据。如果您没有任何训练数据，并且想要分类源项目与潜在目标项目的相似程度，上下文分类是一个不错的选择。特别是当您的数据中存在强烈的语义关系时（例如，`The Landmark Eiffel Tower`和`The City Paris`）。

使用RESTful API可以启动一个分类，通过`v1/classification`端点进行`POST`请求。这将触发分类的开始，之后它将在后台运行。也可以使用其中一个客户端库来实现。使用[`GET`方法](#get-status-results-and-metadata)来查看分类的状态:

import ClassificationPost from '/_includes/code/classification.post.mdx';

<ClassificationPost/>

该方法将返回有关已启动的分类的[信息](#response)，包括分类的 `id`。

## 客户端和异步分类
某些分类作业可能需要一些时间来完成。使用Weaviate客户端，有两种处理方式。虽然没有专门的异步分类方法可用，但可以按照以下步骤操作：
  - 在继续执行脚本的其余部分之前，等待分类函数完成（请参考上面代码块中的示例）。
    - `Python`：在构建模式中添加`with_wait_for_completion()`。
    - `Go`：在构建模式中添加`.WithWaitForCompletion()`。
    - `JavaScript`：在构建模式中添加`.withWaitForCompletion()`。
  - 不要等待分类完成后再返回。您可以使用分类元端点和分类的id（可以在分类开始的返回体中找到）来检查分类是否已完成。返回体中的`status`字段将是`running`或`completed`。请参阅[此处](#get-status-results-and-metadata)了解如何查询此信息。

## 获取状态、结果和元数据

`GET`端点返回先前创建的分类的状态、结果和元数据:

### 方法

```js
GET /v1/classifications/{id}
```

### 参数

应将分类`id`传递给请求。这个`id`是从开始分类的结果中获得的。

### 响应

对于所有分类类型，它返回以下字段：
```json
{
  "id": "string", // classification id
  "class": "string", // class name of the classified data objects
  "classifyProperties": [ "string" ], // list of the class properties that are (to be) classified
  "basedOnProperties": [ "string" ], // list of the class properties that the classification is based on
  "status": "string", // status of the classification, can be "running" or "completed"
  "meta": {
    "started": "timestamp",
    "completed": "timestamp",
    "count": int, // total number of items to classify (only if "status" is completed)
    "countSucceeded": int, // total number of items that succeeded (only if "status" is completed)
    "countFailed": int // total number of items that failed (only if "status" is completed, only if >0)
  },
  "type": "string", // the type of classification, can be "knn" or a module specific classification
  "settings": {}, // additional settings specific to the classification type
  "filters": { // additional filters specific to the data objects to include in the classification, Where filters according to the GraphQL Where filter design
    "sourceWhere": { … },
    "trainingSetWhere": { … },
    "targetWhere": { … },
  }
}
```

当基于kNN进行分类时，还有以下附加字段：
```json
{
  "settings": {
    "k": int, // the number of neighbors taken in the classification
  }
}
```

### 示例
根据[示例](#start-a-knn-classification)进行`knn`分类
以下命令:

import ClassificationGet from '/_includes/code/classification.get.mdx';

<ClassificationGet/>

返回:

```json
{
  "basedOnProperties": [
    "summary"
  ],
  "class": "Article",
  "classifyProperties": [
    "hasPopularity"
  ],
  "id": "ee722219-b8ec-4db1-8f8d-5150bb1a9e0c",
  "meta": {
    "completed": "0001-01-01T00:00:00.000Z",
    "started": "2020-09-09T14:57:08.468Z"
  },
  "minimumUsableWords": 3,
  "status": "running",
  "tfidfCutoffPercentile": 80,
  "type": "knn",
  "settings": {
    "k": 3,
  }
}
```

### 单个数据对象结果的评估
分类完成后，Weaviate实例中相关的引用属性数据对象将根据分类进行更新。这些数据对象将类似于其他数据对象的表示形式。可以通过[`v1/objects/{id}/?include=classification` RESTful端点](./objects.md#response-fields)或通过[GraphQL `_additional {classification}`字段](../graphql/additional-properties.md#classification)来请求单个数据对象的分类结果。

## KNN分类

使用 [*k*-近邻](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) 分类算法，Weaviate可以找到相似的对象并查看它们在过去是如何被标记的。随着时间的推移，添加和正确标记的对象越多，未来的分类结果就会越好。特别是当需要对没有逻辑语义关系的对象进行分类时，kNN算法非常有帮助。

### 示例用例


#### 电子邮件垃圾分类
假设您有一个包含电子邮件的数据集。其中一些邮件是有用的，而其他邮件是垃圾邮件。判断一封邮件是否是垃圾邮件遵循一组您可能不知道的业务规则。例如，如果一封邮件提到特定药物的品牌名称等特定词汇，那么它更有可能是垃圾邮件。您可以让Weaviate根据您提供的训练数据进行学习。除了"Email"类（源）之外，您还引入了一个"Importance"类，其中包含三个数据对象："Spam"、"Neutral"和"Important"。使用"kNN"算法，Weaviate不会将源对象与目标对象进行比较。相反，它将源对象与相似的源对象进行比较，并"继承"它们的标记。随着您添加更多（正确）标记的数据，它的质量也会提高。例如，如果Weaviate找到一封文本为"在非常可疑的商店以低价购买最好的耐力药物"的电子邮件对象，它将扫描训练数据集以寻找相似的匹配项。假设它找到了文本为"在线购买廉价药丸"和类似邮件的邮件。由于这些预先标记的对象被标记为垃圾邮件，Weaviate将决定将未见数据对象也标记为垃圾邮件。对于"中性"和"重要"的电子邮件，也会发生同样的情况。

#### 文章受欢迎度预测
假设您有一种衡量受众对`文章`受欢迎程度的属性，并且您希望基于已知属性预测新文章的`受欢迎程度`。您可以使用kNN分类，利用先前文章的受欢迎程度，并预测新文章的受欢迎程度。

### 要求
- 至少两个类别和两个类别之间的交叉引用的模式。
- 一些训练数据，这些数据对象在类中与另一个已创建的类具有引用（您希望为其他对象进行预测）。

### 端点和参数

可以通过 `v1/classifications` 端点启动分类，也可以通过客户端库访问。以下字段必须（必填）或可以（可选）与 `POST` 请求一起指定：

**必填**：
- `type: "knn"`：分类的类型，在此处为 "knn"。
- `class`: 要分类的数据对象的类名。
- `classifyProperties`: 要对其值进行分类的属性列表。类的各个属性应该是对其他类的引用属性，这些引用属性应该只引用一个类。这由模式中的`dataType`定义，因此应该是一个包含且只包含一个类名的数组。
- `basedOnProperties`: 类的其他属性之一或多个（注意：当前的Weaviate仅支持给定一个属性名称的情况，因此请确保传递一个只包含一个属性名称的字符串列表），此字段必须指定，但当前的实现将考虑类的整个向量（对象）。

**可选项，默认值为：**
- `settings {k: 3}`。用于基于邻居进行分类的数量。
- 添加限制条件的参数（基于背景业务知识）。
  - `filters: {}`，具有以下可能的属性：
    - `sourceWhere: {}`。用于确定要分类的数据对象（即，如果您想根据背景知识稍后对一些数据对象进行分类，可以使用此参数）。它接受一个[`where`过滤器体](../graphql/filters.md#where-filter)。
    - `targetWhere: {}`。限制可能目标的参数（例如，当您希望确保没有数据对象被分类为目标时）。它接受一个[`where`过滤器条件](../graphql/filters.md#where-filter)。
- `trainingSetWhere: {}`。限制训练集中可能的数据对象的参数。它接受一个[`where`过滤器条件](../graphql/filters.md#where-filter)。

### 启动kNN分类
通过其中一个客户端或直接使用`curl`请求RESTful API可以启动分类。

import ClassificationKNNPost from '/_includes/code/classification.knn.post.mdx';

<ClassificationKNNPost/>

分类已经启动，并将在后台运行。在启动分类后，将返回以下响应，并且可以通过[`v1/classifications/{id}`](#get-status-results-and-metadata)端点获取状态。

```json
{
  "basedOnProperties": [
    "summary"
  ],
  "class": "Article",
  "classifyProperties": [
    "hasPopularity"
  ],
  "id": "ee722219-b8ec-4db1-8f8d-5150bb1a9e0c",
  "meta": {
    "completed": "0001-01-01T00:00:00.000Z",
    "started": "2020-09-09T14:57:08.468Z"
  },
  "minimumUsableWords": 3,
  "status": "running",
  "tfidfCutoffPercentile": 80,
  "type": "knn",
  "settings": {
    "k": 3,
  }
}
```

### 单个数据对象结果的评估
分类完成后，Weaviate实例中与分类相关的引用属性数据对象将根据分类结果进行更新。这些数据对象将类似于其他数据对象的表示方式。可以通过[`v1/objects/{id}/?include=classification` RESTful端点](./objects.md#response-fields)或[GraphQL `_additional {classification}`字段](../graphql/additional-properties.md#classification)来请求单个数据对象的分类结果。

## 零样本分类

零样本分类是一种无监督分类方法，意味着您不需要任何训练数据。零样本允许您对以前未见过的数据进行分类，以构建分类器。如果您想要给数据对象打上类别标签，但又没有或不想使用训练数据，这种类型的分类非常适合。它选择与源对象距离最近的标签对象进行关联。这种关联使用交叉引用进行，类似于Weaviate中的现有分类。

Weaviate的零-shot分类衡量了数据项与目标项（类别或标签）之间的相似性（接近程度）。更具体地说，Weaviate使用“向量搜索和相似度”算法将数据对象与其他数据对象进行分类。在内部，Weaviate执行`nearVector`搜索（您也可以使用GraphQL手动执行此操作），并从给定的选项（数据对象）中选择最接近的结果来进行分类。

零样本分类适用于所有（文本/图像/...）向量化器（或者没有向量化器，只要您在Weaviate中存储了向量）。

### 端点和参数

可以通过`v1/classifications`端点启动分类，也可以通过客户端库进行访问。与`POST`请求一起必须（必需）或可以（可选）指定以下字段：

**必需**：
- `type: "zeroshot"`：分类的类型，在此处为零样本。
- `class`：要分类的数据对象的类名。
- `classifyProperties`：要分类的属性值的属性列表。类的各个属性应该是对其他类的引用属性，这些引用属性应该只引用一个类。这是由模式中的`dataType`定义的，因此应该是由一个类名组成的数组。

**可选项，默认值**：
- 添加限制条件的参数（基于背景业务知识等）。
  - `filters: {}` 可以包含以下可能的属性:
    - `sourceWhere: {}`。用于确定要分类的数据对象（例如，如果您希望根据背景知识稍后分类某些数据对象，则可以使用此参数）。它接受一个[`where`过滤器](../graphql/filters.md#where-filter)。
    - `targetWhere: {}`。用于限制可能的目标对象的参数（例如，当您希望确保没有数据对象被分类为此类时）。它接受一个[`where`筛选条件](../graphql/filters.md#where-filter)。
- `trainingSetWhere: {}`。用于限制训练集中可能的数据对象的参数。它接受一个[`where`筛选条件](../graphql/filters.md#where-filter)。

### 开始零样本分类

分类可以通过其中一个客户端或直接使用`curl`请求RESTful API来启动。

import ClassificationZeroshotPost from '/_includes/code/classification.zeroshot.post.mdx';

<ClassificationZeroshotPost/>

分类已经启动，并且将在后台运行。在启动分类后，将返回以下响应，可以通过`v1/classifications/{id}`端点获取状态。

```json
{
  "class": "Article",
  "classifyProperties": [
    "ofCategory"
  ],
  "id": "973e3b4c-4c1d-4b51-87d8-4d0343beb7ad",
  "meta": {
    "completed": "0001-01-01T00:00:00.000Z",
    "started": "2020-09-09T14:57:08.468Z"
  },
  "status": "running",
  "type": "zeroshot"
}
```

### 单个数据对象结果的评估
分类完成后，Weaviate实例中相关的引用属性数据对象将根据分类进行更新。这些数据对象将与其他数据对象类似地表示。可以通过[`v1/objects/{id}/?include=classification` RESTful端点](../rest/objects.md)或使用[GraphQL `_additional {classification}`字段](../graphql/additional-properties.md#classification)来请求每个数据对象的分类结果。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />