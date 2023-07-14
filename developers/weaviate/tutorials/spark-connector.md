---
image: og/docs/tutorials.jpg
sidebar_position: 80
title: Load data into Weaviate with Spark
---

import Badges from '/_includes/badges.mdx';

<Badges/>

## 概述

本教程旨在向您展示如何使用[Spark Connector](https://github.com/weaviate/spark-connector)从Spark导入数据到Weaviate。

通过本教程的学习，您将学会如何将数据导入到[Apache Spark](https://spark.apache.org/)中，并使用Spark Connector将数据写入Weaviate。

## 安装

我们建议在继续阅读本教程之前，先阅读[快速上手教程](../quickstart/index.md)。

我们将安装Python的`weaviate-client`库，并在本地运行Spark，因此需要安装Python的`pyspark`包。请在终端中使用以下命令获取这两个包：
```bash
pip3 install pyspark weaviate-client
```

为了演示目的，本教程在本地运行Spark。请参阅Apache Spark文档或咨询您的云环境，以安装和部署Spark集群，并选择除Python之外的语言运行时。

我们还需要Weaviate Spark连接器。您可以通过在终端中运行以下命令来下载它:

```bash
curl https://github.com/weaviate/spark-connector/releases/download/v||site.spark_connector_version||/spark-connector-assembly-||site.spark_connector_version||.jar --output spark-connector-assembly-||site.spark_connector_version||.jar
```

对于本教程，您还需要在`http://localhost:8080`上运行一个Weaviate实例。该实例不需要安装任何模块，可以通过按照[快速入门教程](../quickstart/index.md)进行设置。

您还需要安装Java 8+和Scala 2.12。您可以单独设置它们，或者更方便的方法是安装[IntelliJ](https://www.jetbrains.com/idea/)，以同时设置这两个。

## 什么是Spark连接器？

Spark连接器使您能够轻松将Spark数据结构中的数据写入Weaviate。当与Spark提取、转换、加载（ETL）过程一起使用时，这非常有用，可以用来填充Weaviate向量数据库。

Spark连接器能够根据Weaviate中的类的模式自动推断出正确的Spark数据类型。在将数据写入Weaviate时，您可以选择将其向量化，或者如果已经有向量可用，则可以提供它们。默认情况下，Weaviate客户端会为新文档创建文档ID，但如果您已经有ID，也可以在数据帧中提供它们。所有这些都可以作为Spark连接器中的选项进行指定。

## 初始化Spark会话

下面的代码将使用上述提到的库创建一个Spark会话。

```python
from pyspark.sql import SparkSession
import os

spark = (
    SparkSession.builder.config(
        "spark.jars",
        "spark-connector-assembly-||site.spark_connector_version||.jar",  #specify the spark connector JAR
    )
    .master("local[*]")
    .appName("weaviate")
    .getOrCreate()
)

spark.sparkContext.setLogLevel("WARN")
```

您现在应该已经创建了一个Spark Session，并且可以在`http://localhost:4040`上使用**Spark UI**查看它。

您还可以通过执行以下命令来验证本地Spark Session是否正在运行:

```python
spark
```

## 读取数据到Spark

在本教程中，我们将读取一个包含100,000行的Sphere数据集的子集到刚刚启动的Spark会话中。

您可以从[这里](https://storage.googleapis.com/sphere-demo/sphere.100k.jsonl.tar.gz)下载此数据集。下载完成后，请解压缩数据集。

以下代码可用于将数据集读取到您的Spark会话中：

```python
df = spark.read.load("sphere.100k.jsonl", format="json")
```

为了验证是否正确完成，我们可以查看前几条记录：

```python
df.limit(3).toPandas().head()
```

## 写入 Weaviate

:::tip
Prior to this step, make sure your Weaviate instance is running at `http://localhost:8080`. You can refer to the [Quickstart tutorial](../quickstart/index.md) for instructions on how to set that up.
:::

要快速启动一个Weaviate实例，您可以运行下面的代码行来获取一个Docker文件：

```bash
curl -o docker-compose.yml "https://configuration.weaviate.io/v2/docker-compose/docker-compose.yml?modules=standalone&runtime=docker-compose&weaviate_version=v||site.weaviate_version||"
```

一旦您拥有该文件，您可以使用以下命令启动 `docker-compose.yml`:
```bash
docker compose up -d
```

Spark连接器假设在Weaviate中已经创建了模式。因此，我们将使用Python客户端来创建此模式。有关如何创建模式的更多信息，请参阅此[教程](./schema.md)。

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

client.schema.delete_all()

client.schema.create_class(
    {
        "class": "Sphere",
        "properties": [
            {
                "name": "raw",
                "dataType": ["text"]
            },
            {
                "name": "sha",
                "dataType": ["text"]
            },
            {
                "name": "title",
                "dataType": ["text"]
            },
            {
                "name": "url",
                "dataType": ["text"]
            },
        ],
    }
)
```

接下来，我们将Spark DataFrame写入到Weaviate。`.limit(1500)`可以被移除以加载完整的数据集。

```python
df.limit(1500).withColumnRenamed("id", "uuid").write.format("io.weaviate.spark.Weaviate") \
    .option("batchSize", 200) \
    .option("scheme", "http") \
    .option("host", "localhost:8080") \
    .option("id", "uuid") \
    .option("className", "Sphere") \
    .option("vector", "vector") \
    .mode("append").save()
```

## Spark连接器选项

让我们来看一下上面的代码，以了解发生了什么以及Spark连接器的所有设置。

- 使用`.option("host", "localhost:8080")`，我们指定要写入的Weaviate实例

- 使用`.option("className", "Sphere")`，我们确保数据写入到刚刚创建的类中。

- 由于我们的数据框中已经有文档ID，我们可以通过使用`.withColumnRenamed("id", "uuid")`将存储文档ID的列重命名为`uuid`，然后使用`.option("id", "uuid")`传递给Weaviate。

- 使用`.option("vector", "vector")`，我们可以指定Weaviate使用存储在我们的数据框中名为`vector`的列中的向量，而不是重新进行向量化处理。

- 使用 `.option("batchSize", 200)` 我们可以指定在写入到 Weaviate 时如何对数据进行分批处理。除了批处理操作，还可以进行流处理。

- 使用 `.mode("append")` 我们指定写入模式为 `append`。目前仅支持追加写入模式。

现在我们已经将数据写入到 Weaviate，并且了解了 Spark 连接器及其设置的功能。作为最后一步，我们可以通过 Python 客户端查询数据，以确认数据已加载。

```python
client.query.get("Sphere", "title").do()
```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />