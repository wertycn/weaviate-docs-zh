---
image: og/docs/client-libraries.jpg
sidebar_position: 3
title: JavaScript
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::note JavaScript client version
The current JavaScript client version is `v||site.javascript_client_version||`.
:::

import JavaScriptMaintenanceWarning from '/_includes/javascript-maintenance-warning.mdx';

<JavaScriptMaintenanceWarning />

## 安装和设置

JavaScript客户端库包可以通过[npm](https://www.npmjs.com/)轻松安装。

<!-- 将示例中的$ ..替换为删除提示符($)，因为它与实际命令一起复制 -->
```bash
npm install weaviate-client
```

现在您可以按照以下方式在您的JavaScript脚本中使用客户端:

```javascript
const weaviate = require("weaviate-client");

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

client
  .schema
  .getter()
  .do()
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.error(err)
  });
```

## 认证

import ClientAuthIntro from '/developers/weaviate/client-libraries/_components/client.auth.introduction.mdx'

<ClientAuthIntro clientName="JavaScript"/>

### WCS认证

import ClientAuthWCS from '/developers/weaviate/client-libraries/_components/client.auth.wcs.mdx'

<ClientAuthWCS />

### OIDC认证

import ClientAuthOIDCIntro from '/developers/weaviate/client-libraries/_components/client.auth.oidc.introduction.mdx'

<ClientAuthOIDCIntro />

#### <i class="fa-solid fa-key"></i> 资源所有者密码流

import ClientAuthFlowResourceOwnerPassword from '/developers/weaviate/client-libraries/_components/client.auth.flow.resource.owner.password.mdx'

<ClientAuthFlowResourceOwnerPassword />


```js
const client = weaviate.client({
  scheme: "http",
  host: "weaviate-host",
  authClientSecret: new weaviate.AuthUserPasswordCredentials({
    username: "user123",
    password: "password",
    scopes: ["offline_access"]  // optional, depends on the configuration of your identity provider (not required with WCS)
  })
});
```

#### <i class="fa-solid fa-key"></i> 客户端凭证流程

import ClientAuthFlowClientCredentials from '/developers/weaviate/client-libraries/_components/client.auth.flow.client.credentials.mdx'

<ClientAuthFlowClientCredentials />

```js
const client = weaviate.client({
  scheme: "http",
  host: "weaviate-host",
  authClientSecret: new weaviate.AuthClientCredentials({
    clientSecret: "supersecuresecret",
    scopes: ["scope1", "scope2"]  // optional, depends on the configuration of your identity provider (not required with WCS)
  })
});
```

#### <i class="fa-solid fa-key"></i> 刷新令牌流程

import ClientAuthBearerToken from '/developers/weaviate/client-libraries/_components/client.auth.bearer.token.mdx'

<ClientAuthBearerToken />

```js
const client = weaviate.client({
  scheme: "http",
  host: "weaviate-host",
  authClientSecret: new weaviate.AuthAccessTokenCredentials({
    accessToken: "abcd1234",
    expiresIn: 900,
    refreshToken: "efgh5678"
  })
});
```

## 自定义头部

您可以在初始化时向客户端传递自定义头部，这些头部将被添加进去：

```js
const client = weaviate.client({
    scheme: 'http',
    host: 'weaviate-host',
    headers: {headerName: 'HeaderValue'}
  });
```

这些标题将包含在客户端发出的每个请求中。

## 参考资料

所有由JS客户端覆盖的[RESTful端点](../api/rest/index.md)和[GraphQL函数](../api/graphql/index.md)在代码块中都有JavaScript示例。

## 设计

### 构建器模式

JavaScript客户端是根据[构建者模式](https://en.wikipedia.org/wiki/Builder_pattern)设计的。该模式用于构建复杂的查询对象。这意味着调用（例如使用RESTful的GET请求检索数据，或者使用更复杂的GraphQL查询）是通过链接对象来构建的，以减少复杂性。一些构建器对象是可选的，而其他构建器对象则需要执行特定的功能。构建器示例可以在[RESTful API参考页面](../api/rest/index.md)和[GraphQL参考页面](../api/graphql/index.md)中找到。

在本页顶部的代码片段展示了一个简单的查询，对应于RESTful请求`GET /v1/schema`。客户端通过引入包并连接到本地实例来进行初始化。然后，通过使用`.getter()`获取`.schema`构建查询。查询将通过`.do()`调用发送。对于您想要构建和执行的每个函数，都需要使用`do()`。

### 一般注意事项
- 所有的方法都使用ES6的Promise来处理异步代码，因此在函数调用后需要使用`.then()`，或者支持`async`/`await`语法。
- 如果发生错误，Promise会拒绝并返回具体的错误消息。（如果使用`async`/`await`，拒绝的Promise会像抛出异常一样）
- 客户端内部使用`isomorphic-fetch`来进行REST调用，因此在浏览器和Node.js应用程序中都可以正常工作，无需任何修改。

## 更新日志

请参阅GitHub上的[变更日志](https://github.com/weaviate/weaviate-javascript-client/releases)。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />