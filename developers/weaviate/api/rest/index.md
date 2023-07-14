---
image: og/docs/api.jpg
sidebar_position: 0
title: RESTful API
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## RESTful API

Weaviate具有基本的RESTful API，可以对所有数据对象进行CRUD操作。客户端会自动判断是否应调用RESTful API或GraphQL API。您也可以选择自己调用API。

<!-- TODO: 是否应删除swagger链接 -->
### Open API规范

当前Weaviate版本的Open API规范可以在此处找到：[链接](https://app.swaggerhub.com/apis/semi-technologies/weaviate/v||site.weaviate_version||)。

## 参考资料

每个端点都有自己的页面：

- [/v1/schema](./schema.md)
- [/v1/objects](./objects.md)
- [/v1/batch](./batch.md)
- [/v1/backups](./backups.md)
- [/v1/classification](./classification.md)
- [/v1/meta](./meta.md)
- [/v1/nodes](./nodes.md)
- [/v1/.well-known](./well-known.md)
- [/v1/modules](./modules.md)