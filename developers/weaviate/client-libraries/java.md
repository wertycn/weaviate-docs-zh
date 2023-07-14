---
image: og/docs/client-libraries.jpg
sidebar_position: 5
title: Java
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::note Java client version
The current Java client version is `v||site.java_client_version||`.
:::

:::info Breaking changes introduced in v4
The `package` and `import` paths have been updated from `technology.semi.weaviate` to `io.weaviate`.

See the [Migration Guide](#from-3xx-to-400) for more info.
:::

## 安装和设置

要获取最新稳定版本的Java客户端库，请将此依赖项添加到您的项目中：

```xml
<dependency>
  <groupId>io.weaviate</groupId>
  <artifactId>client</artifactId>
  <version>4.0.0</version>  <!-- Check latest version -->
</dependency>
```

该 API 客户端兼容 Java 8 及以上版本。

您可以按照以下方式在项目中使用该客户端：

```java
package io.weaviate;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.misc.model.Meta;

public class App {
  public static void main(String[] args) {
    Config config = new Config("http", "localhost:8080");
    WeaviateClient client = new WeaviateClient(config);
    Result<Meta> meta = client.misc().metaGetter().run();
    if (meta.getError() == null) {
      System.out.printf("meta.hostname: %s\n", meta.getResult().getHostname());
      System.out.printf("meta.version: %s\n", meta.getResult().getVersion());
      System.out.printf("meta.modules: %s\n", meta.getResult().getModules());
    } else {
      System.out.printf("Error: %s\n", meta.getError().getMessages());
    }
  }
}
```

## 认证

import ClientAuthIntro from '/developers/weaviate/client-libraries/_components/client.auth.introduction.mdx'

<ClientAuthIntro clientName="Java"/>

### WCS认证

import ClientAuthWCS from '/developers/weaviate/client-libraries/_components/client.auth.wcs.mdx'

<ClientAuthWCS />

### API密钥认证

:::info Available in Weaviate Java client versions `4.0.2` and higher.
:::

import ClientAuthApiKey from '/developers/weaviate/client-libraries/_components/client.auth.api.key.mdx'

<ClientAuthApiKey />

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;

Config config = new Config("https", "some-endpoint.weaviate.network");
WeaviateClient client = WeaviateAuthClient.apiKey(config, "YOUR-WEAVIATE-API-KEY");  // Replace w/ your Weaviate instance API key
```

### OIDC身份验证

import ClientAuthOIDCIntro from '/developers/weaviate/client-libraries/_components/client.auth.oidc.introduction.mdx'

<ClientAuthOIDCIntro />

#### <i class="fa-solid fa-key"></i> 资源所有者密码流程

import ClientAuthFlowResourceOwnerPassword from '/developers/weaviate/client-libraries/_components/client.auth.flow.resource.owner.password.mdx'

<ClientAuthFlowResourceOwnerPassword />

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;

Config config = new Config("http", "weaviate.example.com:8080");
WeaviateAuthClient.clientPassword(
    config,
    "Your user",
    "Your password",
    Arrays.asList("scope1", "scope2") // optional, depends on the configuration of your identity provider (not required with WCS)
);
```

#### <i class="fa-solid fa-key"></i> 客户端凭证流程

import ClientAuthFlowClientCredentials from '/developers/weaviate/client-libraries/_components/client.auth.flow.client.credentials.mdx'

<ClientAuthFlowClientCredentials />

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;

Config config = new Config("http", "weaviate.example.com:8080");
WeaviateAuthClient.clientCredentials(
    config,
    "your_client_secret",
    Arrays.asList("scope1" ,"scope2") // optional, depends on the configuration of your identity provider
);
```

#### <i class="fa-solid fa-key"></i> 刷新令牌流程

import ClientAuthBearerToken from '/developers/weaviate/client-libraries/_components/client.auth.bearer.token.mdx'

<ClientAuthBearerToken />

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;

Config config = new Config("http", "weaviate.example.com:8080");
WeaviateAuthClient.bearerToken(
    config,
    "Your_access_token",
    500,  // lifetime in seconds
    "Your_refresh_token",
);
```

## 自定义标头

您可以在初始化时向客户端传递自定义标头，这些标头将被添加到请求中:

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;

public class App {
  public static void main(String[] args) {
    Map<String, String> headers = new HashMap<String, String>() { {
      put("header_key", "value");
    } };
    Config config = new Config("http", "localhost:8080", headers);
    WeaviateClient client = new WeaviateClient(config);
  }
}
```

## 参考文档

所有由Java客户端覆盖并在参考页面的代码块中解释的[RESTful端点](../api/rest/index.md)和[GraphQL函数](../api/graphql/index.md)的参考文档。

## 设计

### 构建器模式

Java客户端函数采用了“Builder模式”进行设计。这种模式用于构建复杂的查询对象。这意味着一个函数（例如，用于从Weaviate检索数据的请求，类似于RESTful的GET请求，或者更复杂的GraphQL查询）是由单个对象构建的，以减少复杂性。一些构建对象是可选的，而其他构建对象则是执行特定功能所必需的。所有这些都在[RESTful API参考页面](../api/rest/index.md)和[GraphQL参考页面](../api/graphql/index.md)中进行了文档化。

上面的代码片段显示了一个类似于`RESTful GET /v1/meta`的简单查询。客户端通过引入包并连接到运行中的实例来初始化。然后，使用`.misc()`上的`.metaGetter()`构建查询。查询将使用`.run()`函数发送，因此对于您想要构建和执行的每个函数，都需要这个对象。

## 迁移指南

### 从`3.x.x`到`4.0.0`

#### 从`technology.semi.weaviate`迁移到`io.weaviate`包

之前:
```java
package technology.semi.weaviate;
import technology.semi.weaviate.client.*;
```

后续步骤:
```java
package io.weaviate;
import io.weaviate.client.*;
```

### 从 `2.4.0` 到 `3.0.0`

#### 移除了 `@Deprecated` 方法 `Aggregate::withFields(Fields fields)`

之前的代码示例：
```java
// import io.weaviate.client.v1.graphql.query.fields.Field;
// import io.weaviate.client.v1.graphql.query.fields.Fields;

Fields fields = Fields.builder().fields(new Field[]{name, description}).build();
client.graphQL().aggregate().withFields(fields)...
```

之后：
```java
client.graphQL().aggregate().withFields(name, description)...
```

#### 已移除的 @Deprecated 方法 `Get::withFields(Fields fields)`

之前：
```java
// import io.weaviate.client.v1.graphql.query.fields.Field;
// import io.weaviate.client.v1.graphql.query.fields.Fields;

Fields fields = Fields.builder().fields(new Field[]{name, description}).build();
client.graphQL().get().withFields(fields)...
```

之后：
```java
client.graphQL().get().withFields(name, description)...
```

#### 已移除的@Deprecated方法 `Get::withNearVector(Float[] vector)`

之前：
```java
client.graphQL().get().withNearVector(new Float[]{ 0f, 1f, 0.8f })...
```

After:（之后）
```java
// import io.weaviate.client.v1.graphql.query.argument.NearVectorArgument;

NearVectorArgument nearVector = NearVectorArgument.builder().vector(new Float[]{ 0f, 1f, 0.8f }).certainty(0.8f).build();
client.graphQL().get().withNearVector(nearVector)...
```

#### 所有的 `where` 过滤器使用相同的实现

通过 `batch delete` 功能，引入了统一的 `filters.WhereFilter` 实现，取代了 `classifications.WhereFilter`、`graphql.query.argument.WhereArgument` 和 `graphql.query.argument.WhereFilter`。

##### GraphQL

之前的写法：
```java
// import io.weaviate.client.v1.graphql.query.argument.GeoCoordinatesParameter;
// import io.weaviate.client.v1.graphql.query.argument.WhereArgument;
// import io.weaviate.client.v1.graphql.query.argument.WhereOperator;

GeoCoordinatesParameter geo = GeoCoordinatesParameter.builder()
    .latitude(50.51f)
    .longitude(0.11f)
    .maxDistance(3000f)
    .build();
WhereArgument where = WhereArgument.builder()
    .valueGeoRange(geo)
    .operator(WhereOperator.WithinGeoRange)
    .path(new String[]{ "add "})
    .build();

client.graphQL().aggregate().withWhere(where)...
```

之后:
```java
// import io.weaviate.client.v1.filters.Operator;
// import io.weaviate.client.v1.filters.WhereFilter;

WhereFilter where = WhereFilter.builder()
    .valueGeoRange(WhereFilter.GeoRange.builder()
        .geoCoordinates(WhereFilter.GeoCoordinates.builder()
            .latitude(50.51f)
            .longitude(0.11f)
            .build()
        )
        .distance(WhereFilter.GeoDistance.builder()
            .max(3000f)
            .build()
        )
        .build()
    )
    .operator(Operator.WithinGeoRange)
    .path(new String[]{ "add" })
    .build();

client.graphQL().aggregate().withWhere(where)...
```

之前:
```java
// import io.weaviate.client.v1.graphql.query.argument.WhereArgument;
// import io.weaviate.client.v1.graphql.query.argument.WhereOperator;

WhereArgument where = WhereArgument.builder()
    .valueText("txt")
    .operator(WhereOperator.Equal)
    .path(new String[]{ "add" })
    .build();

client.graphQL().aggregate().withWhere(where)...
```

之后:
```java
// import io.weaviate.client.v1.filters.Operator;
// import io.weaviate.client.v1.filters.WhereFilter;

WhereFilter where = WhereFilter.builder()
    .valueText("txt")
    .operator(Operator.Equal)
    .path(new String[]{ "add" })
    .build();

client.graphQL().aggregate().withWhere(where)...
```

之前:
```java
// import io.weaviate.client.v1.graphql.query.argument.WhereArgument;
// import io.weaviate.client.v1.graphql.query.argument.WhereFilter;
// import io.weaviate.client.v1.graphql.query.argument.WhereOperator;

WhereArgument where = WhereArgument.builder()
    .operands(new WhereFilter[]{
        WhereFilter.builder()
            .valueInt(10)
            .path(new String[]{ "wordCount" })
            .operator(WhereOperator.LessThanEqual)
            .build(),
        WhereFilter.builder()
            .valueText("word")
            .path(new String[]{ "word" })
            .operator(WhereOperator.LessThan)
            .build()
    })
    .operator(WhereOperator.And)
    .build();

client.graphQL().aggregate().withWhere(where)...
```

之后:
```java
// import io.weaviate.client.v1.filters.Operator;
// import io.weaviate.client.v1.filters.WhereFilter;

WhereFilter where = WhereFilter.builder()
    .operands(new WhereFilter[]{
        WhereFilter.builder()
            .valueInt(10)
            .path(new String[]{ "wordCount" })
            .operator(Operator.LessThanEqual)
            .build(),
        WhereFilter.builder()
            .valueText("word")
            .path(new String[]{ "word" })
            .operator(Operator.LessThan)
            .build(),
    })
    .operator(Operator.And)
    .build();

client.graphQL().aggregate().withWhere(where)...
```

##### 分类

之前：
```java
// import io.weaviate.client.v1.classifications.model.GeoCoordinates;
// import io.weaviate.client.v1.classifications.model.Operator;
// import io.weaviate.client.v1.classifications.model.WhereFilter;
// import io.weaviate.client.v1.classifications.model.WhereFilterGeoRange;
// import io.weaviate.client.v1.classifications.model.WhereFilterGeoRangeDistance;

WhereFilter where = WhereFilter.builder()
    .valueGeoRange(WhereFilterGeoRange.builder()
        .geoCoordinates(GeoCoordinates.builder()
            .latitude(50.51f)
            .longitude(0.11f)
            .build())
        .distance(WhereFilterGeoRangeDistance.builder()
            .max(3000d)
            .build())
        .build())
    .operator(Operator.WithinGeoRange)
    .path(new String[]{ "geo" })
    .build();

client.classifications().scheduler().withTrainingSetWhereFilter(where)...
```

之后：
```java
// import io.weaviate.client.v1.filters.Operator;
// import io.weaviate.client.v1.filters.WhereFilter;

WhereFilter where = WhereFilter.builder()
    .valueGeoRange(WhereFilter.GeoRange.builder()
        .geoCoordinates(WhereFilter.GeoCoordinates.builder()
            .latitude(50.51f)
            .longitude(0.11f)
            .build())
        .distance(WhereFilter.GeoDistance.builder()
            .max(3000f)
            .build())
        .build())
    .operator(Operator.WithinGeoRange)
    .path(new String[]{ "geo" })
    .build();

client.classifications().scheduler().withTrainingSetWhereFilter(where)...
```


## 更新日志


请查看[GitHub上的更新日志](https://github.com/weaviate/weaviate-java-client/releases)，了解最新`Java客户端`的变更信息。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />