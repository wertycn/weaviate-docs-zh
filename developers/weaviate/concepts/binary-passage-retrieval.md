---
image: og/docs/concepts.jpg
sidebar_position: 80
title: Binary Passage Retrieval
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::note
BPR support in Weaviate is under development.
:::

## 概述

二进制段落检索（Binary Passage Retrieval）或学习哈希（learning-to-hash）是指生成每个向量的轻量级编码（或哈希），并使用哈希代替向量的思想。二进制段落检索（Binary Passage Retrieval，简称BPR）这个术语来源于Yamada等人于2021年的一篇研究论文（[https://arxiv.org/abs/2106.00882](https://arxiv.org/abs/2106.00882)）。它也被称为学习哈希，因为用于BPR的模型是通过一个综合的损失函数进行训练的，该损失函数考虑了常规向量之间的余弦/点距离以及向量的二进制哈希表示之间的汉明距离。

由于向量通常存储在内存中以获得最佳性能，因此减小大向量的大小可以极大地减少在处理较大数据集时运行Weaviate所需的总内存要求。

### 最多可减少32倍的内存消耗

![Weaviate二进制段检索](./img/binary-passage-retrieval-vector-vs-binary-hash@3x.png "使用二进制哈希时，将内存需求降低32倍")

上面的例子展示了一个32倍的减少因子，这是基于原始资源论文的。我们不再对完整的向量进行搜索，而是对表示向量的哈希进行搜索。在这个例子中，哈希是通过表示向量原始维度的符号来构建的。以前，每个维度都占用一个大小为4字节或32位的`float32`变量。由于符号只能是正或负，所以我们只需要两个可能的选项，即每个维度一个位。因此，内存占用减少了32倍。

### 通过两步检索来避免精度损失

由于哈希只保留符号信息，具有不同幅度但在每个维度上具有相同符号的两个向量将产生相同的哈希值。然而，原始向量在向量空间中的位置可能有很大的差异。例如，取两个向量 `[0.13, 0.97]` 和 `[0.87, 0.02]`。由于所有维度都是正数，哈希值将是相同的。然而，两个向量之间的余弦距离是非零的。

![Weaviate中的BPR两步二进制再排序器](./img/bpr-two-step-query-binary-rerank-vector@3x.png "使用哈希高效检索候选项，然后使用原始向量重新排序")

为了克服BPR可能的准确性损失，原始论文建议采用两步排序过程。哈希用于生成合适的候选项。对于每个候选项，可以使用原始向量确定正确的排序。例如，要检索前50个对象，我们将查询1,000个候选项，然后根据它们与查询向量的余弦距离重新排序。尽管这可能看起来需要额外的工作，但该过程仍然非常高效，因为：

- 计算哈希的汉明距离比计算余弦距离要便宜得多，因此初始查找比纯粹基于余弦的搜索要便宜。 （无论是否使用向量索引，这都是正确的，稍后会有更多详细信息。）
- 候选项数量足够小（例如1,000），因此基于原始向量的蛮力重新排名需要极少的计算时间。

## Weaviate中的BRP

:::note
BPR support in Weaviate is currently under development.
:::

Weaviate的BPR集成旨在提供最佳的用户体验。由于BPR主要被视为一种优化，我们的观点是支持本地BPR集成，可以通过简单的标志开启或关闭。支持BPR的Weaviate模块可以宣传其BPR功能，并在需要时默认使用BPR。对于使用Weaviate的`text2vec-*`模块的用户，在Weaviate中使用BPR将感觉完全相同。对于导入自己的向量的用户，如果您的自定义模块与BPR兼容，只需使用一个简单的标志来激活BPR模式。

### 启用BPR的Weaviate text2vec模块

BPR使用经过特殊训练的神经模型。与优化余弦或点积损失不同，启用BPR的模型优化的是余弦/点积和二进制损失的组合。因此，只有基于神经网络的模型（例如`text2vec-transformers`）可以与BPR一起使用。`text2vec-contextionary`模块将不支持BPR。

### 开箱即用的启用BPR的模型

长期来看，我们的目标是为最常用的`text2vec-transformers`模型（通常是[Sentence-BERT](https://sbert.net)模型）提供BPR支持。在推出BPR功能时，至少会支持一个流行的通用模型。

## BPR常见问题解答

<!-- #### When will BPR officially be supported in Weaviate? -->



BPR支持将在2022年第一季度末以生产质量的形式提供。如果您想提前尝试并且不介意使用POC样式的代码进行实验，请加入我们的[Slack](https://weaviate.io/slack)，您可以更早地开始。

#### 在BPR中使用哪些向量距离？

为了生成候选项（第一步），使用汉明距离对二进制哈希进行比较。为了重新排列候选项并生成最终的结果集（第二步），距离度量与没有 BPR 时相同。通常情况下，这是在原始向量表示上使用余弦距离或点积。

#### 在使用 BPR 时是否还需要（HNSW 或类似的）向量索引？

高效的近似最近邻（ANN）向量索引的优势仍然适用于BPR。由于哈希值更加紧凑，计算汉明距离比计算余弦距离要廉价得多，所以可以显著提高仍然可以使用暴力搜索的点。因此，在某些情况下，您可以考虑完全跳过向量索引，依赖于平面搜索。然而，当优化低延迟或高吞吐量时，向量索引将产生更好的结果。因此，我们预计在大多数情况下，BPR将与我们现有的索引（当前为HNSW）一起使用。

#### 我的内存需求会减少32倍吗？

不。32倍是向量本身的理论减小量。然而，向量索引还需要随着数据集大小增长的内存。好消息是，由于在二进制哈希上计算汉明距离要快得多，我们可以将大部分计算转移到查询时间，而不会牺牲延迟。因此，我们可以构建一个“较弱”的（二进制）向量索引，它将消耗更少的内存。目前，我们仍在进行实验，以确定使用BPR的最终内存需求。虽然要求会大大降低，但并非降低32倍。

#### BPR 可以与哪些媒体类型一起使用？

对于媒体类型没有限制。只要所使用的模型可以被（重新）训练以包含二进制损失，任何模型都可以与 BPR 一起使用。我们将首先推出对基于文本的模型的支持，但其他媒体类型（图像，CLIP 等）也可以受益于 BPR 的支持。

名称“二进制段落检索”暗示了文本段落，但所使用的技术并不特定于基于文本的媒体。

#### BPR可以与自定义向量一起使用，还是只能与Weaviate模块一起使用？

BPR支持所有用例，包括来自Weaviate之外的自定义模块中的自定义向量。然而，在这种情况下，您有责任确保模型提供的向量在哈希过程中不会有太多的精度损失。通常，在训练过程中，这是通过将二进制损失包含在损失函数中来完成的。

#### 在BPR模式下，我可以使用非BPR特定的模型吗？

从纯技术的角度来看，使用任何模型与BPR没有障碍。由于哈希函数非常简单，任何现有的向量都可以进行哈希。然而，如果模型没有经过专门训练以在生成良好向量的同时生成良好哈希，那么你的哈希很可能不会具有很多语义含义。通常，在训练过程中，会将二进制损失作为损失函数的一部分来完成这个目标。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
