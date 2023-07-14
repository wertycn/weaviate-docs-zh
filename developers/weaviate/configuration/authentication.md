---
image: og/docs/configuration.jpg
sidebar_position: 30
title: Authentication
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

:::info Using Kubernetes?
See [this page](../installation/kubernetes.md#authentication-and-authorization) for how to set up `values.yaml` for authentication & authorization.
:::

Weaviate提供了可选的身份验证方案，使用API密钥和OpenID Connect（OIDC），可以启用各种[授权](authorization.md)级别。

当身份验证被禁用时，所有匿名请求都将被授予访问权限。

在本文档中，我们涵盖了您方便起见的所有场景：
- [配置Weaviate和客户端以使用API密钥](#api-key)
- [配置Weaviate和客户端以使用OIDC](#oidc---a-systems-perspective)
- [配置 Weaviate 进行匿名访问](#anonymous-access)

请注意，API 密钥和 OIDC 认证可以同时启用。

:::tip We recommend starting with the API key
For most use cases, the API key option offers a balance between security and ease of use. Give it a try first, unless you have specific requirements that necessitate a different approach.
:::

## WCS身份验证

Weaviate云服务（WCS）实例预先配置了API密钥和OIDC身份验证选项，为您提供了即开即用的无缝体验。

请参阅[WCS文档](../../wcs/guides/authentication.mdx)中的说明，了解如何在此设置中以用户身份进行身份验证。

## API密钥

:::info Available in Weaviate versions `1.18` and higher
:::

要为基于API密钥的身份验证设置Weaviate，将以下环境变量添加到相应的Weaviate配置文件中（例如，`docker-compose.yml`）：

```yaml
services:
  weaviate:
    ...
    environment:
      ...
      # Enables API key authentication.
      AUTHENTICATION_APIKEY_ENABLED: 'true'

      # List one or more keys, separated by commas. Each key corresponds to a specific user identity below.
      AUTHENTICATION_APIKEY_ALLOWED_KEYS: 'jane-secret-key,ian-secret-key'

      # List one or more user identities, separated by commas. Each identity corresponds to a specific key above.
      AUTHENTICATION_APIKEY_USERS: 'jane@doe.com,ian-smith'
```

使用此配置，以下基于API密钥的身份验证规则适用：

API密钥`jane-secret-key`与`jane@doe.com`身份关联。
API密钥`ian-secret-key`与`ian-smith`身份关联。

:::info `n` APIKEY_ALLOWED_KEYS vs `n` APIKEY_USERS
There are two options for configuring the number of keys and users:
- Option 1: There is exactly one user specified and any number of keys (all keys will end up using the same user).
- Option 2: The lengths match, then key `n` will map to user `n`.
:::

这些用户的权限将由 [授权](./authorization.md) 设置确定。以下是一个示例配置。

```yaml
services:
  weaviate:
    ...
    environment:
      ...
      AUTHORIZATION_ADMINLIST_ENABLED: 'true'
      AUTHORIZATION_ADMINLIST_USERS: 'jane@doe.com,john@doe.com'
      AUTHORIZATION_ADMINLIST_READONLY_USERS: 'ian-smith,roberta@doe.com'
```

此配置将`jane@doe.com`和`john@doe.com`指定为具有读写权限的管理员用户，而`ian-smith`和`roberta@doe.com`则只有只读权限。

在这种情况下，`jane-secret-key`是管理员（读写）密钥，而`ian-secret-key`是只读密钥。

:::note What about the other identities?
You might notice that the authorization list includes `john@doe.com` and `roberta@doe.com`. Weaviate supports a combination of API key and OIDC-based authentication. Thus, the additional users might be OIDC users.
:::

### API密钥：客户端使用

要使用API密钥对Weaviate进行身份验证，每个请求都必须在标头中包含它，如下所示：`Authorization: Bearer API_KEY`，其中`API_KEY`是Weaviate实例的特定API密钥。

例如，您可以使用如下所示的CURL命令：

```bash
curl https://some-endpoint.weaviate.network/v1/meta -H "Authorization: Bearer YOUR-WEAVIATE-API-KEY" | jq
```

如果使用Weaviate客户端库，请点击相关链接查看[Python](../client-libraries/python.md#api-key-authentication)，[TypeScript](../client-libraries/typescript.mdx#api-key-authentication)，[Java](../client-libraries/java.md#api-key-authentication)或[Go](../client-libraries/go.md#api-key-authentication)的客户端特定指令。

## OIDC - 系统角度

OIDC身份验证涉及三个参与方。

1. **用户**：希望访问资源的用户。
1. **身份提供者（也称为令牌颁发者）**（例如Okta、Microsoft或WCS），用于对用户进行身份验证并发放令牌。
2. **资源**（在本例中为Weaviate），用于验证令牌以依赖于身份提供者的身份验证。

例如，一个设置可能涉及到将Weaviate实例作为资源、Weaviate云服务(WCS)作为身份提供者，以及代表用户行事的Weaviate客户端。本文档试图从每个方面提供一些视角，以帮助您在身份验证方面使用Weaviate。

<details>
  <summary>
    关于OIDC的更多信息
  </summary>

使用[OpenID Connect](https://openid.net/connect/)（基于OAuth2），一个身份提供者可以向Weaviate客户端发出身份验证请求，并返回一个身份令牌以表示用户的身份。这个身份令牌可以用来验证用户的身份，并且还可以向Weaviate实例提供授权访问的权限。
外部身份提供者和令牌签发者（以下简称为“令牌签发者”）负责管理用户。

OIDC（开放ID连接）身份验证要求从令牌签发者获取有效的令牌，以便在发送给Weaviate的任何请求的头部中携带。这适用于REST和GraphQL请求。

当Weaviate接收到一个令牌（JSON Web Token或JWT）时，它会验证该令牌确实是由配置的令牌签发者签名的。如果签名是有效的，它会继续验证令牌的其他属性和有效期。
正确，令牌的所有内容都是可信的，基于令牌中的信息对用户进行身份验证。

</details>

## OIDC - 配置 Weaviate 作为资源

:::tip
This applies to anyone who is running their own Weaviate instance.
:::

### 要求和默认值

任何实现 OpenID Connect Discovery 的“OpenID Connect”兼容令牌发行者都可以与 Weaviate 一起使用。配置 OIDC 令牌发行者超出了本文档的范围，但以下是一些起点选项：

- 对于简单的用例，例如单个用户，您可以使用 Weaviate Cloud Services (WCS) 作为 OIDC 令牌发行者。操作步骤如下：
    - 确保您拥有 WCS 帐户（您可以[在此处注册](https://console.weaviate.cloud/)）。
    - 在 Weaviate 配置文件（例如 `docker-compose.yaml`）中指定：
      - `https://auth.wcs.api.weaviate.io/auth/realms/SeMI` 作为发行者（在 `AUTHENTICATION_OIDC_ISSUER` 中），
      - `wcs` 作为客户端 ID（在 `AUTHENTICATION_OIDC_CLIENT_ID` 中），以及
      - 启用管理员列表（`AUTHORIZATION_ADMINLIST_ENABLED: 'true'`）并将您的 WCS 账户电子邮件添加为用户（在 `AUTHORIZATION_ADMINLIST_USERS` 中）。
      - `email` 作为用户名声明（在 `AUTHENTICATION_OIDC_USERNAME_CLAIM` 中）。

- 如果您需要更自定义的设置，可以使用商业OIDC提供商，如[Okta](https://www.okta.com/)。
- 另一种选择是运行自己的OIDC令牌发行服务器，这可能是最复杂但也是可配置的解决方案。流行的开源解决方案包括基于Java的[Keycloak](https://www.keycloak.org/)和基于Golang的[dex](https://github.com/dexidp/dex)。

:::info
By default, Weaviate will validate that the token includes a specified client id in the audience claim. If your token issuer does not support this feature, you can turn it off as outlined in the configuration section below.
:::

### 设置配置选项

要使用OpenID Connect（OIDC），必须在Weaviate的配置yaml中正确配置**相应的环境变量**。

:::info
As of November 2022, we were aware of some differences in Microsoft Azure's OIDC implementation compared to others. If you are using Azure and experiencing difficulties, [this external blog post](https://xsreality.medium.com/making-azure-ad-oidc-compliant-5734b70c43ff) may be useful.
:::

以下是与OIDC相关的Docker Compose环境变量。有关各字段的详细信息，请参阅内联的YAML注释：

```yaml
services:
  weaviate:
    ...
    environment:
      ...
      # enabled (optional - defaults to false) turns OIDC auth on. All other fields in
      # this section will only be validated if enabled is set to true.
      AUTHENTICATION_OIDC_ENABLED: 'true'

      # issuer (required) tells weaviate how to discover the token issuer. This
      # endpoint must implement the OpenID Connect Discovery spec, so that weaviate
      # can retrieve the issuer's public key.
      #
      # The example URL below uses the path structure commonly found with keycloak
      # where an example realm 'my-weaviate-usecase' was created. The exact
      # path structure will depend on the token issuer of your choice. Please
      # see the respective documentation of your issuer about which endpoint
      # implements OIDC Discovery.
      AUTHENTICATION_OIDC_ISSUER: 'http://my-token-issuer/auth/realms/my-weaviate-usecase'

      # client_id (required unless skip_client_id_check is set to true) tells
      # Weaviate to check for a particular OAuth 2.0 client_id in the audience claim.
      # This is to prevent that a token which was signed by the correct issuer
      # but never intended to be used with Weaviate can be used for authentication.
      #
      # For more information on what clients are in OAuth 2.0, see
      # https://tools.ietf.org/html/rfc6749#section-1.1
      AUTHENTICATION_OIDC_CLIENT_ID: 'my-weaviate-client'

      # username_claim (required) tells Weaviate which claim in the token to use for extracting
      # the username. The username will be passed to the authorization plugin.
      AUTHENTICATION_OIDC_USERNAME_CLAIM: 'email'

      # skip_client_id_check (optional, defaults to false) skips the client_id
      # validation in the audience claim as outlined in the section above.
      # Not recommended to set this option as it reduces security, only set this
      # if your token issuer is unable to provide a correct audience claim
      AUTHENTICATION_OIDC_SKIP_CLIENT_ID_CHECK: 'false'

      # scope (optional) these will be used by clients as default scopes for authentication
      AUTHENTICATION_OIDC_SCOPES: ''
```

#### Weaviate OpenID 终端点

如果您已启用身份验证，您可以从以下终端点获取Weaviate的OIDC配置：

```bash
$ curl [WEAVIATE URL]/v1/.well-known/openid-configuration
```

## OIDC - 客户端视角

OIDC标准允许使用多种不同的方法（流程）来获取令牌。适当的方法可能因您的情况而异，包括令牌发行者的配置和您的要求。

虽然我们的文档范围无法涵盖所有的OIDC身份验证流程，但是一些可能的选项包括：
1. 使用`客户端凭据流`进行机器到机器的授权。（请注意，这将授权一个应用程序，而不是特定的用户。）
   - 使用Okta和Azure作为身份提供商进行验证；GCP不支持客户端凭据授权流（截至2022年12月）。
   - Weaviate的Python客户端直接支持此方法。
    - 客户端凭据流通常不带有刷新令牌，并且凭据保存在相应的客户端中，以在旧令牌过期时获取新的访问令牌。
1. 对于受信任的应用程序（例如由[Weaviate云服务](../../wcs/guides/authentication.mdx)使用），请使用“资源所有者密码流”。
2. 如果Azure是您的令牌发行者，或者您希望防止密码泄露，请使用“混合流”。

### Weaviate客户端的OIDC支持

Python、JavaScript、Go和Java Weaviate客户端的最新版本(从2022年12月中旬开始)支持OIDC身份验证。如果Weaviate设置为使用`客户端凭据授权`流或`资源所有者密码授权`流，相应的Weaviate客户端可以实例化与Weaviate的连接，其中包含身份验证流程。

请参考每个客户端的[客户端库文档](../client-libraries/index.md)获取代码示例。

### 手动获取和传递令牌

<details>
  <summary>
    手动获取和传递令牌
  </summary>

对于您可能希望手动获取令牌的情况或工作流程，我们在下面概述了使用资源所有者密码流程和混合流程进行此操作的步骤。

#### 资源所有者密码流程

1. 发送GET请求到`[WEAVIATE_URL]/v1/.well-known/openid-configuration`以获取Weaviate的OIDC配置(`wv_oidc_config`)
1. 解析 `wv_oidc_config` 中的 `clientId` 和 `href`
2. 发送一个 GET 请求到 `href`，获取令牌发行者的 OIDC 配置 (`token_oidc_config`)
3. 如果 `token_oidc_config` 包含可选的 `grant_types_supported` 键，则检查 `password` 是否在值的列表中。
    - 如果 `password` 不在值的列表中，则令牌发行者可能未配置 `资源所有者密码流`。您可能需要重新配置令牌发行者或使用其他方法。
    - 如果`grant_types_supported`键不存在，则可能需要联系令牌发行方，了解是否支持`resource owner password flow`。
1. 发送POST请求到`token_oidc_config`的`token_endpoint`，请求体为：
    - `{"grant_type": "password", "client_id": client_id, "username": [USERNAME], "password": [PASSWORD]}`。
    - 其中`[USERNAME]`和`[PASSWORD]`需要替换为实际的值。
1. 解析响应(`token_resp`)，并在`token_resp`中查找`access_token`。这是您的Bearer令牌。

#### 混合流程

1. 发送GET请求到`[WEAVIATE_URL]/v1/.well-known/openid-configuration`，以获取Weaviate的OIDC配置(`wv_oidc_config`)。
2. 从`wv_oidc_config`中解析`clientId`和`href`。
3. 发送GET请求到`href`，以获取令牌发行者的OIDC配置(`token_oidc_config`)。
4. 根据 `token_oidc_config` 中的 `authorization_endpoint`，使用以下参数构建一个 URL (`auth_url`)。它的格式如下：
   - `{authorization_endpoint}`?client_id=`{clientId}`&response_type=code%20id_token&response_mode=fragment&redirect_url=`{redirect_url}`&scope=openid&nonce=abcd
   - `redirect_url` 必须已经在您的令牌发行者中进行了[预注册](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest)。
5. 在浏览器中访问`auth_url`，如果提示登录，请登录。如果成功，令牌发行者将重定向浏览器到`redirect_url`，附带包含`id_token`参数的其他参数。
6. 解析`id_token`参数的值。这是您的Bearer令牌。

#### 代码示例

对于希望手动获取OIDC令牌的人，我们在下面提供了一个用Python演示如何获取OIDC令牌的示例代码。

```python
import requests
import re

url = "http://localhost:8080"  # <-- Replace with your actual Weaviate URL

# Get Weaviate's OIDC configuration
weaviate_open_id_config = requests.get(url + "/v1/.well-known/openid-configuration")
if weaviate_open_id_config.status_code == "404":
    print("Your Weaviate instance is not configured with openid")

response_json = weaviate_open_id_config.json()
client_id = response_json["clientId"]
href = response_json["href"]

# Get the token issuer's OIDC configuration
response_auth = requests.get(href)

if "grant_types_supported" in response_auth.json():
    # For resource owner password flow
    assert "password" in response_auth.json()["grant_types_supported"]

    username = "username"  # <-- Replace with the actual username
    password = "password"  # <-- Replace with the actual password

    # Construct the POST request to send to 'token_endpoint'
    auth_body = {
        "grant_type": "password",
        "client_id": client_id,
        "username": username,
        "password": password,
    }
    response_post = requests.post(response_auth.json()["token_endpoint"], auth_body)
    print("Your access_token is:")
    print(response_post.json()["access_token"])
else:
    # For hybrid flow
    authorization_url = response_auth.json()["authorization_endpoint"]
    parameters = {
        "client_id": client_id,
        "response_type": "code%20id_token",
        "response_mode": "fragment",
        "redirect_url": url,
        "scope": "openid",
        "nonce": "abcd",
    }
    # Construct 'auth_url'
    parameter_string = "&".join([key + "=" + item for key, item in parameters.items()])
    response_auth = requests.get(authorization_url + "?" + parameter_string)

    print("Please visit the following url with your browser to login:")
    print(authorization_url + "?" + parameter_string)
    print(
        "After the login you will be redirected, the token is the 'id_token' parameter of the redirection url."
    )

    # You could use this regular expression to parse the token
    resp_txt = "Redirection URL"
    token = re.search("(?<=id_token=).+(?=&)", resp_txt)[0]

print("Set as bearer token in the clients to access Weaviate.")
```

#### 令牌生命周期

令牌具有可配置的过期时间，由令牌发行者设置。我们建议在过期之前建立一个工作流程，定期获取新的令牌。

</details>

### 将Bearer添加到请求中

一旦您获得了令牌，将其附加到所有发送给Weaviate的请求头中，格式如下：`Authorization: Bearer TOKEN`，其中`TOKEN`是您的实际令牌。

例如，您可以使用如下的CURL命令：

```bash
# List objects using a Bearer token
$ curl http://localhost:8080/v1/objects -H "Authorization: Bearer TOKEN"
```

如果使用Weaviate客户端库，请点击相关链接获取有关如何在该客户端中附加令牌的说明：[Python](../client-libraries/python.md#authentication)，[TypeScript/JavaScript](/developers/weaviate/client-libraries/typescript.mdx#authentication)，[Java](../client-libraries/java.md#authentication)或[Go](../client-libraries/go.md#authentication)。

## 匿名访问
默认情况下，Weaviate配置为接受没有任何认证的请求。
身份验证标头或参数。发送此类请求的用户将作为“user: anonymous”进行身份验证。

您可以使用授权插件来指定要应用于匿名用户的权限。当完全禁用匿名访问时，任何没有允许的身份验证方案的请求都将返回 `401 未经授权`。

### 配置
可以在配置的 YAML 文件中启用或禁用匿名访问，使用下面显示的环境变量。

```yaml
services:
  weaviate:
    ...
    environment:
      ...
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
```

### 如何使用

向Weaviate发送REST请求，无需任何额外的身份验证标头或参数。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />
