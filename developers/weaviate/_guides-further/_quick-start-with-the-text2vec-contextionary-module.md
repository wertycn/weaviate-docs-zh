---
image: og/docs/further-guides.jpg
sidebar_position: 7
title: Text2Vec-Contextionary Quickstart
---

# **使用演示数据集运行 Weaviate**

您可以以许多不同的方式运行 Weaviate，从本地开发设置到大规模的 Kubernetes 环境或托管和管理的 Weaviate 集群。在本快速入门指南中，我们将使用 [Docker Compose](https://docs.docker.com/compose/) 设置，在您的本地机器上运行 Weaviate，并添加包含新闻出版物的演示数据集。

下面的 Docker Compose 文件包含 Weaviate 和数据集。

下载Docker Compose文件（请注意，Dockerfile已禁用GPU，即CUDA，这会显著影响导入和查询时间。如果您有一个可用的GPU（可以通过Docker访问），只需在[dockerfile](https://github.com/weaviate/weaviate-examples/blob/main/weaviate-transformers-newspublications/docker-compose-withgpu.yaml#L27)中将`ENABLE_CUDA`设置为`1`

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/weaviate/weaviate-examples/main/weaviate-transformers-newspublications/docker-compose-simple.yml
```

运行 Docker（可选：使用 `-d` 参数在后台运行 Docker）

```bash
docker-compose up
```

Weaviate将在以下地址上提供并预加载新闻文章演示数据集：

- `http://localhost:8080/v1`
- [通过控制台访问](https://console.weaviate.cloud)。

# **通过Weaviate控制台查询**

您可以通过[Weaviate控制台](https://console.weaviate.cloud)查询您的本地机器。在"Self-hosted Weaviate"输入框中，填写`http://localhost:8080/`（您将被重定向到客户端的"http"版本）。

# **通过RESTful API验证**

您将始终通过Weaviate的HTTP API接口使用它。该接口包含两个不同的接口：

- RESTful API，主要用于添加和操作数据。
- GraphQL API（也通过HTTP运行）用于查询数据。

我们将首先检查Weaviate是否正常运行，模式是否成功添加，以及数据是否可用。在下面的示例中，我们将向您展示如何通过命令行完成这些操作。

首先，我们想通过检查`/v1/meta`端点来确认Weaviate是否正常运行。

注意：请确保将`localhost:8080`替换为您的Weaviate位置，如果您的Weaviate在不同的端点或位置上运行。

```bash
curl -s http://localhost:8080/v1/meta
```

输出结果将类似于这样：

```json
{
    "hostname": "http://[::]:8080",
    "modules": {
        "text2vec-contextionary": {
            "version": "en0.16.0-v1.0.2",
            "wordCount": 818072
        }
    },
    "version": "{{ site.weaviate_version }}"
}
```

这将验证您的Weaviate是否正常运行。

接下来，我们想要检查新闻发布模式是否正确添加，您可以通过检查`/v1/schema`端点来完成。

```bash
curl -s http://localhost:8080/v1/schema
```

输出结果将类似于这样：

```json
{
    "classes": [
        {
            "class": "Publication",
            "description": "A publication with an online source",
            "invertedIndexConfig": {
                "cleanupIntervalSeconds": 60
            },
            "moduleConfig": {
                "text2vec-contextionary": {
                    "vectorizeClassName": false
                }
            },
            "properties": [
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "Name of the publication",
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "name"
                },
                {
                    "dataType": [
                        "geoCoordinates"
                    ],
                    "description": "Geo location of the HQ",
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "headquartersGeoLocation"
                },
                {
                    "dataType": [
                        "Article"
                    ],
                    "description": "The articles this publication has",
                    "name": "hasArticles"
                }
            ],
            "vectorIndexConfig": {
                "cleanupIntervalSeconds": 300,
                "maxConnections": 64,
                "efConstruction": 128,
                "vectorCacheMaxObjects": 500000
            },
            "vectorIndexType": "hnsw",
            "vectorizer": "text2vec-contextionary"
        },
        {
            "class": "Author",
            "description": "Normalised types",
            "invertedIndexConfig": {
                "cleanupIntervalSeconds": 60
            },
            "moduleConfig": {
                "text2vec-contextionary": {
                    "vectorizeClassName": true
                }
            },
            "properties": [
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "Name of the author",
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
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
            ],
            "vectorIndexConfig": {
                "cleanupIntervalSeconds": 300,
                "maxConnections": 64,
                "efConstruction": 128,
                "vectorCacheMaxObjects": 500000
            },
            "vectorIndexType": "hnsw",
            "vectorizer": "text2vec-contextionary"
        },
        {
            "class": "Article",
            "description": "Normalised types",
            "invertedIndexConfig": {
                "cleanupIntervalSeconds": 60
            },
            "moduleConfig": {
                "text2vec-contextionary": {
                    "vectorizeClassName": false
                }
            },
            "properties": [
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "title of the article",
                    "indexFilterable": true,
                    "indexSearchable": true,
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "title"
                },
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "url of the article",
                    "indexFilterable": false,
                    "indexSearchable": false,
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "url"
                },
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "summary of the article",
                    "indexInverted": true,
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "summary"
                },
                {
                    "dataType": [
                        "date"
                    ],
                    "description": "date of publication of the article",
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "publicationDate"
                },
                {
                    "dataType": [
                        "int"
                    ],
                    "description": "Words in this article",
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "wordCount"
                },
                {
                    "dataType": [
                        "boolean"
                    ],
                    "description": "whether the article is currently accessible through the url",
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "isAccessible"
                },
                {
                    "dataType": [
                        "Author",
                        "Publication"
                    ],
                    "description": "authors this article has",
                    "name": "hasAuthors"
                },
                {
                    "dataType": [
                        "Publication"
                    ],
                    "description": "publication this article is in",
                    "name": "inPublication"
                },
                {
                    "dataType": [
                        "Category"
                    ],
                    "description": "category this article is of",
                    "name": "ofCategory"
                }
            ],
            "vectorIndexConfig": {
                "cleanupIntervalSeconds": 300,
                "maxConnections": 64,
                "efConstruction": 128,
                "vectorCacheMaxObjects": 500000
            },
            "vectorIndexType": "hnsw",
            "vectorizer": "text2vec-contextionary"
        },
        {
            "class": "Category",
            "description": "Category an article is a type off",
            "invertedIndexConfig": {
                "cleanupIntervalSeconds": 60
            },
            "moduleConfig": {
                "text2vec-contextionary": {
                    "vectorizeClassName": false
                }
            },
            "properties": [
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "category name",
                    "indexInverted": true,
                    "moduleConfig": {
                        "text2vec-contextionary": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "name"
                }
            ],
            "vectorIndexConfig": {
                "cleanupIntervalSeconds": 300,
                "maxConnections": 64,
                "efConstruction": 128,
                "vectorCacheMaxObjects": 500000
            },
            "vectorIndexType": "hnsw",
            "vectorizer": "text2vec-contextionary"
        }
    ]
}
```

你应该能够识别出四个类：`Publication`（出版物）、`Author`（作者）、`Article`（文章）和`Category`（分类）。

最后，我们将通过`/v1/objects`端点验证所有数据是否添加正确。

```bash
curl -s http://localhost:8080/v1/objects
```

输出的结果将类似于以下内容：

```json
{
    "deprecations": null,
    "objects": [
        {
            "class": "Publication",
            "creationTimeUnix": 1618580853819,
            "id": "16476dca-59ce-395e-b896-050080120cd4",
            "properties": {
                "hasArticles": [
                    {
                        "beacon": "weaviate://localhost/8ab6ddcc-2569-362f-bf4c-13dfb568bc36",
                        "href": "/v1/objects/8ab6ddcc-2569-362f-bf4c-13dfb568bc36"
                    },
                    {
                        "beacon": "weaviate://localhost/c707d9bc-840f-3997-a09a-da6dba7d0e87",
                        "href": "/v1/objects/c707d9bc-840f-3997-a09a-da6dba7d0e87"
                    },
                    {
                        "beacon": "weaviate://localhost/8b7711f7-fa7b-3035-85c3-9080077b74ec",
                        "href": "/v1/objects/8b7711f7-fa7b-3035-85c3-9080077b74ec"
                    },
                    {
                        "beacon": "weaviate://localhost/da4b49da-05cb-3a99-a370-98cdf25a1a2d",
                        "href": "/v1/objects/da4b49da-05cb-3a99-a370-98cdf25a1a2d"
                    },
                    {
                        "beacon": "weaviate://localhost/fe00c26f-c849-3f8d-b4da-1886d6abb042",
                        "href": "/v1/objects/fe00c26f-c849-3f8d-b4da-1886d6abb042"
                    }
                ],
                "headquartersGeoLocation": {
                    "latitude": 40.75868,
                    "longitude": -73.98241
                },
                "name": "Fox News"
            },
            "vectorWeights": null
        },
        {
            "class": "Publication",
            "creationTimeUnix": 1618580853819,
            "id": "212e56a6-e535-3569-ad1b-2215526c1d9d",
            "properties": {
                "hasArticles": [
                    {
                        "beacon": "weaviate://localhost/5087f0f9-89b7-3eef-a4b1-780dcece62de",
                        "href": "/v1/objects/5087f0f9-89b7-3eef-a4b1-780dcece62de"
                    },
                    {
                        "beacon": "weaviate://localhost/d3242f60-d33c-38e5-9275-de89290e989e",
                        "href": "/v1/objects/d3242f60-d33c-38e5-9275-de89290e989e"
                    },
                    {
                        "beacon": "weaviate://localhost/faa08320-7efb-30d1-830f-a466355517f8",
                        "href": "/v1/objects/faa08320-7efb-30d1-830f-a466355517f8"
                    },
                    {
                        "beacon": "weaviate://localhost/8fad2d0a-84a3-3032-9458-e3676570175e",
                        "href": "/v1/objects/8fad2d0a-84a3-3032-9458-e3676570175e"
                    },
                    {
                        "beacon": "weaviate://localhost/68db4a30-b0a1-31f8-b524-9278e16b063e",
                        "href": "/v1/objects/68db4a30-b0a1-31f8-b524-9278e16b063e"
                    },
                    {
                        "beacon": "weaviate://localhost/dc71468c-3b80-3d6d-9962-008f242d3370",
                        "href": "/v1/objects/dc71468c-3b80-3d6d-9962-008f242d3370"
                    },
                    {
                        "beacon": "weaviate://localhost/5132fff9-4223-3a9e-b0a1-76acd33978b2",
                        "href": "/v1/objects/5132fff9-4223-3a9e-b0a1-76acd33978b2"
                    },
                    {
                        "beacon": "weaviate://localhost/afee005c-a472-35b7-a1d5-4736cfb3ca2f",
                        "href": "/v1/objects/afee005c-a472-35b7-a1d5-4736cfb3ca2f"
                    }
                ],
                "headquartersGeoLocation": {
                    "latitude": 37.78083,
                    "longitude": -122.39582
                },
                "name": "Wired"
            },
            "vectorWeights": null
        },
        {
            "class": "Publication",
            "creationTimeUnix": 1618580853818,
            "id": "32d5a368-ace8-3bb7-ade7-9f7ff03eddb6",
            "properties": {
                "headquartersGeoLocation": {
                    "latitude": 48.892902,
                    "longitude": 2.248013
                },
                "name": "The New York Times Company"
            },
            "vectorWeights": null
        },
        {
            "class": "Publication",
            "creationTimeUnix": 1618580853819,
            "id": "7abf5426-5048-31ce-9c0a-822c58b19b47",
            "properties": {
                "hasArticles": [
                    {
                        "beacon": "weaviate://localhost/56562b3f-ad48-3fc8-8554-e4fa5fcdacb3",
                        "href": "/v1/objects/56562b3f-ad48-3fc8-8554-e4fa5fcdacb3"
                    },
                    {
                        "beacon": "weaviate://localhost/373d28fb-1898-313a-893b-5bc77ba061f6",
                        "href": "/v1/objects/373d28fb-1898-313a-893b-5bc77ba061f6"
                    },
                    {
                        "beacon": "weaviate://localhost/cae6c853-4832-3f1a-9005-f762ee4c1a8d",
                        "href": "/v1/objects/cae6c853-4832-3f1a-9005-f762ee4c1a8d"
                    },
                    {
                        "beacon": "weaviate://localhost/5edbbe6d-e90d-3c50-a4d2-c2e279ef8777",
                        "href": "/v1/objects/5edbbe6d-e90d-3c50-a4d2-c2e279ef8777"
                    },
                    {
                        "beacon": "weaviate://localhost/d1a3cec1-e10a-3584-88ee-aef940382d1e",
                        "href": "/v1/objects/d1a3cec1-e10a-3584-88ee-aef940382d1e"
                    }
                ],
                "headquartersGeoLocation": {
                    "latitude": 44.990192,
                    "longitude": -93.27538
                },
                "name": "Game Informer"
            },
            "vectorWeights": null
        },
        {
            "class": "Publication",
            "creationTimeUnix": 1618580853820,
            "id": "7e9b9ffe-e645-302d-9d94-517670623b35",
            "properties": {
                "hasArticles": [
                    {
                        "beacon": "weaviate://localhost/2e219343-51ea-322d-a742-d2526c72ff21",
                        "href": "/v1/objects/2e219343-51ea-322d-a742-d2526c72ff21"
                    },
                    {
                        "beacon": "weaviate://localhost/9fe81111-6798-3717-88bf-ad01f4aa87c0",
                        "href": "/v1/objects/9fe81111-6798-3717-88bf-ad01f4aa87c0"
                    },
                    {
                        "beacon": "weaviate://localhost/783fd90c-7c88-3a41-8e3b-02a1fda13514",
                        "href": "/v1/objects/783fd90c-7c88-3a41-8e3b-02a1fda13514"
                    },
                    {
                        "beacon": "weaviate://localhost/cd11d7ea-2bfa-34f1-a911-d61132669cea",
                        "href": "/v1/objects/cd11d7ea-2bfa-34f1-a911-d61132669cea"
                    },
                    {
                        "beacon": "weaviate://localhost/8bb3168b-fcd0-3b0e-a9dc-6e2337203bd0",
                        "href": "/v1/objects/8bb3168b-fcd0-3b0e-a9dc-6e2337203bd0"
                    }
                ],
                "headquartersGeoLocation": {
                    "latitude": 40.71274,
                    "longitude": -74.01338
                },
                "name": "New Yorker"
            },
            "vectorWeights": null
        },
        {
            "class": "Publication",
            "creationTimeUnix": 1618580853819,
            "id": "8e14bddf-cd2e-3f5b-8fd5-6e34ee13999e",
            "properties": {
                "hasArticles": [
                    {
                        "beacon": "weaviate://localhost/d9576914-dbdf-3b3a-8b39-622fc50c814c",
                        "href": "/v1/objects/d9576914-dbdf-3b3a-8b39-622fc50c814c"
                    },
                    {
                        "beacon": "weaviate://localhost/34d0c506-4d5e-319e-987c-d922d8c38ccf",
                        "href": "/v1/objects/34d0c506-4d5e-319e-987c-d922d8c38ccf"
                    },
                    {
                        "beacon": "weaviate://localhost/2b9224cf-1385-3e30-9b3f-d714e16b4342",
                        "href": "/v1/objects/2b9224cf-1385-3e30-9b3f-d714e16b4342"
                    },
                    {
                        "beacon": "weaviate://localhost/3feb6775-6f1f-352f-bfd8-f30727ed114c",
                        "href": "/v1/objects/3feb6775-6f1f-352f-bfd8-f30727ed114c"
                    },
                    {
                        "beacon": "weaviate://localhost/3de643c4-2de1-3afa-97a7-e936d2a3222f",
                        "href": "/v1/objects/3de643c4-2de1-3afa-97a7-e936d2a3222f"
                    }
                ],
                "headquartersGeoLocation": {
                    "latitude": 40.75743,
                    "longitude": -73.982704
                },
                "name": "Wall Street Journal"
            },
            "vectorWeights": null
        },
        {
            "class": "Author",
            "creationTimeUnix": 1618580880397,
            "id": "0014e96d-5977-3ad5-969a-19242175dd1b",
            "properties": {
                "name": "Charles Duhig",
                "writesFor": [
                    {
                        "beacon": "weaviate://localhost/7e9b9ffe-e645-302d-9d94-517670623b35",
                        "href": "/v1/objects/7e9b9ffe-e645-302d-9d94-517670623b35"
                    }
                ],
                "wroteArticles": [
                    {
                        "beacon": "weaviate://localhost/5c648be7-de75-30ea-a666-82c640d5a9ee",
                        "href": "/v1/objects/5c648be7-de75-30ea-a666-82c640d5a9ee"
                    }
                ]
            },
            "vectorWeights": null
        },
        {
            "class": "Author",
            "creationTimeUnix": 1618580860888,
            "id": "0128a12c-6aba-33c5-a532-2d6e4cf74462",
            "properties": {
                "name": "Sarah Spelling",
                "writesFor": [
                    {
                        "beacon": "weaviate://localhost/ac884d35-ccb4-3937-81f8-8474a4d7a549",
                        "href": "/v1/objects/ac884d35-ccb4-3937-81f8-8474a4d7a549"
                    }
                ],
                "wroteArticles": [
                    {
                        "beacon": "weaviate://localhost/d97c1a45-2d6f-3e23-bb5a-e2a37b52237a",
                        "href": "/v1/objects/d97c1a45-2d6f-3e23-bb5a-e2a37b52237a"
                    }
                ]
            },
            "vectorWeights": null
        },
        {
            "class": "Author",
            "creationTimeUnix": 1618580870674,
            "id": "01710bc2-9726-3de8-91c8-c86506c698ed",
            "properties": {
                "name": "Poppy Noor",
                "writesFor": [
                    {
                        "beacon": "weaviate://localhost/c9a0e53b-93fe-38df-a6ea-4c8ff4501783",
                        "href": "/v1/objects/c9a0e53b-93fe-38df-a6ea-4c8ff4501783"
                    }
                ],
                "wroteArticles": [
                    {
                        "beacon": "weaviate://localhost/454072f5-5a3b-3a22-8fc8-0e2e2c4c76f8",
                        "href": "/v1/objects/454072f5-5a3b-3a22-8fc8-0e2e2c4c76f8"
                    }
                ]
            },
            "vectorWeights": null
        },
        {
            "class": "Author",
            "creationTimeUnix": 1618580900447,
            "id": "01df457f-b938-307d-8f87-3a7047c63b56",
            "properties": {
                "name": "Sue Halpern",
                "writesFor": [
                    {
                        "beacon": "weaviate://localhost/7e9b9ffe-e645-302d-9d94-517670623b35",
                        "href": "/v1/objects/7e9b9ffe-e645-302d-9d94-517670623b35"
                    }
                ],
                "wroteArticles": [
                    {
                        "beacon": "weaviate://localhost/71d65805-baa3-3257-b27b-74f928dd34f0",
                        "href": "/v1/objects/71d65805-baa3-3257-b27b-74f928dd34f0"
                    }
                ]
            },
            "vectorWeights": null
        },
        {
            "class": "Author",
            "creationTimeUnix": 1618580913342,
            "id": "02650661-1e4c-365d-8072-6f77bf278df7",
            "properties": {
                "name": "Amanda Holpuch",
                "writesFor": [
                    {
                        "beacon": "weaviate://localhost/c9a0e53b-93fe-38df-a6ea-4c8ff4501783",
                        "href": "/v1/objects/c9a0e53b-93fe-38df-a6ea-4c8ff4501783"
                    }
                ],
                "wroteArticles": [
                    {
                        "beacon": "weaviate://localhost/a69182f9-5d5d-34fc-8a3c-08d397af43c2",
                        "href": "/v1/objects/a69182f9-5d5d-34fc-8a3c-08d397af43c2"
                    }
                ]
            },
            "vectorWeights": null
        },
        {
            "class": "Author",
            "creationTimeUnix": 1618580896404,
            "id": "02a19f8b-97c4-34ca-ab12-328b472d9150",
            "properties": {
                "name": "Atul Gawande",
                "writesFor": [
                    {
                        "beacon": "weaviate://localhost/7e9b9ffe-e645-302d-9d94-517670623b35",
                        "href": "/v1/objects/7e9b9ffe-e645-302d-9d94-517670623b35"
                    }
                ],
                "wroteArticles": [
                    {
                        "beacon": "weaviate://localhost/d060f3ea-221c-3737-9691-337ada88cd46",
                        "href": "/v1/objects/d060f3ea-221c-3737-9691-337ada88cd46"
                    }
                ]
            },
            "vectorWeights": null
        }
    ],
    "totalResults": 25
}
```

# 使用GraphQL查询数据集

在查询Weaviate时，您将始终使用GraphQL API。Weaviate有一个公开可用的图形用户界面(GUI)，称为[控制台](https://console.weaviate.cloud)，您可以使用它进行查询。

### 访问控制台

前往[console.weaviate.cloud](https://console.weaviate.cloud)。登录并连接到您的Weaviate实例(例如，在`http://localhost:8080`上)，然后转到左侧菜单中的“查询”。

### 您的第一个查询

首先，让我们将所有新闻出版物取出。

```graphql
# GraphQL
{
  Get {
    Publication {
      name
    }
  }
}
```

您还可以查找与这些出版物相关的文章。

```graphql
# GraphQL
{
  Get {
    Publication {
      name
      hasArticles{
        ... on Article{
          title
        }
      }
    }
  }
}
```

您甚至可以深入了解，找出与这些出版物相关的作者。

```graphql
# GraphQL
{
  Get {
    Publication(limit: 3) {
      name
      hasArticles{
        ... on Article{
          title
          hasAuthors {
            ... on Author{
              name
            }
          }
        }
      }
    }
  }
}
```

在查询文章时，您还可以添加经典过滤器来缩小搜索范围。

```graphql
# GraphQL
{
  Get {
    Article(
      where:{
        operator: GreaterThanEqual
        path: ["wordCount"]
        valueInt: 1000
      }
      limit: 10
    ) {
      title
      summary
      wordCount
    }
  }
}
```

你想知道有多少篇文章、作者和出版物吗？这是您可以使用Aggregate{}函数找到的内容。

```graphql
# GraphQL
{
  Aggregate{
    Publication{
      meta{
        count
      }
    }
    Author{
      meta{
        count
      }
    }
    Article{
      meta{
        count
      }
      wordCount {
        count
        maximum
        mean
        median
        minimum
        mode
        sum
        type
      }
    }
  }
}
```

# 通过语义搜索进行探索

在Weaviate中，您还可以通过语义方式探索您的数据集。让我们搜索与金钱相关的文章。

```graphql
# GraphQL
{
  Get {
    Article(
      nearText: {
        concepts: ["money"]
      }
      limit: 10
    ) {
      title
      summary
    }
  }
}
```

您还可以组合使用筛选器！

```graphql
# GraphQL
{
  Get {
    Article(
      nearText: {
        concepts: ["rideSharing"]
      }
      where:{
        operator:And
        operands: [{
          operator: GreaterThan
          path: ["wordCount"]
          valueInt: 200
        }, {
          operator:Like
          path:["title"]
          valueText:"*tax*"
        }]
      }
      limit: 10
    ) {
      title
      summary
      wordCount
    }
  }
}
```

或者根据语义将类似的主题进行分组。看看如何合并出版物`国际纽约时报`、`纽约时报公司`和`纽约时报`。

提示：尝试调整force变量。

```graphql
# GraphQL
{
  Get {
    Publication(
      group: {
        type: merge
        force: 0.1
      }
    ) {
      name
    }
  }
}
```

# 自动分类

如果您运行以下查询，您可能会注意到文章没有被分类到任何类别中。

```graphql
# GraphQL
{
  Get {
    Article {
      title
      ofCategory {
        ... on Category {
          name
        }
      }
    }
  }
}
```

在这里，我们可以使用Weaviate的自动分类功能，让Weaviate决定将哪些类别附加到新闻出版物上。

为了实现这一点，我们将使用RESTful API。

```bash
curl http://localhost:8080/v1/classifications -X POST -H 'Content-type: application/json' -d \
'{
    "class": "Article",
    "type": "text2vec-contextionary-contextual",
    "basedOnProperties": [
        "summary"
    ],
    "classifyProperties": [
        "ofCategory"
    ]
}' | jq .
```

当Weaviate完成分类后，您可以重新运行之前的查询，查看Weaviate如何对所有文章进行分类。

```graphql
# GraphQL
{
  Get {
    Article {
      title
      ofCategory {
        ... on Category {
          name
        }
      }
    }
  }
}
```


通过使用RESTful API，您甚至可以获取与分类相关的统计信息。您可以在启动分类的查询的返回主体中找到`{CLASSIFICATION ID}`。

```bash
curl -k http://localhost:8080/v1/classifications/{CLASSIFICATION ID} | jq .
```

# 下一步

在本教程中，您学习了如何快速设置Weaviate以及如何使用语义搜索和分类。接下来，请查看以下内容：

- 查看如何使用您自己的[模式](../tutorials/schema.md)和[导入](../tutorials/how-to-import-data.md)来[启动Weaviate](/developers/weaviate/installation/index.md)。
- 了解有关 [身份验证](/developers/weaviate/configuration/authentication.md) 和 [授权](/developers/weaviate/configuration/authorization.md) 的更多信息。
- 安装其中一个 [客户端库](/developers/weaviate/client-libraries/index.md)，以便与 Weaviate API 进行平滑交互。
- 请参阅 [RESTful API 参考](/developers/weaviate/api/rest/index.md) 和 [GraphQL 参考](../api/graphql/index.md) 以了解与 Weaviate 的所有交互可能性。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />