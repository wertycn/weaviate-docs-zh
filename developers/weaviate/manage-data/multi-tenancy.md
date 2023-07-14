---
image: og/docs/configuration.jpg
sidebar_position: 60
title: Multi-tenancy operations
---

import Badges from '/_includes/badges.mdx';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PythonCode from '!!raw-loader!/_includes/code/howto/manage-data.multi-tenancy.py';
import TSCode from '!!raw-loader!/_includes/code/howto/manage-data.multi-tenancy.ts';


<Badges/>

:::info Related pages
- [How to: Configure a schema](../configuration/schema-configuration.md)
- [References: REST API: Schema](../api/rest/schema.md)
- [Concepts: Data Structure](../concepts/data.md#multi-tenancy)
:::

## 启用多租户

默认情况下，多租户是被禁用的。要启用多租户，请按照下面的示例在类定义中设置`multiTenancyConfig`变量。

```json
{
  "class": "MultiTenancyClass",
  // highlight-start
  "multiTenancyConfig": {"enabled": true}
  // highlight-end
}
```

## 类操作

### 添加租户

要将租户添加到类中，您必须向Weaviate类提供租户名称。

import TenantNameFormat from '/_includes/tenant-names.mdx';

<TenantNameFormat/>

下面是代码示例，其中将租户`tenantA`和`tenantB`添加到类`MultiTenancyClass`中：

<!-- TODO: 添加TS/Go/Java示例 -->

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START AddTenantsToClass"
      endMarker="# END AddTenantsToClass"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START AddTenantsToClass"
      endMarker="// END AddTenantsToClass"
      language="ts"
    />
  </TabItem>
</Tabs>


### 列出租户

要列出类中现有的租户，您必须提供 Weaviate 类的名称。

以下是在`MultiTenancyClass`类中列出现有租户的代码示例：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START ListTenants"
      endMarker="# END ListTenants"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ListTenants"
      endMarker="// END ListTenants"
      language="ts"
    />
  </TabItem>
</Tabs>


### 删除租户

您可以通过提供Weaviate类名来删除一个或多个现有的租户。

如果指定要删除的租户不属于该类，则会被忽略。


<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START RemoveTenants"
      endMarker="# END RemoveTenants"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START RemoveTenants"
      endMarker="// END RemoveTenants"
      language="ts"
    />
  </TabItem>
</Tabs>

## 对象操作

### CRUD操作

如果启用了多租户功能，在每个CRUD操作中，您必须向Weaviate提供租户名称。

下面是在`MultiTenancyClass`类中创建对象的代码示例：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START CreateMtObject"
      endMarker="# END CreateMtObject"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START CreateMtObject"
      endMarker="// END CreateMtObject"
      language="ts"
    />
  </TabItem>
</Tabs>


### 搜索查询

`Get`和`Aggregate`查询支持多租户操作。（`Explore`查询目前不支持多租户操作。）

如果启用了多租户功能，您必须在每个搜索查询中向Weaviate提供租户名称。

以下是从租户`tenantA`中的`MultiTenancyClass`类中获取一个对象的代码示例：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START Search"
      endMarker="# END Search"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START Search"
      endMarker="// END Search"
      language="ts"
    />
  </TabItem>
</Tabs>


## 交叉引用

如果启用了多租户功能，在创建、更新或删除交叉引用时，您必须向Weaviate提供租户名称。

您可以从多租户类对象建立到以下内容的交叉引用：
- 非多租户类对象，或
- 属于同一租户的多租户类对象。

下面的示例创建了两个对象之间的交叉引用。它将属于`tenantA`的`MultiTenancyClass`类中的一个对象链接到`JeopardyCategory`类中的一个对象：

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PythonCode}
      startMarker="# START AddCrossRef"
      endMarker="# END AddCrossRef"
      language="py"
    />
  </TabItem>

  <TabItem value="js" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START AddCrossRef"
      endMarker="// END AddCrossRef"
      language="ts"
    />
  </TabItem>
</Tabs>


如上所述，`JeopardyCategory`类对象可以是以下之一：
- 非多租户对象或
- 属于`tenantA`的多租户对象。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
