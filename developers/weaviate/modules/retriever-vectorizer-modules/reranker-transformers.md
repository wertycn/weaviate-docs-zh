---
image: og/docs/modules/text2vec-transformers.jpg
sidebar_position: 11
title: reranker-transformers
---

## 简介

`reranker-transformers`模块允许您使用预训练的语言转换模型作为Weaviate重排序模块来运行自己的推理容器。这对于在本地环境中尝试重排序器非常有用，与基于API的模块（如[`reranker-cohere`](./reranker-cohere.md)）相比，后者使用外部API对您的数据进行重排序。

reranker-transformers模块使得可以将[sentence transformers models](https://www.sbert.net/docs/pretrained_cross-encoders.html)作为向量、bm25和混合搜索结果的第二阶段重新排序的工具。这些预训练模型是在Hugging Face上开源的。目前有5个预训练的检查点可用，它们在速度和排序质量之间进行权衡。我们目前支持`cross-encoder/ms-marco-MiniLM-L-6-v2`模型，它是第二大的模型，与最大的模型(L-12)在[MS-MARCO](https://microsoft.github.io/msmarco/)上的评估结果大致相同(39.01 vs. 39.02)。

## 如何启用

### Weaviate云服务

`reranker-transformers`模块在WCS上不可用。<!-- TODO: 检查 -->

### Weaviate开源版

以下命令将拉取`semitechnologies/reranker-transformers:cross-encoder-ms-marco-MiniLM-L-6-v2` Docker镜像，并在本地启动开发服务器。请查看/编辑`tools/dev/run_dev_server.sh`中的`local-reranker-transformers`部分，选择要启用的向量化模块。

```bash
tools/dev/restart_dev_environment.sh --reranker
tools/dev/run_dev_server.sh local-reranker-transformers
```


## 如何使用

- 使用该模块将启用[`rerank` GraphQL _additional property](../../api/graphql/additional-properties.md#rerank)。
- 有关使用示例，请参阅[使用指南：搜索 - 重新排序](../../search/rerank.md)页面。


## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />