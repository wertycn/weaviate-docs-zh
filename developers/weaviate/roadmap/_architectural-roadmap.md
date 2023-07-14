---
image: og/docs/roadmap.jpg
sidebar_position: 2
title: Architectural roadmap
---

import Badges from '/_includes/badges.mdx';

<Badges/>

<!-- style for roadmap table -->
<!-- <style>
.roadmap-table td {
  padding: 0
}
.roadmap-table-img {
    width: 120px;
    background-size: 90px;
    background-repeat: no-repeat;
}
</style> -->

# 简介

可扩展性是Weaviate的核心特性之一。以下路线图旨在从可扩展性和实现的角度，让您了解我们将如何发展Weaviate。

# 视频：Weaviate架构介绍

<iframe width="100%" height="375" src="https://www.youtube.com/embed/6hdEJdHWXRE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

# 完整路线图

<!-- <table class="roadmap-table">
  <tr>
    <td rowspan="3" class="roadmap-table-img" style="background-image: url('/img/roadmap-1.svg');"></td>
    <td>
      <b>HNSW性能提升</b>
    </td>
  </tr>
  <tr>
    <td>
      <i>状态：在 <a href="https://github.com/weaviate/weaviate/releases/tag/v1.4.0">v1.4.0</a> 版本中完成</i>
    </td>
  </tr>
  <tr>
    <td>
      通过硬件加速和效率改进，将向量搜索或向向量索引进行索引的时间缩短了最多50%。
    </td>
  </tr>
</table>

<table class="roadmap-table">
  <tr>
    <td rowspan="3" class="roadmap-table-img" style="background-image: url('/img/roadmap-2.svg');"></td>
    <td>
      <b>LSM Tree 迁移</b>
    </td>
  </tr>
  <tr>
    <td>
      <i>状态：在 <a href="https://github.com/weaviate/weaviate/releases/tag/v1.5.0">v1.5.0</a> 版本中完成</i>
    </td>
  </tr>
  <tr>
    <td>

    Weaviate中对象和倒排索引的存储方式从基于B+树的方法迁移到了基于LSM树的方法。这可以将导入时间加快高达50%。还解决了导入时间随时间推移而下降的问题。

    </td>
  </tr>
</table>

<table class="roadmap-table">
  <tr>
    <td rowspan="3" class="roadmap-table-img" style="background-image: url('/img/roadmap-3.svg');"></td>
    <td>
      <b>多分片索引</b>
    </td>
  </tr>
  <tr>
    <td>
      <i>状态: 已完成，将在下一个里程碑发布</i>

    </td>
  </tr>
  <tr>
    <td>
      一个单体索引（每个类别一个索引）可以分成更小的独立分片。这样可以更好地利用大型（单一）机器上的资源，并可以针对特定的大规模情况调整存储设置。
    </td>
  </tr>
</table>

<table class="roadmap-table">
  <tr>
    <td rowspan="3" class="roadmap-table-img" style="background-image: url('/img/roadmap-4.svg');"></td>
    <td>
      <b>无需复制的横向可扩展性</b>
    </td>
  </tr>
  <tr>
    <td>
      <i>状态：已完成，发布于v1.8.0</i>
    </td>
  </tr>
  <tr>
    <td>
      一个由多个分片组成的索引可以分布在多个节点之间。搜索将会触及多个节点上的多个分片，并合并结果。主要优点：如果某个使用场景不能适应单个节点，您可以使用*n*个节点来实现*n*倍的使用场景大小。在这一点上，集群中的每个节点仍然是一个潜在的单点故障。
    </td>
  </tr>
</table>

<table class="roadmap-table">
  <tr>
    <td rowspan="3" class="roadmap-table-img" style="background-image: url('/img/roadmap-5.svg');"></td>
    <td>
      <b>在节点上分布的复制分片</b>
    </td>
  </tr>
  <tr>
    <td>
      <i>状态：进行中（<a href="https://github.com/weaviate/weaviate/milestone/21">在GitHub上查看</a>）</i>
    </td>
  </tr>
  <tr>
    <td>
      一个节点可以包含已经存在于其他节点上的分片。这意味着如果一个节点宕机，另一个节点可以接管负载，而不会丢失可用性或数据。请注意，设计计划是无领导复制，因此没有主分片和次分片的区别。消除了所有单点故障。
    </td>
  </tr>
</table>

<table class="roadmap-table">
  <tr>
    <td rowspan="3" class="roadmap-table-img" style="background-image: url('/img/roadmap-6.svg');"></td>
    <td>
      <b>动态扩展</b>
    </td>
  </tr>
  <tr>
    <td>
      <i>待定</i>
    </td>
  </tr>
  <tr>
    <td>
      与其一开始就使用*n*个节点的集群，集群的大小可以在运行时增加或缩小。Weaviate会自动相应地分布现有的分片。
    </td>
  </tr>
</table>

# 下载路线图

<a href="/img/timeline_Weaviate_architecture_isometric.jpg" rel="Weaviate矢量数据库架构路线图" target="_blank">
  您也可以在这里下载完整的路线图（作为图像）
</a> -->

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />