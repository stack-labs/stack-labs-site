---
order: 9
title: 常见问题
---

FAQ 章节包含了的常见问题，并作了一些解答。

## 什么是 Micro ？

Micro 是一个着眼于分布式系统开发的微服务生态系统。

- Micro 是[框架](https://github.com/micro/go-micro)
- Micro 也是[工具集](https://github.com/micro/micro)
- Micro 有[社区](http://slack.micro.mu/)
- Micro 还是一个[生态系统](https://micro.mu/explore/)

### Micro 是开源的

Micro 由开源的库与工具组成，旨在辅助微服务开发。

- **go-micro** - 基于 Go 语言的可插拔 RPC 微服务开发框架；包含服务发现、RPC 客户/服务端、广播/订阅机制等等。
- **go-plugins** - go-micro 的插件有 etcd、kubernetes、nats、rabbitmq、grpc 等等。
- **micro** - 微服务工具集包含传统的入口点（entry point）；API 网关、CLI、Slack Bot、代理及 Web UI。

还有其它相关的库和服务可以参考 [github.com/micro](https://github.com/micro)。

### 社区

我们使用 Slack 作为我的平台沟通工具，现在已经有 1600 多人加入：[http://slack.micro.mu](https://micro-services.slack.com/messages/CHE2CSDAB/)；

### 生态系统

Micro 跨过了单一组合开发的模式，她的开源工具与服务都是由社区贡献的。

相关的生态系统可以进右边的传送门查看：[micro.mu/explore/](https://micro.mu/explore/).

## 该从何入手

可以先从[go-micro](https://github.com/micro/go-micro)入手。 readme 文档里提供了一个 demo 微服务示例。

如果要了解更多的资源可以查阅[开始入门](https://micro.mu/docs/writing-a-go-service.html) ，或者签出[示例](https://github.com/micro/examples)源码。

可以通过[micro](https://github.com/micro/micro)工具集的 cli，web ui，slack，或者 api 网关（api gateway）来访问操控服务。

## micro 有哪些使用者

[相关用户](https://micro.mu/docs/users.html)页面列出了一些使用 micro 服务的公司（列表更新可能不会太及时）。

还有很多公司在使用我们的框架但是没有公开列出来，如果你们正在使用 micro，可以告诉我们，我们会列出来。

## 如何才能使用 micro

其实非常简单

1. 使用[go-micro](https://github.com/micro/go-micro)编写服务。
2. 使用[micro](https://github.com/micro/micro)工具集来访问这些服务。

你可以签出我们在 github 上的简易[Greeter](https://github.com/micro/examples/tree/master/greeter)示例。

## 除了 Consul，可以使用其它的注册中心吗

当然是可以的，服务的注册发现的实现机制是可插拔的，之所以使用 Consul 是因为它拥有的特性以及它足够简单。比如：

### Etcd

如果你想使用 etcd 那你只需要引用 etcd 包，然后在启动的注册方式上标明使用的是 etcd 就行了。

```go
import (
        _ "github.com/micro/go-plugins/registry/etcd"
)
```

```shell
service --registry=etcd --registry_address=127.0.0.1:2379
```

### 零依赖

micro 专门为零依赖配置内置有一个多路广播 DNS 服务注册中心。

如果要使用，只需要在程序启动指令上传上`--registry=mdns`或者`MICRO_REGISTRY=mdns`。

## Micro 可以在哪些环境运行

micro 对运行环境不挑食。只要你喜欢，在哪都行，裸机, 亚马逊 AWS 或者 Google Cloud，也可以运行在你喜欢的容器编排系统中比如：Mesos、Kubernetes。

右边的这个链接中有关于如何使用 K8s 来开发 micro 服务的[micro kubernetes demo](https://github.com/micro/kubernetes)

## API、Web、SRV 服务之间的区别是什么

<img src="../images/arch.png" />

API、Web、SRV 作为 micro 工具集的一部分，我们尝试着使用一些设计模式规划出弹性的架构，通过把**API 接口**、**Web 管理控制台**、**SRV**（SRV 是 service 的简称，可理解为后台业务逻辑部分）。

### API 服务

micro api 默认把**go.micro.api**作为 API 网关服务的命名空间，micro api 遵从 API 网关模式。

查看更多内容请求翻阅：[api](https://github.com/micro/micro/tree/master/api)

### Web 服务

Web 服务由 micro web 提供，默认命名空间是**go.micro.web**。我们坚信，web 应用作为微服务中的一等公民，所以把构建 web 管理控制台作为微服务的一部分显得非常重要。micro web 其实是一个反向代理，并把 http 请求基于路径解析到适当的 web 应用程序。

查看更多内容请翻阅：[web](https://github.com/micro/micro/tree/master/web)

### SRV 服务

SRV 服务是 RPC 服务的基础，也就是你常写的服务类型。我们一般把它称作 RPC 或后端服务，因为它作为后台架构的一部分，不应该暴露在最外层。默认情况下，我们使用**go.micro.srv**作为它的命名空间，或者你可以使用像**com.example.srv**这样的名字。

## Micro 的性能如何

性能目前并不是 Micro 主要关注的事情。虽然代码写出来应该是最优化并且要避免超过负载，但是确实是没有这么多时间花在基准压力测试上。与 net/http 或者其它 web 框架相互比较目前毫无意义。Micro 提供的是更高级别的微服务需求，这里面就包含服务发现、负载均衡、消息编码等等。要比较，我想得把这些都一起比较了才行。

如果你还是关心性能问题，最简单的方式就是通过传递以下参数运行程序，便可以提取出最大值。

```
--selector=cache # 激活基于内存的服务节点发现机制
--client_pool_size=10 # 激活客户端连接池
```

## Micro 支持 gRPC 吗

支持。这儿有几个插件：transport、client、server。

可以查看[micro/go-plugins](https://github.com/micro/go-plugins).

我们也提供了 golang 版本的 gRPC 快速上手 demo：[micro/go-grpc](https://github.com/micro/go-grpc).

## Micro 与 Go-Kit 比较

这个问题经常出现，那二者的区别有哪些呢？

Go-kit 声称自己是一个微服务的标准库。像 GO 一样，go-kit 提供独立的包，通过这些包，开发者可以用来组建自己的应用程序。Go-kit 非常不错，基于 Go-kit，你可以完全掌控你定义的服务。

Go-micro 则是一个面向微服务的可插拔 RPC 框架。go-micro 是一个只在特殊方向上努力的框架，它尝试简化分布式系统之间的通信，所以我们可以花更多的时间在我们需要关注的业务逻辑上。对于想快速启动，把程序跑起来，同时用拥有一些可插拔的能力从基础架构中断开的能力，而不用修改代码，那么 go-micro 也很不错。

Micro 作为一个微服务工具库，好比一把瑞士军刀，在我们构建微服务时，可以提供传统的接入点，比如 http api gateway，web ui，cli，slack bot 等等。Micro 使用工具来引导架构关注点之间逻辑上的隔离，推动开发者创建 API 层的服务来暴露对外的 API 接口，并且创建隔离于对外 API 的 Web 层微服务。

如果想全盘掌控，那么使用 go-kit；但是如果想要一个有思想的框架，使用 go-micro。

## 想了解更多

- slack 社区 - [slack.micro.mu](https://micro-services.slack.com/messages/CHE2CSDAB/)
- 博客 - [micro.mu/blog](https://micro.mu/blog)
- 微博 - [microHQ](https://weibo.com/microhq)
- 联系我们 - [contact@micro.mu](mailto:contact@micro.mu)

{% include links.html %}
