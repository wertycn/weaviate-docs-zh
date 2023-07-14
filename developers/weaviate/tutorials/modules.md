---
image: og/docs/tutorials.jpg
sidebar_position: 90
title: Modules - an introduction
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

在本指南中，您将了解到模块在Weaviate中扮演的角色。

正如它们的名字所示，Weaviate模块是用于增强Weaviate功能的可选组件，例如将数据进行向量化或处理结果（例如问答）。模块名称的结构（`x2vec`）告诉您模块的功能。例如，`text2vec` 生成文本嵌入，`img2vec` 生成图像嵌入等。

## 检索器和向量化器

检索器和向量化器主要用于对数据进行向量化处理，包括对数据对象和查询进行向量化。例如，如果您使用`text2vec`模块，那么GraphQL过滤器[`nearText`](/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers.md#neartext)将可用。它会自动将您的查询向量化，并将其与存储在索引中的向量进行匹配。

您可以按以下方式为每个类别设置向量化处理：

```json
{
    "class": "SomeClass",
    "vectorizer": "text2vec-openai",
}
```

接下来，您需要告诉Weaviate您想要对什么进行向量化。仅仅是负载数据，还是您还想包括类名和属性名？

```json
{
    "class": "SomeClass",
    "vectorizer": "text2vec-openai",
    "moduleConfig": {
        "text2vec-openai": {
            "vectorizeClassName": true
        }
    },
    "properties": [
        {
            "moduleConfig": {
                "text2vec-openai": {
                    "vectorizePropertyName": false
                }
            }
        }
    ]
}
```

:::note
The reason you can index class names and property names is that they sometimes give semantic context. For example, a class _Product_ could have the property _name_. If you vectorize everything you get a vector for _Product_ with the _name_ _some product_. This only goes for `text2vec` modules.
:::

如果您不想对某个属性进行向量化，可以直接跳过它。

```json
{
    "class": "SomeClass",
    "vectorizer": "text2vec-openai",
    "moduleConfig": {
        "text2vec-openai": {
            "vectorizeClassName": true
        }
    },
    "properties": [
        {
            "moduleConfig": {
                "text2vec-openai": {
                    "vectorizePropertyName": false,
                    "skip": true
                }
            }
        }
    ]
}
```

## 示例

下面是一个完整的架构示例。

让我们来看一下`Article`类的定义。请在类和属性级别上查找`"moduleConfig"`条目。

您会发现类和属性名称没有被索引，但文章本身是被索引的。因此，如果您现在检索一篇单独的文章，您会知道该向量来自transformers模块。

```json
{
    "classes": [
        {
            "class": "Article",
            "description": "Normalised types",
            "invertedIndexConfig": {
                "bm25": {
                    "b": 0.75,
                    "k1": 1.2
                },
                "cleanupIntervalSeconds": 60,
                "stopwords": {
                    "additions": null,
                    "preset": "en",
                    "removals": null
                }
            },
            "moduleConfig": {
                "text2vec-transformers": {
                    "poolingStrategy": "masked_mean",
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
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "title",
                    "tokenization": "word"
                },
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "url of the article",
                    "indexFilterable": true,
                    "indexSearchable": true,
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "url",
                    "tokenization": "word"
                },
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "summary of the article",
                    "indexFilterable": true,
                    "indexSearchable": true,
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "summary",
                    "tokenization": "word"
                },
                {
                    "dataType": [
                        "date"
                    ],
                    "description": "date of publication of the article",
                    "moduleConfig": {
                        "text2vec-transformers": {
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
                        "text2vec-transformers": {
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
                        "text2vec-transformers": {
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
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "hasAuthors"
                },
                {
                    "dataType": [
                        "Publication"
                    ],
                    "description": "publication this article is in",
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "inPublication"
                },
                {
                    "dataType": [
                        "Category"
                    ],
                    "description": "category this article is of",
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "ofCategory"
                }
            ],
            "shardingConfig": {
                "virtualPerPhysical": 128,
                "desiredCount": 1,
                "actualCount": 1,
                "desiredVirtualCount": 128,
                "actualVirtualCount": 128,
                "key": "_id",
                "strategy": "hash",
                "function": "murmur3"
            },
            "vectorIndexConfig": {
                "skip": false,
                "cleanupIntervalSeconds": 300,
                "maxConnections": 64,
                "efConstruction": 128,
                "ef": -1,
                "dynamicEfMin": 100,
                "dynamicEfMax": 500,
                "dynamicEfFactor": 8,
                "vectorCacheMaxObjects": 2000000,
                "flatSearchCutoff": 40000,
                "distance": "cosine"
            },
            "vectorIndexType": "hnsw",
            "vectorizer": "text2vec-transformers"
        }
    ]
}
```

## 读取器和生成器

读取器和生成器用于在从数据库获取数据后对数据进行处理。问答系统是一个很好的例子。如果您设置了一个限制为10，那么这10个结果将会通过问答模块进行处理。

和检索器和向量化器一样，这些模块可以扩展GraphQL-API。问答模块是最好的示例。

```graphql
{
  Get {
    Article(
      # the ask filter is introduced through the QandA module
      ask: {
        question: "What was the monkey doing during Elon Musk's brain-chip startup release?"
      }
      limit: 1
    ) {
      _additional {
        # the answer properties extend the _additional filters
        answer {
          result
          certainty
        }
      }
    }
  }
}
```

## 总结

模块是Weaviate的插件，它们可以处理向量化（[检索器和矢量化器](#retrievers--vectorizers)）或通过新功能扩展核心（[读取器和生成器](#readers--generators)）。您不必使用它们，但可以使用。

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />