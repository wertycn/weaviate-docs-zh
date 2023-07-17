# weaviate 中文文档

本文档由AnthenaTranscript  基于ChatGPT 进行翻译

# 网站

此网站使用 [Docusaurus 2](https://docusaurus.io/) 构建，这是一款现代的静态网站生成器。

### 安装

```
$ yarn
```

### 本地开发

```
$ yarn start
```

这个命令会启动一个本地开发服务器并自动打开浏览器窗口。大多数改动都能实时反映，无需重启服务器。

### 构建

```
$ yarn build
```

此命令将静态内容生成到 `build` 目录，可以使用任何静态内容托管服务进行托管。

### 部署

使用 SSH:

```
$ USE_SSH=true yarn deploy
```

不使用 SSH:

```
$ GIT_USER=<你的GitHub用户名> yarn deploy
```

如果你使用 GitHub pages 进行托管，这个命令是一个方便的方式来构建网站并推送到 `gh-pages` 分支。
