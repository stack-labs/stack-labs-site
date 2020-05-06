---
order: 19
title: 安装指导
---

## Go Micro

Go Micro 是基于 Go 语言用于开发的微服务的 RPC 框架，它是 Micro 的基础。

### 安装 Go Micro

```
go get github.com/micro/go-micro
```

### Protobuf

安装**protoc-gen-micro**，用于生成 Protobuf 的代码。

- [protoc-gen-micro](https://github.com/micro/protoc-gen-micro)

## Toolkit 工具集

micro 工具集可以辅助操作微服务

### 安装工具集

```
go get github.com/micro/micro
```

### 使用 Docker 安装

可以通过 docker 镜像来安装

```
docker pull micro/micro
```

### 测试 CLI

安装完后可以启动问候（Greeter，用于测试）程序：

```shell
go get github.com/micro/examples/greeter/srv && srv
```

查看服务列表

```shell
$ micro list services
go.micro.srv.greeter
```

查看指定服务信息

```shell
$ micro get service go.micro.srv.greeter
service  go.micro.srv.greeter

version 1.0.0

Id	Address	Port	Metadata
go.micro.srv.greeter-34c55534-368b-11e6-b732-68a86d0d36b6	192.168.1.66	62525	server=rpc,registry=consul,transport=http,broker=http

Endpoint: Say.Hello
Metadata: stream=false

Request: {
	name string
}

Response: {
	msg string
}
```

服务调用

```shell
$ micro call go.micro.srv.greeter Say.Hello '{"name": "John"}'
{
	"msg": "Hello John"
}
```

查看更多信息 [github.com/micro/micro](https://github.com/micro/micro)
