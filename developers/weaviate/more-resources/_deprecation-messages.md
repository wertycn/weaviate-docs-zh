---
image: og/docs/more-resources.jpg
title: Deprecation messages
---

import Badges from '/_includes/badges.mdx';

<Badges/>

以下列表包含了废弃消息：
<!--
<ul>
    {% for message in site.data.deprecations.deprecations %}
    <li>
        <a href="#{{ message.id }}" target="_self">{{ message.id }}</a> (v{{ message.sinceVersion }})
    </li>
    {% endfor %}
</ul> -->

{% for message in site.data.deprecations.deprecations %}

<!-- <h2 class="title-column" style="font-size:1.75rem" id="{{ message.id }}">{{ message.id }}</h2> -->

{{ message.msg }}
<!--
<table>
    <tr>
        <td>状态</td>
        <td>{{ message.status }}</td>
    </tr>
    <tr>
        <td>API类型</td>
        <td>{{ message.apiType }}</td>
    </tr>

    {% for location in message.locations %}

        <tr>
            <td>位置</td>
            <td>{{ location }}</td>
        </tr>

    {% endfor %}

    <tr>
        <td>缓解措施</td>
        <td>{{ message.mitigation | escape }}</td>
    </tr>

    <tr>
        <td>自版本开始</td>
        <td>{{ message.sinceVersion }}</td>
    </tr>

    <tr>
        <td>生效时间</td>
        <td>{{ message.sinceTime | date_to_rfc822 }}</td>
    </tr>

    <tr>
        <td>计划移除版本</td>
        <td>{{ message.plannedRemovalVersion }}</td>
    </tr>

    <tr>
        <td>移除版本</td>
        <td>{{ message.removedIn }}</td>
    </tr>

    <tr>
        <td>移除日期</td>
        <td>{{ message.removedTime | date_to_rfc822 }}</td>
    </tr>

</table>

<hr> -->

{% endfor %}