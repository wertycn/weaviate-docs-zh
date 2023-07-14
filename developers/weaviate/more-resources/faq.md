[faq.md](..%2F..%2F..%2F..%2Fweaviate-docs-zh-main%2Fweaviate-docs-zh-main%2Fdevelopers%2Fweaviate-en%2Fmore-resources%2Ffaq.md)---
image: og/docs/more-resources.jpg
sidebar_position: 3
title: FAQ
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 通用

#### Q: 为什么我要将Weaviate作为我的向量数据库使用？

<details>
  <summary>答案</summary>

> 我们的目标有三个方面。首先，我们希望尽可能地让其他人能够轻松地创建自己的语义系统或向量搜索引擎（因此，我们的API基于GraphQL）。其次，我们非常关注语义元素（也就是“向量数据库中的知识”），我们的最终目标是让Weaviate帮助您管理、索引和“理解”您的数据，以便您能够构建更新、更好、更快的应用程序。第三，我们希望您能够在任何地方运行它。这就是为什么Weaviate是容器化的原因。

</details>

#### 问：Weaviate和Elasticsearch之间有什么区别？

<details>
  <summary>回答</summary>

> 其他数据库系统（如Elasticsearch）依赖于倒排索引，这使得搜索非常快速。Weaviate也使用倒排索引来存储数据和值。但是，Weaviate还是一个矢量本地搜索数据库，这意味着数据以向量的形式存储，从而实现了语义搜索。这种数据存储的组合是独特的，可以实现端到端的快速、过滤和语义搜索。

</details>

#### Q: 您是否提供Weaviate作为托管服务？

<details>
  <summary>回答</summary>

> 是的，我们提供[Weaviate云服务](/pricing)。

</details>

## 配置和设置

#### 问：我应该如何配置我的实例大小？

<details>
  <summary>回答</summary>

> 您可以在文档的[架构部分](/developers/weaviate/concepts/resources.md#an-example-calculation)中找到此信息。

</details>

#### 问：我需要了解Docker（Compose）才能使用Weaviate吗？

<details>
  <summary>回答</summary>

> Weaviate使用Docker镜像来分发发布版本，并使用Docker Compose将模块丰富的运行时环境整合在一起。如果您对这些技术还不熟悉，我们建议阅读[Weaviate用户的Docker介绍](https://medium.com/semi-technologies/what-weaviate-users-should-know-about-docker-containers-1601c6afa079)。

</details>

#### Q：当Weaviate Docker容器重新启动时会发生什么？我的Weaviate数据库中的数据会丢失吗？

<details>
  <summary>答案</summary>

> 有三个级别：
> 1. 没有配置卷（在我们的 `docker-compose` 文件中是默认值），如果容器重新启动（例如由于崩溃或因为 `docker stop/start`），您的数据将保留
> 2. 没有配置卷（在我们的 `docker-compose` 文件中是默认值），如果容器被移除（例如通过 `docker-compose down` 或 `docker rm`），您的数据将丢失
> 3. 如果配置了卷，无论容器发生了什么情况，您的数据都会被持久化。它们可以被完全删除或替换，下次它们启动时，使用卷，您的所有数据都会在那里。

</details>

## 模式和数据结构

#### 问：在设计模式时，是否有任何“最佳实践”或指南需要考虑？

*(例如，如果我想对一本书的内容进行语义搜索，我是否应该在模式中表示章节和段落等信息，是否比将整本小说的内容包含在单个属性中更好？)*

<details>
  <summary>答案</summary>

> 一般而言，单位越小，搜索结果越准确。例如，两个句子的对象在其向量嵌入中可能包含比常规向量更多的信息（常规向量基本上只是句子的平均值）。同时，更多的对象会导致更长的导入时间和更多的空间占用（因为每个向量都占据一些数据）。例如，使用transformers时，单个向量为768xfloat32 = 3KB。如果你有百万、等等的向量，这可能会造成很大差异。一般来说，向量数量越多，所需的内存也越大。
> 所以，基本上，这是一组权衡。个人而言，我们在将段落作为单独的单位使用时取得了很大的成功，因为比起整个章节等更大的范围，这样做虽然还是更精确，但收益较小。
> 您可以使用交叉引用来链接章节和段落等内容。请注意，解析交叉引用会对性能产生轻微的影响。实际上，解析A1->B1的成本与分别查找A1和B1的成本相同。然而，这种成本可能只在非常大规模的情况下才会有所影响。

</details>

#### Q: 我应该在我的模式中使用引用吗？

<details>
  <summary>答案</summary>

> 简而言之：为了方便起见，您可以将关系添加到数据模式中，因为这样可以减少编写代码和查询以获取数据的工作量。但在查询中解析引用会消耗一些性能。
>
> 1. 如果您的终极目标是性能，引用可能没有任何价值，因为解析引用会增加开销。
> 2. 如果您的目标是表示数据项之间的复杂关系，它们可以非常有帮助。您可以在单个查询中解析引用，因此，如果您的类具有多个链接，解析其中一些连接以单个查询可能会非常有帮助。另一方面，如果您的数据中只有一个（双向）引用，您也可以将链接去规范化（例如，使用ID字段）并在搜索过程中解析它们。

</details>

#### 问题：在模式中是否可以创建一对多的关系？

<details>
  <summary>答案</summary>

> 是的，可以通过交叉引用将一个或多个对象（类 -> 一个或多个类）关联起来。对于原始类型的列表或数组的引用，这将很快可用（https://github.com/weaviate/weaviate/issues/1611）。

</details>

#### 问题：`text`、`string`、`valueText`和`valueString`之间有什么区别？

<details>
  <summary>答案</summary>

> `text`和`string`数据类型在分词行为上有所不同。请注意，`string`现已被弃用。有关差异的更多信息，请阅读[此部分](../config-refs/schema.md#property-tokenization)。

</details>

#### 问：Weaviate类是否有命名空间？

<details>
  <summary>答案</summary>

是的。每个类本身就像命名空间。此外，您可以使用[multi-tenancy](../concepts/data.md#multi-tenancy)功能为每个租户创建隔离的存储。这对于一个集群存储多个客户或用户的数据的用例特别有用。

</details>

#### Q: UUID格式是否有限制？我是否需要遵守任何标准？

<details>
  <summary>答案</summary>

> UUID必须以符合[规范的文本表示](https://en.wikipedia.org/wiki/Universally_unique_identifier#Format)的字符串形式呈现。如果您不指定UUID，Weaviate将生成一个`v4`即随机UUID。如果您自己生成它们，可以使用随机的UUID或根据某些字段确定性地确定它们。为此，您需要使用[`v3`或`v5`](https://en.wikipedia.org/wiki/Universally_unique_identifier#Versions_3_and_5_(namespace_name-based))。

</details>

#### 问：如果我在添加数据对象时没有指定UUID，Weaviate会自动创建一个吗？

<details>
  <summary>答案</summary>

> 是的，如果未指定，Weaviate会自动创建一个UUID。

</details>

#### 问：我可以使用Weaviate创建传统的知识图谱吗？

<details>
  <summary>答案</summary>

> 是的，您可以！Weaviate支持本体论，在其模式中使用类似RDF的定义，并且它可以直接运行。它是可扩展的，GraphQL API使您可以轻松地通过知识图查询。但现在您在这里。我们建议您真正尝试其语义功能。毕竟，您正在创建一个“知识”图 😉。

</details>

#### Q: 为什么Weaviate有一个模式而不是本体？

<details>
  <summary>回答</summary>

> 我们使用模式是因为它侧重于数据的表示（在我们的情况下是在GraphQL API中），但您可以使用Weaviate模式来表达本体论。 Weaviate的一个核心功能是它对您的模式（以及您的本体论）进行语义解释，以便您可以搜索概念而不是形式上定义的实体。

</details>

#### Q: Weaviate数据模式、本体论和分类法之间有什么区别？

<details>
  <summary>答案</summary>

> 在[这篇博文](https://medium.com/semi-technologies/taxonomies-ontologies-and-schemas-how-do-they-relate-to-weaviate-9f76739fc695)中了解有关分类、本体论和架构与Weaviate的关系。

</details>

## 文本和语言处理

#### 问：如何处理自定义术语？

<details>
  <summary>答案</summary>

> 有时，用户会使用自定义术语，通常以缩写或行话的形式出现。您可以在这里找到有关如何使用端点的更多信息[/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md#extending-the-contextionary-v1modulestext2vec-contextionaryextensions](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md#extending-the-contextionary-v1modulestext2vec-contextionaryextensions)

</details>

#### Q：如何在不丢失语义意义的情况下实现近实时的数据索引？

<details>
  <summary>答案</summary>

> 每个数据对象都会根据其语义含义获得其向量表示。简而言之，我们根据数据对象中使用的单词和概念计算数据对象的向量位置。上下文中的现有模型已经提供了足够的上下文。如果您想深入了解，可以在此处浏览[代码](https://github.com/weaviate/contextionary/tree/master/server)，但您也可以在[Stackoverflow](https://stackoverflow.com/tags/weaviate/)上提出具体问题，并标记为Weaviate。

</details>

#### Q: 为什么我的语言没有text2vec-contextionary？

<details>
  <summary>回答</summary>

> 因为你可能是第一个需要的人！在[GitHub上联系我们](https://github.com/weaviate/weaviate/issues)，我们将确保在下一次迭代中提供支持（除非你想要[Silbo Gomero](https://en.wikipedia.org/wiki/Silbo_Gomero)或其他的口哨语言）。

</details>

#### 问：如何处理有多个含义的单词？

<details>
  <summary>答案</summary>

> Weaviate如何解释您所说的“公司”而不是作为军队的分支？我们是根据架构和您添加的数据来进行解释的。在Weaviate中，架构可能包含一个公司类，其中包含名称属性和Apple的值。这种简单的表示（公司，名称，苹果）已足以使数据对象的向量位置偏向于企业或iPhone。您可以在[这里](../)了解我们是如何做到这一点的，或者您可以在[Stackoverflow](https://stackoverflow.com/tags/weaviate/)上提出具体问题，并标记为Weaviate。

</details>

#### 问：是否支持同时存在多个查询/文档嵌入模型的版本？（可以用于实时测试新模型版本）

<details>
  <summary>答案</summary>

> 您可以在Weaviate模式中创建多个类，其中一个类将像Kubernetes中的命名空间或Elasticsearch中的索引一样。因此，这些空间将是完全独立的，这使得空间1可以使用与空间2完全不同的嵌入向量。配置的向量化器始终仅限于单个类。您还可以使用Weaviate的交叉引用功能，在Class 1的对象与Class 2的对应对象之间建立图形连接，以便轻松查看另一个空间中的等效对象。

</details>

## 查询

#### 问题：如何获取类中的总对象数？

<details>
  <summary>回答</summary>

import HowToGetObjectCount from '/_includes/how.to.get.object.count.mdx';

> 下面的`Aggregate`查询将获取类中的总对象数。

<HowToGetObjectCount/>

</details>

#### 问题：如何从Weaviate的确信度中获取余弦相似度？

<details>
  <summary>回答</summary>

> 要从weaviate的`certainty`获取[余弦相似度](https://en.wikipedia.org/wiki/Cosine_similarity)，您可以使用`cosine_sim = 2*certainty - 1`

</details>

#### 问：我的搜索结果的质量会根据指定的限制而改变。为什么？我该如何解决这个问题？

<details>
  <summary>答案</summary>

Weaviate使用ANN索引来进行向量搜索。ANN索引是一种近似最近邻索引。"近似"部分指的是显式的召回-查询速度权衡。这个权衡在[ANN基准测试部分](/developers/weaviate/benchmarks/ann.md#results)详细介绍。例如，对于给定的HNSW参数集，98%的召回率意味着有2%的结果与真实的最近邻不匹配。哪些构建参数导致哪些召回率取决于使用的数据集。基准测试页面展示了4个不同的示例数据集。根据每个数据集的特点，您可以选择与您的生产负载最接近的数据集，并对相应的构建和查询时间参数的预期召回率得出结论。

通常，如果您需要比默认参数提供的更高的召回率，您可以使用更强的参数。这可以在构建时（`efConstruction`、`maxConnections`）或查询时（`ef`）完成。粗略地说，查询时较高的`ef`值意味着更彻底的搜索。它会略微增加延迟，但也会导致稍微更好的召回率。

通过更改指定的限制，您隐式地改变了`ef`参数。这是因为默认的`ef`值设置为`-1`，表示Weaviate应该根据限制选择参数。动态的`ef`值由配置字段`dynamicEfMin`（作为下边界）、`dynamicEfMax`（作为上边界）和`dynamicEfFactor`（根据限制在下边界和上边界之间推导目标`ef`的因子）来控制。

示例：使用默认参数`ef=-1`，`dynamicEfMin=100`，`dynamicEfMax=500`，`dynamicEfFactor=8`，您将根据限制得到以下`ef`值：

- `limit=1`，动态计算：`ef=1*8=8`。该值低于下限，因此`ef`被设为`100`。
- `limit=20`，动态计算：`ef=20*8=160`。该值在边界之内，因此`ef`为`160`。
* `limit=100`，动态计算：`ef=100*8=800`。这个值超过了上限，所以`ef`被设置为`500`。

如果您需要更高的搜索质量，可以考虑以下选项：

1. 不使用动态的`ef`值，而使用固定的值来实现所需的召回率。
1. 如果您的搜索质量在查询时间`ef`值上有很大变化，您还应考虑选择更强的构建参数。[ANN基准测试部分](/developers/weaviate/benchmarks/ann.md#results)提供了许多不同数据集的参数组合。

</details>

#### 问：为什么您使用GraphQL而不是SPARQL？

<details>
  <summary>回答</summary>

> 为了提供良好的用户体验，我们希望尽可能简化将Weaviate集成到您的堆栈中的过程，我们相信GraphQL是解决方案。GraphQL周围的社区和客户端库非常庞大，您几乎可以使用所有这些库与Weaviate一起使用。

</details>

## 数据管理

#### 问：迭代对象的最佳方法是什么？我可以进行分页的API调用吗？

<details>
  <summary>回答</summary>

> 是的，Weaviate支持基于游标的迭代以及通过结果集进行分页。
>
> 要遍历所有对象，您可以在[REST](../api/rest/objects.md#exhaustive-listing-using-a-cursor-after)和[GraphQL](../api/graphql/additional-operators.md#cursor-with-after)中使用`after`参数。
> 对于对结果集进行分页，您可以使用`offset`和`limit`参数来进行GraphQL API调用。请参阅[此页面](../api/graphql/filters.md#pagination-with-offset)，其中描述了如何使用这些参数，包括性能和限制的提示。

</details>

#### Q: 更新数据的最佳实践是什么？

<details>
  <summary>回答</summary>

> 这里是更新数据的三个最佳实践：
> 1. 使用[批量API](../api/rest/batch.md)
> 2. 从一个较小的批次大小开始，例如每批100个。如果速度非常快，可以增加批次大小；如果遇到超时问题，则减小批次大小。
> 3. 如果您有单向关系（例如 `Foo -> Bar`），最简单的方法是先导入所有 `Bar` 对象，然后导入所有已经设置好引用的 `Foo` 对象。如果您有更复杂的关系，您也可以先导入没有引用的对象，然后使用 [`/v1/batch/references API`](../api/rest/batch.md) 在任意方向上设置类之间的链接。

</details>

## 模块

#### Q：我可以连接自己的模块吗？

<details>
  <summary>答案</summary>

> [是的！](/developers/weaviate/modules/other-modules/custom-modules.md)

</details>

#### 问：我可以训练自己的text2vec-contextionary向量化模块吗？

<details>
  <summary>回答</summary>

> 目前还不能。您可以使用[可用的contextionaries](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary.md)来支持多种语言，并使用迁移学习功能来添加自定义概念。

</details>

## Weaviate中的索引

#### 问：Weaviate使用Hnswlib吗？

<details>
  <summary>回答</summary>

> 不是
>
> Weaviate使用自定义的HNSW实现，克服了[hnswlib](https://github.com/nmslib/hnswlib)的一些限制，例如持久性要求、CRUD支持、预过滤等。
>
> Weaviate中的自定义HNSW实现参考：
>
> - [HNSW插件（GitHub）](https://github.com/weaviate/weaviate/tree/master/adapters/repos/db/vector/hnsw)
> - [向量点积ASM](https://github.com/weaviate/weaviate/blob/master/adapters/repos/db/vector/hnsw/distancer/asm/dot_amd64.s)
>
> 更多信息:
>
> - [Weaviate，带有CRUD支持的ANN数据库-DB-Engines.com](https://db-engines.com/en/blog_post/87) ⬅️ 关于该主题的最佳资源
> - [Weaviate文档中的HNSW实现](/developers/weaviate/concepts/vector-index.md#hnsw)
> 注意：HNSW只是Weaviate中的一种实现，但Weaviate可以支持多种索引算法，详情请参阅[这里](/developers/weaviate/concepts/vector-index.md)。

</details>

#### 问题：所有ANN算法都有可能成为Weaviate中的索引插件候选吗？

<details>
  <summary>回答</summary>

> 不是的
> 一些算法（例如Annoy或ScaNN）在构建后是完全不可变的，它们既不能更改也不能逐步构建。相反，它们要求您提前准备好所有的向量，然后进行一次构建。构建完成后，您只能对其进行查询，无法添加更多元素或更改现有元素。因此，它们无法支持我们在Weaviate中想要支持的CRUD操作。

</details>

#### 问：Weaviate是使用预过滤还是后过滤的ANN索引搜索？

<details>
  <summary>答案</summary>

> Weaviate目前在过滤后的ANN搜索中仅使用预过滤。
> 更多详细信息，请参阅"Weaviate的向量和标量过滤是如何工作的"。

</details>

#### Q: Weaviate的向量和标量过滤是如何工作的？

<details>
  <summary>答案</summary>

> 这是一个2步骤的过程：
> 1. 倒排索引（在导入时构建）用于查询以生成指定文档 ID 的允许列表。然后，使用此允许列表查询 ANN 索引（列表是我们自定义实现的一个原因之一）。
> 2. 如果我们遇到一个文档ID可能是一个接近匹配项，但不在允许列表中，该ID将被视为候选项（即将其添加到我们要评估的链接列表中），但永远不会添加到结果集中。由于我们只添加允许的ID到集合中，所以我们不会提前退出，即在达到前k个元素之前。
>
> 有关技术实现的更多信息，请参阅[此视频](https://www.youtube.com/watch?v=6hdEJdHWXRE)。

</details>

#### 嵌入向量的最大维度是多少？

<details>
  <summary>答案</summary>

> 由于嵌入向量当前使用`uint16`存储，所以最大长度目前为65535。

</details>

## 性能

#### Q: 在Weaviate中，对于查询速度来说，更重要的是更多的CPU性能还是更多的内存？

更具体地说：如果你必须在一个具有16GB RAM和2个CPU的机器和一个具有8GB RAM和4个CPU的机器之间选择，你会选择哪个？

<details>
  <summary>答案</summary>

> 这个问题很难以100%的正确回答，因为有几个因素需要考虑：
> * **向量搜索本身**。这部分是CPU绑定的，但只是在吞吐量方面：单个搜索是单线程的。多个并行搜索可以使用多个线程。因此，如果你测量单个请求的时间（否则是空闲的），无论机器是否有1个核心还是100个核心，时间都是相同的。然而，如果您的QPS接近CPU的吞吐量，通过增加更多核心可以获得巨大的好处。
> * **对象的检索**。一旦向量搜索部分完成，我们基本上得到了一个需要将其解析为实际对象的n个ID列表。这通常是IO限制的。然而，所有的磁盘文件都是内存映射的。所以通常情况下，更多的内存可以让你将更多的磁盘状态保存在内存中。然而，在现实生活中，情况并不那么简单。搜索很少是均匀分布的。假设90%的搜索只返回10%的对象（因为这些是更受欢迎的搜索结果）。那么，如果这10%的磁盘对象已经被缓存到内存中，增加更多的内存就没有好处了。
> 在考虑上述情况时，我们可以谨慎地说：如果吞吐量是问题，增加CPU；如果响应时间是问题，增加内存。然而，请注意，只有在有更多可以缓存的内容时，增加内存才会增加价值。如果您有足够的内存来缓存整个磁盘状态（或者至少是大多数查询相关的部分），额外的内存将不会增加任何额外的好处。
> 如果我们谈论的是导入，那么由于创建HNSW索引的成本，它们几乎总是受限于CPU。因此，如果您可以在导入和查询之间进行调整大小，我的建议是在导入时尽量使用CPU，然后在查询时逐渐替换CPU为内存，直到不再看到更多的好处。（这假设导入和查询之间存在分离，但在现实生活中可能并不总是如此）。

</details>

#### 问题：数据导入时间长/速度慢（比v1.0.0之前的版本慢），是什么原因引起的，我该怎么办？

<details>
  <summary>回答</summary>

> 第一个支持的向量索引类型HNSW在查询时非常快，但在向量化方面较慢。这意味着添加和更新数据对象需要相对更多的时间。当有其他向量索引类型可用时，您可以尝试使用其他向量索引类型。

</details>

#### 问题：如何优化慢查询？
<details>
  <summary>答案</summary>

> 包含需要进行过滤或解析的深度嵌套引用的查询可能需要一些时间。阅读有关优化策略的详细信息[这里](./performance.md#costs-of-queries-and-operations)。

</details>


#### 问：当标量搜索和向量搜索结合时，标量过滤器会在最近邻（向量）搜索之前还是之后发生？

<details>
  <summary>答案</summary>

> Weaviate中的混合结构向量搜索是预过滤的。首先查询一个倒排索引，基本上形成一个允许列表，然后在HNSW搜索中，使用允许列表将非允许的文档ID仅作为要跟随连接的节点，而不添加到结果集中。

</details>

#### 问：关于“过滤向量搜索”：由于这是一个两阶段的流水线，这个ID列表可能有多大？您知道这个大小会如何影响查询性能吗？

<details>
  <summary>答案</summary>

> 基本上，列表ID使用的是内部文档ID，它是一个`uint64`或8字节的ID。列表可以随着可用内存的增加而增长。例如，有2GB的可用内存，它可以容纳250M个ID，有20GB的可用内存，它可以容纳25B个ID，以此类推。
>
> 在性能方面，有两个要考虑的因素：
> 1. 构建查找列表
> 2. 在向量搜索时筛选结果
> 构建列表是典型的倒排索引查找操作，所以根据运算符，这只是对 == 进行一次读取（或一组范围读取，例如对于 >7，我们将从 7 到无穷大的值行进行读取）。该过程非常高效，类似于传统搜索引擎（如 Elasticsearch）中的相同操作。
> 在向量搜索期间进行过滤取决于过滤器的限制程度。在您提到的情况下，如果包含了大量的ID，过滤将非常高效。因为未过滤的搜索等效于您的ID列表包含所有可能的ID。所以HNSW索引会正常工作。然而，只要列表存在，就会有一个小的性能损耗：我们需要检查当前的ID是否包含在允许列表中。这本质上是一个哈希查找，因此每个对象应该是O(1)。尽管如此，仍然存在轻微的性能损耗。
>
> 现在让我们来看另一个极端情况，一个非常严格的列表，即列表中只有很少的ID，实际上需要更多的时间。因为HNSW索引会找到相邻的ID，但由于它们不包含在结果候选集中，所以我们只能评估它们的连接，而不能评估这些点本身。在非常非常严格的列表的极端情况下，例如最坏情况下列表中只有10个对象，如果过滤后的ID与查询之间的距离非常远，搜索将变得非常耗时。在这种极端情况下，实际上直接跳过索引，对这10个ID进行蛮力的无索引向量搜索会更高效。因此，当蛮力搜索比使用HNSW进行高度限制的向量搜索更高效时，我们需要设定一个截断点。目前我们还没有任何优化的方法来发现这样的截断点并跳过索引，但如果这成为一个实际问题，实现这个优化应该是相当简单的。

</details>

#### 问：我的Weaviate设置使用的内存比我认为合理的要多。我该如何调试这个问题？

<details>
  <summary>答案</summary>

> 首先，请确保您的导入操作使用的是最新版本的Weaviate，因为`v1.12.0`/`v1.12.1`修复了一个问题，即[写入磁盘的数据过多](https://github.com/weaviate/weaviate/issues/1868)，这在重启后会导致不合理的内存消耗。如果这还没有解决问题，请参考这篇文章中的[如何对Weaviate设置进行内存使用率分析](https://stackoverflow.com/a/71793178/5322199)。

</details>

## 故障排除 / 调试

#### 问题：我如何打印Weaviate的堆栈跟踪？

<details>
  <summary>答案</summary>

您可以通过向进程发送`SIGQUIT`信号来完成。这将在控制台上打印出堆栈跟踪信息。日志级别和调试变量可以通过`LOG_LEVEL`和`DEBUG`[环境变量](https://weaviate.io/developers/weaviate/config-refs/env-vars)进行设置。

在这里阅读更多关于SIGQUIT的内容：[链接](https://en.wikipedia.org/wiki/Signal_(IPC)#SIGQUIT) 和这个 [StackOverflow回答](https://stackoverflow.com/questions/19094099/how-to-dump-goroutine-stacktraces/35290196#35290196)。

</details>

## 杂项

#### Q: 我可以在Weaviate中请求一个功能吗？

<details>
  <summary>回答</summary>

> 当然（而且，随时可以发起[拉取请求](https://github.com/weaviate/weaviate/pulls)😉），您可以在这里[添加这些请求](https://github.com/weaviate/weaviate/issues)。您只需要一个GitHub账号，并且在那里的同时，请确保给我们一个星星😇。

</details>

#### Q：Weaviate在分布式设置中的一致性模型是什么？

<details>
  <summary>答案</summary>

> Weaviate通常优先选择可用性而不是一致性（AP优先于CP）。它旨在在可用性比一致性更为关键的情况下，在高吞吐量下提供低搜索延迟。如果您的数据需要严格的可串行化，我们通常建议将数据存储在不同的主要数据存储中，使用Weaviate作为辅助数据存储，并在两者之间设置复制。如果您不需要可串行化，并且最终一致性对于您的用例足够，那么Weaviate可以用作主要数据存储。
>
> Weaviate没有事务的概念，操作总是只影响一个键，因此串行化不适用。在分布式设置（正在开发中），Weaviate的一致性模型是最终一致性。当集群正常运行时，所有更改都会在用户确认写入后被复制到所有受影响的节点上。导入请求完成后，所有节点上的搜索结果将立即显示对象。如果在导入操作期间并发发生搜索查询，则节点可能尚未同步。这意味着一些节点可能已经包含新添加或更新的对象，而其他节点尚未包含。在健康的集群中，所有节点将在成功完成导入请求时达到一致。如果一个节点暂时不可用并重新加入集群，它可能暂时不同步。然后，它将从其他副本节点同步错过的更改，并最终再次提供相同的数据。

</details>

#### Q: 使用你们的聚合功能，我无法看到如何进行时间桶分析，这个功能是否可行？

<details>
  <summary>回答</summary>

> 目前，我们还不能对时间序列进行时间桶聚合，但在架构上并没有障碍。如果有需求的话，这似乎是一个不错的功能请求，您可以在这里提交一个[问题](https://github.com/weaviate/weaviate/issues)。（不过我们是一家非常小的公司，目前的重点是横向扩展。）

</details>

#### Q: 如何使用 docker-compose 运行最新的主分支？

<details>
  <summary>答案</summary>

> 您可以使用 `docker-compose` 运行 Weaviate，可以基于 [`master`](https://github.com/weaviate/weaviate) 分支构建自己的容器。请注意，这不是官方发布的 Weaviate 版本，可能包含错误。
>
> ```sh
> git clone https://github.com/weaviate/weaviate.git
> cd weaviate
> docker build --target weaviate -t name-of-your-weaviate-image .
> ```
> ```
>
> 然后，创建一个包含这个新镜像的 `docker-compose.yml` 文件。例如：
>
> ```yml
> version: '3.4'
> services:
>   weaviate:
>     image: name-of-your-weaviate-image
>     ports:
>       - 8080:8080
>     environment:
>       CONTEXTIONARY_URL: contextionary:9999
>       QUERY_DEFAULTS_LIMIT: 25
>       AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
>       PERSISTENCE_DATA_PATH: './data'
>       ENABLE_MODULES: 'text2vec-contextionary'
DEFAULT_VECTORIZER_MODULE: 'text2vec-contextionary'
AUTOSCHEMA_ENABLED: 'false'
contextionary:
  environment:
    OCCURRENCE_WEIGHT_LINEAR_FACTOR: 0.75
    EXTENSIONS_STORAGE_MODE: weaviate
    EXTENSIONS_STORAGE_ORIGIN: http://weaviate:8080
    NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE: 5
    ENABLE_COMPOUND_SPLITTING: 'false'
  image: semitechnologies/contextionary:en0.16.0-v1.0.2
```
> 构建完成后，您可以使用docker-compose运行这个Weaviate构建: `docker-compose up`。

</details>

## 还有更多问题吗？

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
