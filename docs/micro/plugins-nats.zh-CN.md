－-- order: 24 title: NATS

---

本篇文章主要讲 nats，在 micro 工具集中，nats 模块集成 nats 消息系统。

NATS 主要工作聚焦在服务发现、微服务同步/异步通信。

### 什么是 NATS?

[**NATS**](http://nats.io/)是一款开源云原生的消息系统，或者更简单地说是一款消息总线，NATS 以前是由 Derek Collison 创建，他是[Apcera](https://www.apcera.com/)的创始人。NATS 起源于 VMware，并在基于 ruby 的系统中展露头角。

而 Go 的版本很早之前就已经有了，并且在那些追求高度可伸缩和高性能消息系统中稳步发展。

如果想了解更多 NATS，可以访问[nats.io](http://nats.io/)或者加入[论坛](http://nats.io/community/)。

### 为什么使用 NATS?

为什么不使用 NATS？过去我们使用很多种消息总线，NATS 显然是很特殊的。过去的这些年，消息好像就像企业的救世主一样，在系统中的每一部分每一件事都要使用它。消息产生很多未能达到预期效果的错误、自身特性膨胀、高昂的技术成本，使得引入它们产生的问题比解决的问题更多。

NATS，比较起来，它更专注于解决性能和可用性的问题，同时又要保证自身的轻量。NATS 模式是“随时在线”，并且“发送便忽略”（即：关注于随时创建连接并发送消息，但是不关心消息是否到达）。 NATS 很简单，因为它的专注、轻量使得使得它成为微服务的主要候选方案之一。我们也相信，在那些关注消息的服务之中，它也会成为通信传输的主要候选方案。

NATS 支持：

- 高性能高伸缩
- 高可用
- 极其轻量
- 最多传输一次

NATS 不支持：

- 持久化
- 事务
- 强化传输模式
- 企业队列

上面简要介绍了什么是及为什么是 NATS。我们来讨论为什么它适合 Micro。

### NATS 之上的 Micro

[**Micro**](https://github.com/micro/micro)作为可插拔的微服务架构，它允许只改动小部分代码便能替换依赖的插件。每一个[**Go-Micro**](https://github.com/micro/go-micro)框架中的接口都提供了微服务的构建模块。

[registry](https://pkg.go.dev/github.com/micro/go-micro/v2/registry#Registry)负责服务发现

[transport](https://pkg.go.dev/github.com/micro/go-micro/v2/transport#Transport)负责同步的消息通信

[broker](https://pkg.go.dev/github.com/micro/go-micro/v2/broker#Broker)负责异步的消息通信

...等等

为每个组件创建插件就你实现相关的接口一样简单。在未来提交的文章中，我们会花比较多的时间来详细说明如何来编写插件。如果你想签出像 NATS 或者其它系统中的插件，比如 etcd、kafka、rabbitmq 等等，可以到[github.com/micro/go-plugins](https://github.com/micro/go-plugins)里翻阅。

Micro 的 NATS 插件是 go-micro 插件集中的基础，它可以用于在需要 NATS 消息的服务中集成。通过提供各式各样的 go-micro 接口，我们有可集成方案供各种架构选择。

在我们以往的经验中，一个规格的插件不可能会适合所有的需求，灵活性也不完全会满足你们团队的模型。

下面我们讨论 NATS 插件的传输、代理、注册如何实现

### 传输

<img src="../images/nats-req-rsp.png" />

上面是 go-micro 的同步传输接口。它使用我们常见的 Go 中套接字语法，比如`Listen`、`Dial`和`Accept`。这些概念及模式在 tcp、http 同步消息中很常见，但是使用在消息总线上时，就显得困难得多，与连接消息总线创建链接而不是服务本身。为了避开这个问题，我们使用带有主题、信道的伪连接的概念。

下面介绍它的工作过程

服用使用`transport.Listen`来侦听消息。这个过程会创建连向 NATS 的连接。当`transport.Accept`被调用后，会创建唯一的主题，并向这个主题订阅。该唯一的主题在 go-micro 中也会被当成服务地址。每个消息在收到后会立马被用作伪套接字或连接的基础。如果面向相同的回复地址的连接已经创建，那我们会把这个消息塞到该连接的待办表中。

客户端如果想服务端取得联系，则需要使用`transport.Dial`来创建面向服务端的连接。

该过程会与 NATS 连接，创建它自己的唯一主题并订阅该主题。该主题会用于服务端的响应。任何时候消息被客户端发送到服务端时，它会在主题设置该回复地址。

当任何一边想关掉连接时，会调用`transport.Close`来关闭与 NATS 的连接。

<img src="../images/nats-transport.png" />

<b>传输插件</b>

导入传输插件

```
import _ "github.com/micro/go-plugins/transport/nats"
```

在启动指令中带上 transport 参数

```
go run main.go --transport=nats --transport_address=127.0.0.1:4222
```

或者直接使用 transport 函数

```
transport := nats.NewTransport()
```

<center>...</center>

go-micro 传输接口：

```go
type Transport interface {
    Dial(addr string, opts ...DialOption) (Client, error)
    Listen(addr string, opts ...ListenOption) (Listener, error)
    String() string
}
```

<a href="https://github.com/micro/go-plugins/tree/master/transport/nats"><i class="fa fa-github fa-2x"></i> Transport</a>

### Broker 代理

<img src="../images/nats-pub-sub.png" />

broker 用于异步消息，它可以应用于大多数消息代理（broker）。NATS, 本质上就是一种异步消息系统，有一点需要注意的是，NATS 是不会持久化消息的，尽管这方面在某些场景中稍有不足，但是我们仍然会选择 NATS 作为消息代理。对于不需持久化的地方，NATS 足以支撑高弹性的消息收发架构。

NATS 通过主题、信息等等概念提供非常直接的发布与订阅机制。不需要太多复杂的操作。消息可以通过异步发送即遗忘的方式推送出去。订阅者们使用相同的信道名在 NATS 排成一组队列，这样它们就可以自动均分到订阅者。

<img src="../images/nats-broker.png" />

<b>使用 broker 插件</b>

引入 broker 插件

```
import _ "github.com/micro/go-plugins/broker/nats"
```

通过指令带入 nats

```
go run main.go --broker=nats --broker_address=127.0.0.1:4222
```

或者直接使用函数

```
broker := nats.NewBroker()
```

<center>...</center>
broker 接口：

```go
type Broker interface {
    Options() Options
    Address() string
    Connect() error
    Disconnect() error
    Init(...Option) error
    Publish(string, *Message, ...PublishOption) error
    Subscribe(string, Handler, ...SubscribeOption) (Subscriber, error)
    String() string
}
```

<a href="https://github.com/micro/go-plugins/tree/master/broker/nats"><i class="fa fa-github fa-2x"></i> Broker 代理</a>

### 注册

<img src="../images/nats-service-discovery.png" />

注册是 go-micro 服务发现的接口。可能你会想到，服务发现怎么使用消息总线？有用吗？事实上是的而且运行非常好。很多人在他们的传输中使用消息总线时会避免使用各种各样独立的发现机制。

这是因为消息总线自身可以通过主题与信道处理路由。主题的定位就是作为服务名并且也可以当成路由 key，自动在订阅该主题的服务实例之间进行负载均衡。

Go-micro 中服务发现与传输机制是两个独立的概念。任何时间客户端如果要发送请求到其它服务中，从表面上看，它会用名称在注册中心查找服务，找到节点地址后便通过传输（transport）与其进行通信。

一般情况下，大多数的服务发现信息都是存在分布式的键值对中，像 zookeeper、etcd 或者其它类型的系统。

你应该意识到了，NATS 并没有分布式的键值存储能力，所以接下来我们要做的事多少是有点不一样的......

<b>广播查询</b>

广播查询如你所想的那样，服务侦听我们需要的特定主题的广播。任何服务想要服务发现信息就得先创建一个响应主题，该主题便是它所订阅的主题，然后在带有它们回复地址的广播主题中进行查询

由于并不知道到底有多少个服务实例，也不知道有多少个响应会返回回来，所以我们会设置一个上限时间值等待返回的响应。

这是一种为服务发现所创建简单粗暴的分散-收集机制，因为 NATS 兼具弹性与性能的天生属性，这一机制工作起来一级棒！该机制也间接一种简单的方式来过滤响应时间比较长的服务. 未来我们会改进底层实现。

那么总结一下它是如何工作的：

1. 创建应答主题并订阅
2. 发送带有回复地址的广播主题查询
3. 侦听响应，并在限制时长后取消订阅
4. 汇总响应并返回结果

<img src="../images/nats-registry.png" />

<b>使用注册插件</b>

引入注册插件

```
import _ "github.com/micro/go-plugins/registry/nats"
```

启动时指定注册插件

```
go run main.go --registry=nats --registry_address=127.0.0.1:4222
```

或者直接使用注册方法

```
registry := nats.NewRegistry()
```

<center>...</center>

go-micro 的注册 interface:

```go
type Registry interface {
    Register(*Service, ...RegisterOption) error
    Deregister(*Service) error
    GetService(string) ([]*Service, error)
    ListServices() ([]*Service, error)
    Watch() (Watcher, error)
    String() string
}
```

<a href="https://github.com/micro/go-plugins/tree/master/registry/nats"><i class="fa fa-github fa-2x"></i> 注册</a>

### Micro NATS 的弹性

上面的例子中我们只是特定了单一 NATS 服务，该服务只在本地运行，而实际场景是会安装 NATS 集群，这样才能高可用并容错。了解更多 NATS 集群，请参考：[NATS 集群](http://nats.io/documentation/server/gnatsd-cluster/)。

Micro 接受使用逗号分开的地址作为标识，可以像上面的例子中那样当参数传入，或者使用环境变量。如果你直接使用的客户端库，也可以以选项的方式在注册（registry）、传输（transport）、代理（broker）初始化时设置主机地址集。

在云原生的架构中，按照我们过去的经验，在每个 AZ（availability zones）或每个区域搭建一个集群比较理想。

大多数云提供商在 AZ 之间有相对低延时（3-5ms），这样就可以毫无问题搭建整个区域的集群。

对于高可用的配置，系统具备 AZ 容错与更进一步的区域容错能力尤其显得重要。不推荐跨区域的集群。理想情况下，更高级的工具须能管理多集群、多区域的系统。

Micro 并不限制运行环境，从一开始其便设计为可在任意环境、任意配置中运行。

从服务注册出发，我们提供一个注册中心，服务集群可以在主机池、一定数量的 AZ 或者区域中本地化。与 NATS 集群结合，便可以构建我们所需的高可用架构服务。

<img src="../images/region.png" />

### 总结

[**NATS**](http://nats.io/) 作为可伸缩与高性能的消息系统，完美融于微服务生态。我们将它与 Micro 整合，它在[Registry](https://godoc.org/github.com/micro/go-plugins/registry/nats)注册插件、 [Transport](https://godoc.org/github.com/micro/go-plugins/transport/nats)传输插件，还有[Broker](https://godoc.org/github.com/micro/go-plugins/broker/nats)代理插件之中运行得非常好。

我们突出实现这三个插件也是为了说明 NATS 可以有多灵活。

将 Micro 构建在 NATS 之上可认为是 Micro 强大插件化架构的例子，每一个 go-micro 包都可以实现、替换且只需要一丁点改动。

未来 Micro 会有更多的技术示例，下一个最有可能是 k8s。

希望本篇可以推动你尝试 Micro NATS 或者写一些插件给其它系统，贡献到社区。

NATS 插件源码：[github.com/micro/go-plugins](https://github.com/micro/go-plugins)。

{% include links.html %}
