---
image: og/docs/roadmap.jpg
sidebar_position: 1
title: Feature roadmap
---

import Badges from '/_includes/badges.mdx';

<Badges/>

以下是Weaviate计划的功能概述。点击链接可以对功能点进行投票或参与讨论。您还可以加入我们的[论坛](https://forum.weaviate.io/)，以更详细地讨论路线图。

* 当前版本的Weaviate是 **v||site.weaviate_version||**。您可以在[meta](/developers/weaviate/api/rest/meta.md)端点检查当前运行的版本。
* 通过在GitHub问题页面上点击👍表情符号来点赞一个问题

<!-- 添加计划版本 -->
<!-- {% for label in site.data.roadmap %}
{% if label[0] != 'backlog' %}
## {{ label[0] | replace: 'planned-', '计划版本 ' | camelcase }}
{% assign description = label[1].description | strip_newlines %}
{% if description != '' %}
<small>{{ description }}</small>
{% endif %} -->

<!-- <ul class="list-group mb-4">
{% assign issues = label[1].items | sort: '+1' | reverse %}
{% for issue in issues %}
<li class="list-group-item">
    <a href="{{ issue.url }}" target="_blank">{{ issue.title }}</a> – 👍 {{ issue['+1'] }}
</li>
{% endfor %}
</ul>

{% endif %}
{% endfor %} -->

<!-- 添加待办事项 -->
## 待办事项
<!-- <ul class="list-group mb-4">
{% assign backlog = site.data.roadmap['backlog'].items | sort: '+1' | reverse %}
{% for issue in backlog %}
<li class="list-group-item">
    <a href="{{ issue.url }}" target="_blank">{{ issue.title }}</a> – 👍 {{ issue['+1'] }}
</li>
{% endfor %}
</ul> -->

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />