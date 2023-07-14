---
image: og/docs/installation.jpg
sidebar_position: 3
title: Kubernetes
---

import Badges from '/_includes/badges.mdx';

<Badges/>

:::tip <b>Important</b> Set the correct Weaviate version
Make sure to set your desired Weaviate version.

This can be done through either explicitly setting it as part of the `values.yaml` or through overwriting the default as outlined in the [deployment step](#deploy-install-the-helm-chart) below.
:::

## 需求

* 一个最新版本的 Kubernetes 集群（例如，>=1.23）。
* 集群需要通过 `PersistentVolumeClaims` 来创建 `PersistentVolumes`。不需要特殊的文件系统，任何支持 `ReadWriteOnce` 访问模式的默认文件系统都足够。
* Helm（只有 v3 版本与 Helm 版本 `"v||site.helm_version||"` 兼容）

## Weaviate Helm chart

要在您的 Kubernetes 集群上获取和安装 Weaviate chart，请按照以下步骤进行操作：

### 验证工具设置和集群访问

```bash
# Check if helm is installed
$ helm version
# Make sure `kubectl` is configured correctly and you can access the cluster.
# For example, try listing the pods in the currently configured namespace.
$ kubectl get pods
```

### 获取Helm Chart

添加包含Weaviate Helm Chart的Weaviate Helm仓库

```bash
helm repo add weaviate https://weaviate.github.io/weaviate-helm
```

从Weaviate Helm Chart获取默认的`values.yaml`配置文件：
```bash
helm show values weaviate/weaviate > values.yaml
```

### 修改 values.yaml（根据需要）

:::note You do not *need* to modify values.yaml
You can skip this step and run with all default values.

But, if you do not modify the defaults in `values.yaml`, make sure to set the appropriate Weaviate version at the deployment step.
:::

在 [`values.yaml`](https://github.com/weaviate/weaviate-helm/blob/master/weaviate/values.yaml) 文件中，您可以根据您的设置调整配置。该yaml文件有详细的文档，以帮助您将配置与您的设置对齐。

默认情况下，配置文件设置为：

- 1个Weaviate副本。（目前无法更改，[请参见下文](#limitations)）
- 启用并运行1个`text2vec-contextionary`模块的副本。
  （这可以根据预期的负载进行调整）。
- 其他模块，如`text2vec-transformers`，`qna-transformers`或`img2vec-neural`默认禁用。可以通过将相应的`enabled`标志设置为`true`来启用它们。

请参阅示例`values.yaml`中的资源请求和限制。您可以根据预期的负载和集群上可用的资源进行调整。

#### 身份验证和授权

下面是一个身份验证的配置示例。

```yaml
authentication:
  apikey:
    enabled: true
    allowed_keys:
      - readonly-key
      - secr3tk3y
    users:
      - readonly@example.com
      - admin@example.com
  anonymous_access:
    enabled: false
  oidc:
    enabled: true
    issuer: https://auth.wcs.api.weaviate.io/auth/realms/SeMI
    username_claim: email
    groups_claim: groups
    client_id: wcs
authorization:
  admin_list:
    enabled: true
    users:
      - someuser@weaviate.io
      - admin@example.com
    readonly_users:
      - readonly@example.com
```

在这个示例中，`readonly-key`密钥将将用户身份验证为`readonly@example.com`，而`secr3tk3y`将将用户身份验证为`admin@example.com`。

OIDC身份验证也已启用，并且WCS作为令牌签发者/身份提供者。因此，具有WCS帐户的用户可以进行身份验证。此配置将`someuser@weaviate.io`设置为管理员用户，因此如果`someuser@weaviate.io`进行身份验证，他们将获得完全的（读取和写入）权限。

有关身份验证和授权配置的进一步通用文档，请参阅：
- [身份验证](../configuration/authentication.md)
- [授权](../configuration/authorization.md)

### 部署（安装Helm图表）

您可以按照以下步骤部署Helm图表：

```bash
# Create a Weaviate namespace
$ kubectl create namespace weaviate

# Deploy
$ helm upgrade --install \
  "weaviate" \
  weaviate/weaviate \
  --namespace "weaviate" \
  --values ./values.yaml
```

上述假设您有权限创建新的命名空间。如果您只有命名空间级别的权限，您可以跳过创建新的命名空间，并根据预先配置的命名空间名称调整`helm upgrade`的命名空间参数。

可选地，您可以提供`--create-namespace`参数，如果不存在，它将创建命名空间。

### 在初始部署后更新安装

上述命令（`helm upgrade...`）是幂等的，您可以再次运行它，例如在调整所需配置后。

## 其他配置帮助

- [在部署在 GCP 上的 Weaviate k8s 设置时，无法列出 API 组中的资源“configmaps”](https://stackoverflow.com/questions/58501558/cannot-list-resource-configmaps-in-api-group-when-deploying-weaviate-k8s-setup)
- [错误：升级失败：禁止使用configmaps](https://stackoverflow.com/questions/58501558/cannot-list-resource-configmaps-in-api-group-when-deploying-weaviate-k8s-setup)

### 使用EFS和Weaviate

在某些情况下，您可能希望或需要在Weaviate中使用EFS（Amazon Elastic File System）。对于AWS Fargate的情况，我们注意到您必须手动创建[PV（持久卷）](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)，因为PVC不会为您创建PV。

要在Weaviate中使用EFS，您需要执行以下操作：

- 创建一个EFS文件系统。
- 为每个Weaviate副本创建一个EFS访问点。
    - 所有的访问点必须有不同的根目录，以便Pod之间不共享数据，否则会失败。
- 为Weaviate部署的每个子网创建EFS挂载目标。
- 在Kubernetes中使用EFS创建StorageClass。
- 创建Weaviate卷，每个卷的VolumeHandle都有一个不同的访问点（如上所述）。
- 部署Weaviate。

以下是`weaviate-0` Pod的PV示例:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: weaviate-0
spec:
  capacity:
    storage: 8Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: "efs-sc"
  csi:
    driver: efs.csi.aws.com
    volumeHandle: <FileSystemId>::<AccessPointId-for-weaviate-0-Pod>
  claimRef:
    namespace: <namespace where Weaviate is/going to be deployed>
    name: weaviate-data-weaviate-0
```

有关在Fargate上运行EFS的更多一般信息，我们建议阅读[这篇AWS博客](https://aws.amazon.com/blogs/containers/running-stateful-workloads-with-amazon-eks-on-aws-fargate-using-amazon-efs/)。

## 故障排除

- 如果您看到 `No private IP address found, and explicit IP not provided`，请将Pod子网设置为以下有效IP地址范围之一：

    ```
    10.0.0.0/8
    100.64.0.0/10
    172.16.0.0/12
    192.168.0.0/16
    198.19.0.0/16
    ```

## 更多资源

import DocsMoreResources from '/_includes/more-resources-docs.md';

<DocsMoreResources />