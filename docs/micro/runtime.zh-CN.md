---
order: 28
title: Micro Runtime
---

Micro 是开发微服务的工具库

# 概览

Micro 重点工作服务方向是满足构建可伸缩的系统。Micro 包含了微服务的架构模式，并把它把转换成一系列构建平台的工具。Micro 深入复杂的分布式系统，且要把其简化抽象成众所周知的方式暴露给开发者使用。

技术本身是日新月异的。而那些基础的技术栈也总是会发生变动。Micro 工具插件化就是要处理这个问题。

Micro 的愿景是，在任何技术栈中都可插拔，使用 Micro 构建永不过时的系统。

## 特性

micro 工具库由以下几个部分组成：

- **API Gateway:** API 网关作为单一的 http 入口，它使用服务发现中查询的服务地址，把请求动态路由到具体服务。网关允许我们建立可伸缩的后台微服务架构，并且让工作在前端的公共 API 更健壮。Micro API 基于服务发现拥有强大的路由能力，它可以处理 http、gRPC、websocket、消息推送事件等等。

- **Interactive CLI:** 交互式的命令行接口。CLI 通过终端可以描述、查询、直接与平台和服务进行交互。CLI 提供所有的命令让开发者明白微服务正在处理的事情。CLI 也包含了交互模式。

- **Service Proxy:** 服务代理，基于[Go Micro](https://github.com/micro/go-micro)和[MUCP 协议](https://github.com/micro/protocol)构建的透明的代理服务。它将服务发现、负载均衡、消息编码、中间件、传输及代理插件卸载到单一位置。

可以单独运行或与服务一起运行。

- **Service Templates:** 服务生成模板，目的是快速生成服务代码，让编写代码飞起来。Micro 预置了一些模板用来编写服务。保持相同的方式编写服务，提高效率。

- **SlackOps Bot:** Slack 小机器人插件，当它运行中服务中时，这个插件允许开发者通过 Slack 消息来操作平台。MicroBot 插件提供聊天配置选项，这样就可以让团队通过向小机器人发送聊天消息来做一些我们希望它做的事，这里面当然也包含像动态发现服务一样创建 slack 命令。

- **Web Dashboard:** 通过 Web 管理控制台，可以直接在 Web 页面上查看服务的运行情况，展示端点信息，请求与响应状态，甚至直接向服务进行查询。管理控制台也有 CLI 交互页面提供给开发者在线上处理，就像直接操作终端一样。

## 开始使用

- [安装 Micro](#安装Micro)
- [依赖](#依赖)
- [服务发现](#服务发现)
- [编写服务](#编写服务)
- [示例](#示例)
- [相关插件](#相关插件)

## 安装 Micro

```shell
go get -u github.com/micro/micro
```

也可以通过 Docker 安装

```shell
docker pull micro/micro
```

## 依赖

micro 工具库有两个依赖：

- [Service Discovery](#service-discovery) - 用于服务名解析
- [Protobuf](#protobuf) - 代码生成工具

## 服务发现

服务发现用于服务名解析、路由、集中元数据。

Micro 使用[go-micro](https://github.com/micro/go-micro)来向服务发现中心发送注册请求。

### Consul

安装并运行 Consul

```shell
# install
brew install consul

# run
consul agent -dev
```

### mDNS

Micro 内置了 mDNS 组播系统，这是一种零依赖的服务注册发现机制，它是区别于有注册中心的替代方案。

通过在启动指令中传入`--registry=mdns` 或者在**环境变量**中设置`MICRO_REGISTRY=mdns`。

其实也可以不传，早期版本的 go-micro 默认注册中心是**consul**，现在换成了**mdns**

```shell
# 使用命令行参数
micro --registry=mdns list services

# 使用环境变量
MICRO_REGISTRY=mdns micro list services`
```

查看更多关于插件的资料：[go-plugins](https://github.com/micro/go-plugins).

## Protobuf

Protobuf 功能是代码生成，可以免去手写一些模板化的代码。

```
# 安装protobuf
brew install protobuf

# 安装golang的protobuf代码生成器 protoc-gen-go
go get -u github.com/golang/protobuf/{proto,protoc-gen-go}

# 安装micro的protobuf插件 protoc-gen-micro
go get -u github.com/micro/protoc-gen-micro
```

更多资料请查看[protoc-gen-micro](https://github.com/micro/protoc-gen-micro)。

## 编写服务

上面说过 Micro 是有模板生成功能可以快速生成服务应用。

详情可以翻阅：[**go-micro**](https://github.com/micro/go-micro).

### 使用模板生成

下面演示使用`micro new`命令来快速生成一个示例服务

生成的服务会被放到\$GOPATH 的相对目录下：

```
micro new github.com/micro/example
```

刚这个命令生成的目录如下所示：

```
example/
	Dockerfile	# A template docker file
	README.md	# A readme with command used
	handler/	# Example rpc handler
	main.go		# The main Go program
	proto/		# Protobuf directory
	subscriber/	# Example pubsub Subscriber
```

然后使用`protoc`把 proto 方便生成 go 源码

```
protoc --proto_path=. --micro_out=. --go_out=. proto/example/example.proto
```

下面就可以像运行其它 go 语言程序一下执行下面的命令了：

```
go run main.go
```

## 示例

刚我们通过`micro new`生成了命令并跑了起来，下面我们测一下。

- [列出所有服务](#list-services)
- [获取服务信息](#get-service)
- [调用服务](#call-service)
- [执行 API](#run-api)
- [调用 API](#call-api)

### 列出所有服务

通过服务发现注册的服务都可以被列出来

```shell
micro list services
```

相关服务：

```
consul
go.micro.srv.example
topic:topic.go.micro.srv.example
```

示例中的注册了的应用使用的限定了的注册名`go.micro.srv.example`，`go.micro.srv`是后台服务名的默认前缀

### 获取指定名的服务

每一个服务注册都是通过唯一的 id、地址及元数据。

```shell
micro get service go.micro.srv.example
```

输出的结果：

```
service  go.micro.srv.example

version latest

ID	Address	Port	Metadata
go.micro.srv.example-437d1277-303b-11e8-9be9-f40f242f6897	192.168.1.65	53545	transport=http,broker=http,server=rpc,registry=consul

Endpoint: Example.Call
Metadata: stream=false

Request: {
	name string
}

Response: {
	msg string
}


Endpoint: Example.PingPong
Metadata: stream=true

Request: {}

Response: {}


Endpoint: Example.Stream
Metadata: stream=true

Request: {}

Response: {}


Endpoint: Func
Metadata: subscriber=true,topic=topic.go.micro.srv.example

Request: {
	say string
}

Response: {}


Endpoint: Example.Handle
Metadata: subscriber=true,topic=topic.go.micro.srv.example

Request: {
	say string
}

Response: {}
```

### 调用服务

通过 CLI 命令行接口来调用 RPC 服务，这次查询我们使用 JSON 来发送：

```shell
micro call go.micro.srv.example Example.Call '{"name": "John"}'
```

输出的结果：

```
{
	"msg": "Hello John"
}
```

可以查看[cli 文档来查看](https://micro.mu/docs/cli.html)更多信息。

下面，我们试一下通过 HTTP 来调用服务。

### 执行 API

Micro API 本质上是一个 http 协议的网关接口，它会把动态路由到转到后台服务中。

```
MICRO_API_HANDLER=rpc \
MICRO_API_NAMESPACE=go.micro.srv \
micro api
```

说明信息：

- `MICRO_API_HANDLER` http API 的触发方法
- `MICRO_API_NAMESPACE` API 所属服务的命名空间 

### 调用 API

发送一个 POST 请求到 API：

```
curl -XPOST -H 'Content-Type: application/json' -d '{"name": "John"}' http://localhost:8080/example/call
```

结果：

```
{"msg":"Hello John"}
```

更多详情信息翻看[api doc](https://micro.mu/docs/api.html)。

## 相关插件

Micro 是基于[go-micro](https://github.com/micro/go-micro)来开发插件。

Go-micro 向分布式系统架构可抽离的基础部分提供抽象。

### 可插拔特性

下面列表出的 Micro 特性都是可插拔的：

- broker - 发布订阅消息的代理
- registry - 服务发现与注册
- selector - 客户端负载均衡
- transport - 传输，请求-响应或者双向流
- client - 管理以上特性的客户端
- server - 管理以上特性的服务端

Find plugins at [go-plugins](https://github.com/micro/go-plugins)

### 使用插件

插件的集成很简单，只需要创建个文件并引用这些插件即可。

```go
import (
	// etcd v3 registry
	_ "github.com/micro/go-plugins/registry/etcdv3"
	// nats transport
	_ "github.com/micro/go-plugins/transport/nats"
	// kafka broker
	_ "github.com/micro/go-plugins/broker/kafka"
)
```

### 构建二进制文件

直接使用 Go 命令行工具链即可。

```shell
# 本地打包
go build -i -o micro ./main.go ./plugins.go

# 打包成docker镜像
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w' -i -o micro ./main.go ./plugins.go
```

### 激活插件

引用插件后如果要激活，那么可以使用命令行或者设置环境变量即可。

```shell
# 命令行参数
micro --registry=etcdv3 --transport=nats --broker=kafka [其它命令]

# 环境变量
MICRO_REGISTRY=etcdv3 MICRO_TRANSPORT=nats MICRO_BROKER=kafka micro [其它命令]
```

{% include links.html %}
