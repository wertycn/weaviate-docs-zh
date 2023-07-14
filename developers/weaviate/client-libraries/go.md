---
image: og/docs/client-libraries.jpg
sidebar_position: 7
title: Go
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::note Go client version
The current Go client version is `v||site.go_client_version||`.
:::

## 安装和设置

要获取最新的稳定版本的Go客户端库，请运行以下命令:

```bash
go get github.com/weaviate/weaviate-go-client/v4
```

这个 API 客户端兼容 Go 1.16+。

您可以在您的 Go 脚本中使用该客户端，如下所示：

``` go
package main

import (
	"context"
	"fmt"
	"github.com/weaviate/weaviate-go-client/v4/weaviate"
)

func GetSchema() {
    cfg := weaviate.Config{
        Host:   "localhost:8080",
		Scheme: "http",
    }
    client, err := weaviate.NewClient(cfg)
    if err != nil {
        panic(err)
    }

    schema, err := client.Schema().Getter().Do(context.Background())
    if err != nil {
        panic(err)
    }
    fmt.Printf("%v", schema)
}
```

## 认证

import ClientAuthIntro from '/developers/weaviate/client-libraries/_components/client.auth.introduction.mdx'

<ClientAuthIntro clientName="Go"/>

### WCS认证

import ClientAuthWCS from '/developers/weaviate/client-libraries/_components/client.auth.wcs.mdx'

<ClientAuthWCS />

### API密钥认证

:::info Available in Weaviate Go client versions `4.7.0` and higher.
:::

import ClientAuthApiKey from '/developers/weaviate/client-libraries/_components/client.auth.api.key.mdx'

<ClientAuthApiKey />


```go
cfg := weaviate.Config{
	Host:       "weaviate.example.com",
	Scheme:     "http",
	AuthConfig: auth.ApiKey{Value: "my-secret-key"},
	Headers:    nil,
}
client, err := weaviate.NewClient(cfg)
if err != nil{
  fmt.Println(err)
}
```

### OIDC身份验证

import ClientAuthOIDCIntro from '/developers/weaviate/client-libraries/_components/client.auth.oidc.introduction.mdx'

<ClientAuthOIDCIntro />

#### <i class="fa-solid fa-key"></i> 资源所有者密码流程

import ClientAuthFlowResourceOwnerPassword from '/developers/weaviate/client-libraries/_components/client.auth.flow.resource.owner.password.mdx'

<ClientAuthFlowResourceOwnerPassword />

```go
cfg := weaviate.Config{
	Host:   "weaviate.example.com",
	Scheme: "http",
	AuthConfig: auth.ResourceOwnerPasswordFlow{
		Username: "Your user",
		Password: "Your password",
		Scopes:   []string{"offline_access"}, // optional, depends on the configuration of your identity provider (not required with WCS)
	},
	Headers: nil,
}
client, err := weaviate.NewClient(cfg)
if err != nil{
	fmt.Println(err)
}
```

#### <i class="fa-solid fa-key"></i> 客户端凭证流程

import ClientAuthFlowClientCredentials from '/developers/weaviate/client-libraries/_components/client.auth.flow.client.credentials.mdx'

<ClientAuthFlowClientCredentials />

```go
cfg := weaviate.Config{
	Host:   "weaviate.example.com",
	Scheme: "http",
	AuthConfig: auth.ClientCredentials{
		ClientSecret: "your_client_secret",
		Scopes:       []string{"scope1 scope2"}, // optional, depends on the configuration of your identity provider (not required with WCS)
	},
	Headers: nil,
}
client, err := weaviate.NewClient(cfg)
if err != nil{
	fmt.Println(err)
}
```

#### <i class="fa-solid fa-key"></i> 刷新令牌流程

import ClientAuthBearerToken from '/developers/weaviate/client-libraries/_components/client.auth.bearer.token.mdx'

<ClientAuthBearerToken />

```go
cfg := weaviate.Config{
	Host:   "weaviate.example.com",
	Scheme: "http",
	AuthConfig: auth.BearerToken{
		AccessToken:  "some token",
		RefreshToken: "other token",
		ExpiresIn:    uint(500), // in seconds
	},
	Headers: nil,
}
client, err := weaviate.NewClient(cfg)
if err != nil{
	fmt.Println(err)
}
```

## 自定义头部

您可以在初始化时向客户端传递自定义头部：

```go
cfg := weaviate.Config{
  Host:"weaviate.example.com",
  Scheme: "http",
  AuthConfig: nil,
  Headers: map[string]string{
    "header_key1": "value",
    "header_key2": "otherValue",
    },
}
client, err := weaviate.NewClient(cfg)
if err != nil{
  fmt.Println(err)
}
```

## 参考资料

所有[RESTful端点](../api/rest/index.md)和[GraphQL函数](../api/graphql/index.md)的参考都由Go客户端提供，并在这些参考页面的代码块中进行了解释。

## 设计

### 构建者模式

Go客户端函数采用了“构建器模式”。该模式用于构建复杂的查询对象。这意味着一个函数（例如，用于通过类似于RESTful GET请求的请求从Weaviate中检索数据，或者更复杂的GraphQL查询）是通过单个对象来构建的，以减少复杂性。一些构建器对象是可选的，而其他构建器对象则是执行特定功能的必需的。所有这些都在[RESTful API参考页面](../api/rest/index.md)和[GraphQL参考页面](../api/graphql/index.md)上进行了文档记录。

以上代码片段显示了一个类似于 `RESTful GET /v1/schema` 的简单查询。客户端通过引入包并连接到正在运行的实例来初始化。然后，通过使用 `.Getter()` 获取 `.Schema` 来构建查询。查询将使用 `.Go()` 函数发送，因此对于您想要构建和执行的每个函数都需要该对象。

## 迁移指南

### 从 `v2` 到 `v4`

#### 从 `GraphQL.Get()` 中删除不必要的 `.Objects()`

之前：

```go
client.GraphQL().Get().Objects().WithClassName...
```

之后：

```go
client.GraphQL().Get().WithClassName
```

#### GraphQL的`Get().WithNearVector()`使用了建造者模式

在`v2`中，将`nearVector`参数传递给`client.GraphQL().Get()`需要传递一个字符串。结果用户必须了解GraphQL API的结构。`v4`通过使用建造者模式来解决这个问题，如下所示：

之前的方式：

```go
client.GraphQL().Get().
  WithNearVector("{vector: [0.1, -0.2, 0.3]}")...
```

之后

```go
nearVector := client.GraphQL().NearVectorArgBuilder().
  WithVector([]float32{0.1, -0.2, 0.3})

client.GraphQL().Get().
  WithNearVector(nearVector)...
```


#### 所有 `where` 过滤器使用相同的构建器

在 `v2` 中，过滤器有时作为字符串指定，有时以结构化方式指定。`v4` 统一了这一点，并确保您始终可以使用相同的构建器模式。

##### GraphQL 获取

之前：

```go
// using filter encoded as string
where := `where :{
  operator: Equal
  path: ["id"]
  valueText: "5b6a08ba-1d46-43aa-89cc-8b070790c6f2"
}`

client.GraphQL().Get().
  Objects().
  WithWhere(where)...
```

```go
// using deprecated graphql arg builder
where := client.GraphQL().WhereArgBuilder().
  WithOperator(graphql.Equal).
  WithPath([]string{"id"}).
  WithValueString("5b6a08ba-1d46-43aa-89cc-8b070790c6f2")

client.GraphQL().Get().
  Objects().
  WithWhere(where)...
```

之后:

```go
where := filters.Where().
  WithPath([]string{"id"}).
  WithOperator(filters.Equal).
  WithValueString("5b6a08ba-1d46-43aa-89cc-8b070790c6f2")

client.GraphQL().Get().
  WithWhere(where)...
```

##### GraphQL 聚合

之前：

```go
where := client.GraphQL().WhereArgBuilder().
  WithPath([]string{"id"}).
  WithOperator(graphql.Equal).
  WithValueString("5b6a08ba-1d46-43aa-89cc-8b070790c6f2")

client.GraphQL().Aggregate().
  Objects().
  WithWhere(where)...
```

之后:

```go
where := filters.Where().
  WithPath([]string{"id"}).
  WithOperator(filters.Equal).
  WithValueString("5b6a08ba-1d46-43aa-89cc-8b070790c6f2")

client.GraphQL().Aggregate().
  WithWhere(where)...
```

##### 分类

之前:

```go
valueInt := 100
valueText  := "Government"

sourceWhere := &models.WhereFilter{
  ValueInt: &valueInt,
  Operator: string(graphql.GreaterThan),
  Path:     []string{"wordCount"},
}

targetWhere := &models.WhereFilter{
  ValueString: &valueText,
  Operator:    string(graphql.NotEqual),
  Path:        []string{"name"},
}

client.Classifications().Scheduler().
  WithSourceWhereFilter(sourceWhere).
  WithTargetWhereFilter(targetWhere)...
```

之后：

```go
sourceWhere := filters.Where().
  WithOperator(filters.GreaterThan).
  WithPath([]string{"wordCount"}).
  WithValueInt(100)

targetWhere := filters.Where().
  WithOperator(filters.NotEqual).
  WithPath([]string{"name"}).
  WithValueString("Government")

client.Classifications().Scheduler().
  WithSourceWhereFilter(sourceWhere).
  WithTargetWhereFilter(targetWhere)...
```

#### GraphQL `Get().WithFields()`

在 `v2` 版本中，`.WithFields()` 接受一个需要了解 GraphQL 字段结构的 GraphQL 字符串。现在可以使用可变参数函数来实现。例如：

之前的写法：

```go
client.GraphQL.Get().WithClassName("MyClass").WithFields("name price age")...
```

之后：

```go
client.GraphQL.Get().WithClassName("MyClass").
  WithFields(graphql.Field{Name: "name"},graphql.Field{Name: "price"}, graphql.Field{Name: "age"})...
```

#### Graphql `Get().WithGroup()`

在 `v2` 版本中，`.WithFields()` 接受一个需要了解 GraphQL 字段结构的 GraphQL 字符串。现在可以使用构建器来完成。例如：

之前的写法：

```go
client.GraphQL.Get().WithClassName("MyClass")
  .WithGroup("{type:merge force:1.0}")
```

之后：

```go
group := client.GraphQL().GroupArgBuilder()
  .WithType(graphql.Merge).WithForce(1.0)

client.GraphQL.Get().WithClassName("MyClass").WithGroup(group)
```

#### Graphql `Data().Validator()` 属性已重命名

在 `v2` 版本中，指定 Schema 的方法命名与客户端的其他地方不一致。在 `v4` 版本中已经修复了这个问题。根据以下方式进行重命名：

之前：
```go
client.Data().Validator().WithSchema(properties)
```

之后:
```go
client.Data().Validator().WithProperties(properties)
```


## 更新日志

请查看GitHub上的[更新日志](https://github.com/weaviate/weaviate-go-client/releases)以获取最新`Go客户端`的更改。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />