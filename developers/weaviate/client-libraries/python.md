---
image: og/docs/client-libraries.jpg
sidebar_position: 1
title: Python
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::note Python client version
The current Python client version is `v||site.python_client_version||`
:::

## 安装和设置

Python库可在[PyPI.org](https://pypi.org/project/weaviate-client/)上获得。可以使用[pip](https://pypi.org/project/pip/)轻松安装该包。该客户端适用于Python 3.7及更高版本的开发和测试。

```bash
$ pip install weaviate-client
```

现在您可以在Python脚本中按照以下方式使用客户端：

```python
import weaviate

client = weaviate.Client("https://some-endpoint.weaviate.network")  # Replace the URL with that of your Weaviate instance

client.schema.get()  # Get the schema to test connection
```

或者，可以使用以下附加参数：

```python
import weaviate

client = weaviate.Client(
  url="https://some-endpoint.weaviate.network",  # URL of your Weaviate instance
  auth_client_secret=auth_config,  # (Optional) If the Weaviate instance requires authentication
  timeout_config=(5, 15),  # (Optional) Set connection timeout & read timeout time in seconds
  additional_headers={  # (Optional) Any additional headers; e.g. keys for API inference services
    "X-Cohere-Api-Key": "YOUR-COHERE-API-KEY",            # Replace with your Cohere key
    "X-HuggingFace-Api-Key": "YOUR-HUGGINGFACE-API-KEY",  # Replace with your Hugging Face key
    "X-OpenAI-Api-Key": "YOUR-OPENAI-API-KEY",            # Replace with your OpenAI key
  }
)

client.schema.get()  # Get the schema to test connection
```

## 身份验证

import ClientAuthIntro from '/developers/weaviate/client-libraries/_components/client.auth.introduction.mdx'

<ClientAuthIntro clientName="Python"/>

### WCS身份验证

import ClientAuthWCS from '/developers/weaviate/client-libraries/_components/client.auth.wcs.mdx'

<ClientAuthWCS />

### API密钥身份验证

:::info Available in Weaviate Python client versions `3.14.0` and higher.
:::

import ClientAuthApiKey from '/developers/weaviate/client-libraries/_components/client.auth.api.key.mdx'

<ClientAuthApiKey />

```python
import weaviate

auth_config = weaviate.AuthApiKey(api_key="YOUR-WEAVIATE-API-KEY")  # Replace w/ your Weaviate instance API key

# Instantiate the client with the auth config
client = weaviate.Client(
    url="https://some-endpoint.weaviate.network",  # Replace w/ your endpoint
    auth_client_secret=auth_config
)
```

### OIDC认证

import ClientAuthOIDCIntro from '/developers/weaviate/client-libraries/_components/client.auth.oidc.introduction.mdx'

<ClientAuthOIDCIntro />

#### <i class="fa-solid fa-key"></i> 资源所有者密码流程

import ClientAuthFlowResourceOwnerPassword from '/developers/weaviate/client-libraries/_components/client.auth.flow.resource.owner.password.mdx'

<ClientAuthFlowResourceOwnerPassword />

```python
import weaviate

resource_owner_config = weaviate.AuthClientPassword(
  username = "user",
  password = "pass",
  scope = "offline_access" # optional, depends on the configuration of your identity provider (not required with WCS)
  )

# Initiate the client with the auth config
client = weaviate.Client("http://localhost:8080", auth_client_secret=resource_owner_config)
```

#### <i class="fa-solid fa-key"></i> 客户端凭证流程

import ClientAuthFlowClientCredentials from '/developers/weaviate/client-libraries/_components/client.auth.flow.client.credentials.mdx'

<ClientAuthFlowClientCredentials />

```python
import weaviate

client_credentials_config = weaviate.AuthClientCredentials(
  client_secret = "client_secret",
  scope = "scope1 scope2" # optional, depends on the configuration of your identity provider (not required with WCS)
  )

# Initiate the client with the auth config
client = weaviate.Client("https://localhost:8080", auth_client_secret=client_credentials_config)
```

#### <i class="fa-solid fa-key"></i> 刷新令牌流程

import ClientAuthBearerToken from '/developers/weaviate/client-libraries/_components/client.auth.bearer.token.mdx'

<ClientAuthBearerToken />

```python
import weaviate

bearer_config = weaviate.AuthBearerToken(
  access_token="some token"
  expires_in=300 # in seconds, by default 60s
  refresh_token="other token" # Optional
)

# Initiate the client with the auth config
client = weaviate.Client("https://localhost:8080", auth_client_secret=bearer_config)
```

## 自定义头部

您可以在初始化时向客户端传递自定义头部，这些头部将被添加进去：

```python
client = weaviate.Client(
  url="https://localhost:8080",
  additional_headers={"HeaderKey": "HeaderValue"},
)
```

## 神经搜索框架

有许多神经搜索框架使用Weaviate作为底层存储、搜索和检索向量的工具。

- deepset的[haystack](https://www.deepset.ai/weaviate-vector-search-engine-integration)
- Jina的[DocArray](https://docarray.jina.ai/advanced/document-store/weaviate/)

# 参考文档

在这个Weaviate文档网站上，您将找到如何使用Python客户端来使用所有的[RESTful端点](../api/rest/index.md)和[GraphQL函数](../api/graphql/index.md)的方法。对于每个参考，都包含了一个代码块，其中包含了如何使用Python（和其他）客户端来使用该函数的示例。然而，Python客户端还具有其他功能，在[weaviate-python-client.readthedocs.io](https://weaviate-python-client.readthedocs.io/en/stable/)的完整客户端文档中进行了介绍。以下是其中一些额外的功能。

### 示例：client.schema.create(schema)
您可以使用Python客户端一次性以JSON格式上传完整的模式，而不是逐个添加类别使用RESTful的`v1/schema`端点。请按照以下方式使用函数`client.schema.create(schema)`：

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

schema = {
  "classes": [{
    "class": "Publication",
    "description": "A publication with an online source",
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "description": "Name of the publication",
        "name": "name"
      },
      {
        "dataType": [
          "Article"
        ],
        "description": "The articles this publication has",
        "name": "hasArticles"
      },
      {
        "dataType": [
            "geoCoordinates"
        ],
        "description": "Geo location of the HQ",
        "name": "headquartersGeoLocation"
      }
    ]
  }, {
    "class": "Article",
    "description": "A written text, for example a news article or blog post",
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "description": "Title of the article",
        "name": "title"
      },
      {
        "dataType": [
          "text"
        ],
        "description": "The content of the article",
        "name": "content"
      }
    ]
  }, {
    "class": "Author",
    "description": "The writer of an article",
    "properties": [
      {
        "dataType": [
            "text"
        ],
        "description": "Name of the author",
        "name": "name"
      },
      {
        "dataType": [
            "Article"
        ],
        "description": "Articles this author wrote",
        "name": "wroteArticles"
      },
      {
        "dataType": [
            "Publication"
        ],
        "description": "The publication this author writes for",
        "name": "writesFor"
      }
    ]
  }]
}

client.schema.create(schema)
```

#### 示例：如何开始使用Weaviate和Python客户端的博客文章

关于如何使用Weaviate的Python客户端的完整示例可以在[Towards Data Science](https://towardsdatascience.com/quickstart-with-weaviate-python-client-e85d14f19e4f)的文章中找到。

## 批处理

批处理是使用单个API请求批量导入/创建`objects`和`references`到Weaviate服务器的一种方法。在Python中，可以使用3种不同的方法来实现：

1. ***自动批处理***
2. ***动态批处理***
3. ***手动批处理***

### 多线程批量导入

:::info Available in Weaviate Python client versions `3.9.0` and higher.
:::

多线程批量导入适用于“自动批处理”和“动态批处理”。

要使用它，可以通过在批处理配置中设置参数`num_workers`来设置工作线程（线程）的数量，使用`.configure(...)`（与`. __call__(...)`相同）。详见下文的[批处理配置](#batch-configuration)。

:::warning
Multithreading is disabled by default (num_workers=1). Use with care to not overload your Weaviate instance.
:::

**示例**

```python
client.batch(  # or client.batch.configure(
  batch_size=100,
  dynamic=True,
  num_workers=4,
)
```

### 自动分批处理

该方法允许Python客户端处理所有的`object`和`reference`的导入/创建。这意味着您不需要显式地导入/创建对象和交叉引用。您只需要将您想要导入/创建的所有内容添加到`Batch`中，`Batch`将负责创建对象和它们之间的交叉引用。为了启用自动批处理，我们需要将`batch_size`配置为一个正整数（默认为`None`）（有关更多信息，请参阅下面的[批处理配置](#批处理配置)）。如果对象的数量+引用的数量等于`batch_size`，`Batch`将导入/创建对象，然后创建交叉引用。请参考以下示例：

```python
import weaviate
from weaviate.util import generate_uuid5
client = weaviate.Client("http://localhost:8080")

# create schema
schema = {
  "classes": [
    {
      "class": "Author",
      "properties": [
        {
          "name": "name",
          "dataType": ["text"]
        },
        {
          "name": "wroteBooks",
          "dataType": ["Book"]
        }
      ]
    },
    {
      "class": "Book",
      "properties": [
        {
          "name": "title",
          "dataType": ["text"]
        },
        {
          "name": "ofAuthor",
          "dataType": ["Author"]
        }
      ]
    }
  ]
}

client.schema.create(schema)

author = {
  "name": "Jane Doe",
}
book_1 = {
  "title": "Jane's Book 1"
}
book_2 = {
  "title": "Jane's Book 2"
}

client.batch.configure(
  batch_size=5, # int value for batch_size enables auto-batching, see Batch configuration section below
)

with client.batch as batch:
  # add author
  uuid_author = generate_uuid5(author, "Author")
  batch.add_data_object(
    data_object=author,
    class_name="Author",
    uuid=uuid_author,
  )
  # add book_1
  uuid_book_1 = generate_uuid5(book_1, "Book")
  batch.add_data_object(
    data_object=book_1,
    class_name="Book",
    uuid=uuid_book_1,
  )
  # add references author ---> book_1
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_1,
    to_object_class_name="Book",
  )
  # add references author <--- book_1
  batch.add_reference(
    from_object_uuid=uuid_book_1,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
  # add book_2
  uuid_book_2 = generate_uuid5(book_2, "Book")
  batch.add_data_object(
    data_object=book_2,
    class_name="Book",
    uuid=uuid_book_2,
  )
  # add references author ---> book_2
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_2,
    to_object_class_name="Book",
  )
  # add references author <--- book_2
  batch.add_reference(
    from_object_uuid=uuid_book_2,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )

# NOTE: When exiting context manager the method `batch.flush()` is called
# done, everything is imported/created
```

### 动态批处理

该方法允许Python客户端以动态方式处理所有对象和交叉引用的导入/创建。这意味着用户不需要显式地导入/创建对象和交叉引用（与[自动批处理](#auto-batching)相同）。要启用动态批处理，我们需要将`batch_size`配置为正整数（默认为`None`），并将`dynamic`设置为`True`（默认为`False）（有关更多信息，请参见下面的[批处理配置](#batch-configuration)）。对于该方法，`Batch`在第一次创建`Batch`之后将计算`recommended_num_objects`和`recommended_num_references`，其中`batch_size`用作`recommended_num_objects`和`recommended_num_references`的初始值。当当前对象数达到`recommended_num_objects`或当前引用数达到`recommended_num_references`时，`Batch`将导入/创建对象，然后导入/创建引用。请参见下面的示例：


```python
import weaviate
from weaviate.util import generate_uuid5
client = weaviate.Client("http://localhost:8080")

# create schema
schema = {
  "classes": [
    {
      "class": "Author",
      "properties": [
        {
          "name": "name",
          "dataType": ["text"]
        },
        {
          "name": "wroteBooks",
          "dataType": ["Book"]
        }
      ]
    },
    {
      "class": "Book",
      "properties": [
        {
          "name": "title",
          "dataType": ["text"]
        },
        {
          "name": "ofAuthor",
          "dataType": ["Author"]
        }
      ]
    }
  ]
}

client.schema.create(schema)

author = {
  "name": "Jane Doe",
}
book_1 = {
  "title": "Jane's Book 1"
}
book_2 = {
  "title": "Jane's Book 2"
}

client.batch.configure(
  batch_size=5, # int value for batch_size enables auto-batching, see Batch configuration section below
  dynamic=True, # makes it dynamic
)

with client.batch as batch:
  # add author
  uuid_author = generate_uuid5(author, "Author")
  batch.add_data_object(
    data_object=author,
    class_name="Author",
    uuid=uuid_author,
  )
  # add book_1
  uuid_book_1 = generate_uuid5(book_1, "Book")
  batch.add_data_object(
    data_object=book_1,
    class_name="Book",
    uuid=uuid_book_1,
  )
  # add references author ---> book_1
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_1,
    to_object_class_name="Book",
  )
  # add references author <--- book_1
  batch.add_reference(
    from_object_uuid=uuid_book_1,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
  # add book_2
  uuid_book_2 = generate_uuid5(book_2, "Book")
  batch.add_data_object(
    data_object=book_2,
    class_name="Book",
    uuid=uuid_book_2,
  )
  # add references author ---> book_2
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_2,
    to_object_class_name="Book",
  )
  # add references author <--- book_2
  batch.add_reference(
    from_object_uuid=uuid_book_2,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
# NOTE: When exiting context manager the method `batch.flush()` is called
# done, everything is imported/created
```

### 手动分批

此方法允许用户完全控制`Batch`，意味着`Batch`不会隐式执行任何导入/创建操作，而是由用户自行决定。请参见下面的示例：


```python
import weaviate
from weaviate.util import generate_uuid5
client = weaviate.Client("http://localhost:8080")

# create schema
schema = {
  "classes": [
    {
      "class": "Author",
      "properties": [
        {
          "name": "name",
          "dataType": ["text"]
        },
        {
          "name": "wroteBooks",
          "dataType": ["Book"]
        }
      ]
    },
    {
      "class": "Book",
      "properties": [
        {
          "name": "title",
          "dataType": ["text"]
        },
        {
          "name": "ofAuthor",
          "dataType": ["Author"]
        }
      ]
    }
  ]
}

client.schema.create(schema)

author = {
  "name": "Jane Doe",
}
book_1 = {
  "title": "Jane's Book 1"
}
book_2 = {
  "title": "Jane's Book 2"
}

client.batch.configure(
  batch_size=None, # None disable any automatic functionality
)

with client.batch as batch:
  # add author
  uuid_author = generate_uuid5(author, "Author")
  batch.add_data_object(
    data_object=author,
    class_name="Author",
    uuid=uuid_author,
  )
  # add book_1
  uuid_book_1 = generate_uuid5(book_1, "Book")
  batch.add_data_object(
    data_object=book_1,
    class_name="Book",
    uuid=uuid_book_1,
  )
  result = batch.create_objects()  # <----- implicit object creation

  # add references author ---> book_1
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_1,
    to_object_class_name="Book",
  )
  # add references author <--- book_1
  batch.add_reference(
    from_object_uuid=uuid_book_1,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
  result = batch.create_references()  # <----- implicit reference creation


  # add book_2
  uuid_book_2 = generate_uuid5(book_2, "Book")
  batch.add_data_object(
    data_object=book_2,
    class_name="Book",
    uuid=uuid_book_2,
  )
  result = batch.create_objects()  # <----- implicit object creation

  # add references author ---> book_2
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_2,
    to_object_class_name="Book",
  )
  # add references author <--- book_2
  batch.add_reference(
    from_object_uuid=uuid_book_2,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
  result = batch.create_references()  # <----- implicit reference creation

# NOTE: When exiting context manager the method `batch.flush()` is called
# done, everything is imported/created
```

### 批处理配置
`Batch`对象可以使用`batch.configure()`方法或`batch()`方法进行配置。它们是相同的函数。在上面的示例中，我们看到可以配置`batch_size`和`dynamic`参数。这里还有更多可用的参数：

- `batch_size` - (`int` 或 `None`：默认为 `None`）：如果是 `int`，则启用自动批处理。对于自动批处理，如果对象数量 + 引用数量等于 `batch_size`，则批次将导入/创建当前对象和引用（有关更多信息，请参见 [自动批处理](#auto-batching)）。对于动态批处理，它用作 `recommended_num_objects` 和 `recommended_num_references` 的初始值（有关更多信息，请参见 [动态批处理](#dynamic-batching)）。`None` 表示手动批处理-没有自动对象/引用的导入/创建。
- `dynamic` - (`bool`，默认值：`False`）：启用/禁用动态批处理。如果`batch_size`为`None`，则没有任何效果。
- `creation_time` - (`int` 或 `float`，默认值：`10`）：这是批量导入/创建应完成的时间间隔。它用于计算`recommended_num_objects`和`recommended_num_references`，因此对动态批处理有影响。
- `callback`（Optional[Callable[[dict], None]]，默认为`weaviate.util.check_batch_result`）：它是`batch.create_objects()`和`batch.create_references()`的结果的回调函数。它用于处理自动/动态批处理的错误。如果`batch_size`为`None`，则没有效果。
- `timeout_retries` - (`int`，默认为`3`）：在导入/创建批处理之前尝试的次数，如果超时，则导致`TimeoutError`。
- `connection_error_retries` - (`int`, 默认值 `3`): 在导入/创建批次失败出现`ConnectionError`之前的尝试次数。**注意：**仅在 `weaviate-client>=3.9.0` 版本中可用。
- `num_workers` - (`int`, 默认值 `1`): 并发运行批量导入的最大线程数。仅在非MANUAL批处理中使用，即仅与AUTO或DYNAMIC批处理一起使用。***请谨慎使用，以免超负荷你的 Weaviate 实例。*** **注意：**仅在 `weaviate-client>=3.9.0` 版本中可用。

注意：您必须在每次调用该方法时指定您想要的所有配置，否则某些设置将被默认值替换。
```python
client.batch(
  batch_size=100,
  dynamic=False,
  creation_time=5,
  timeout_retries=3,
  connection_error_retries=5,
  callback=None,
  num_workers=1,
)
```

### 技巧与诀窍

* 在提交/创建之前，可以向批量中添加任意多个对象/引用，没有限制。然而，过大的批量可能会导致超时错误，这意味着Weaviate无法在指定的时间内处理和创建批量中的所有对象（超时配置可以像[这样](https://weaviate-python-client.readthedocs.io/en/latest/weaviate.html#weaviate.Client)或[这样](https://weaviate-python-client.readthedocs.io/en/latest/weaviate.html#weaviate.Client.timeout_config)进行设置）。请注意，将超时配置设置为大于60秒将需要对docker-compose.yml/helm chart文件进行一些更改。
* Python客户端中的`batch`类可以以三种方式使用：
    * 情况1：一切由用户完成，即用户应添加对象/对象引用并在用户想要时创建它们。要创建其中一种数据类型，请使用此类的这些方法：`create_objects`、`create_references`和`flush`。此情况下，Batch实例的batch_size设置为None（请参阅`configure`或`__call__`方法的文档）。可以在上下文管理器中使用，见下文。
    * 情况2：当批次满时自动创建。可以通过将Batch实例的batch_size设置为正整数来实现（请参阅configure或__call__方法的文档）。在这种情况下，batch_size对应于已添加的对象和引用的总和。这种情况下不需要用户创建批次，但也可以创建。另外，要创建不满足自动创建要求的非满批次（最后的批次），可以使用flush方法。可以在上下文管理器中使用，见下文。
    * 案例3：与案例II类似，但使用动态批处理，即当其中一个达到`recommended_num_objects`或`recommended_num_references`时，自动创建对象或引用。有关如何启用它的详细信息，请参阅`configure`或`__call__`方法的文档。
    * **上下文管理器支持**：可以与with语句一起使用。当退出上下文管理器时，会自动调用flush方法。可以与`configure`或`__call__`方法结合使用，以设置为所需的Case。

### 错误处理

在`Batch`中创建对象比逐个创建每个对象/引用要更快，但这样做会跳过一些验证步骤。跳过对象/引用级别的某些验证步骤可能会导致一些无法创建的对象或无法添加的引用。在这种情况下，`Batch`不会失败，但是个别的对象/引用可能会失败，我们可以通过检查`batch.create_objects()`和`batch.create_references()`的返回值来确保所有内容都已经成功导入/创建且没有错误。以下是如何捕获和处理个别`Batch`对象/引用错误的示例。

让我们定义一个函数来检查并打印这些错误：
```python
def check_batch_result(results: dict):
  """
  Check batch results for errors.

  Parameters
  ----------
  results : dict
      The Weaviate batch creation return value.
  """

  if results is not None:
    for result in results:
      if "result" in result and "errors" in result["result"]:
        if "error" in result["result"]["errors"]:
          print(result["result"])
```

现在我们可以使用这个函数在项（对象/引用）级别打印错误消息。让我们看看如何在自动批处理和动态批处理中实现，其中我们从不显式地调用`create`方法：

```python
client.batch(
  batch_size=100,
  dynamic=True,
  creation_time=5,
  timeout_retries=3,
  connection_error_retries=3,
  callback=check_batch_result,
)

# done, easy as that
```

对于手动分批处理，我们可以在返回值上调用该函数：
```python
# on objects
result = client.batch.create_object()
check_batch_result(result)

# on references
result = client.batch.create_references()
check_batch_result(result)
```

## 设计

### GraphQL查询构建器模式

对于复杂的GraphQL查询（例如带有过滤器的查询），客户端使用构建器模式来构建查询。以下是一个带有多个过滤器的查询示例：

```python
import weaviate
client = weaviate.Client("http://localhost:8080")

where_filter = {
  "path": ["wordCount"],
  "operator": "GreaterThan",
  "valueInt": 1000
}

near_text_filter = {
  "concepts": ["fashion"],
  "certainty": 0.7,
  "moveAwayFrom": {
    "concepts": ["finance"],
    "force": 0.45
  },
  "moveTo": {
    "concepts": ["haute couture"],
    "force": 0.85
  }
}

query_result = client.query\
    .get("Article", ["title"])\
    .with_where(where_filter)\
    .with_near_text(near_text_filter)\
    .with_limit(50)\
    .do()

print(query_result)
```

请注意，您需要使用`.do()`方法来执行查询。

## 更新日志

请查看[Github上的更新日志](https://github.com/weaviate/weaviate-python-client/releases)或者[readthedocs](https://weaviate-python-client.readthedocs.io/en/stable/changelog.html)以获取最新的Python客户端变更信息。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />