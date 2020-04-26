---
order: 15
title: Go Micro
---

Go Micro 是可插拔的微服务开发框架。

## 概览

Go Micro 提供分布式系统开发的核心库，包含 RPC 与事件驱动的通信机制。

**micro**的设计哲学是可插拔的架构理念，她提供可快速构建系统的组件，并且可以根据自身的需求剥离默认实现并自行定制。

## 特性

Go Micro 把分布式系统的各种细节抽象出来。下面是它的主要特性。

- **服务发现（Service Discovery）** - 自动服务注册与名称解析。服务发现是微服务开发中的核心。当服务 A 要与服务 B 协作时，它得知道 B 在哪里。默认的服务发现系统是 Consul，而 multicast DNS (mdns，组播)机制作为本地解决方案，或者零依赖的 P2P 网络中的 SWIM 协议（gossip）。

- **负载均衡（Load Balancing）** - 在服务发现之上构建了负载均衡机制。当我们得到一个服务的任意多个的实例节点时，我们要一个机制去决定要路由到哪一个节点。我们使用随机处理过的哈希负载均衡机制来保证对服务请求颁发的均匀分布，并且在发生问题时进行重试。

- **消息编码（Message Encoding）** - 支持基于内容类型（content-type）动态编码消息。客户端和服务端会一起使用 content-type 的格式来对 Go 进行无缝编/解码。各种各样的消息被编码会发送到不同的客户端，客户端服服务端默认会处理这些消息。content-type 默认包含 proto-rpc 和 json-rpc。

- **Request/Response** - RPC 通信基于支持双向流的请求/响应方式，我们提供有抽象的同步通信机制。请求发送到服务时，会自动解析、负载均衡、拨号、转成字节流，默认的传输协议是 http/1.1，而 tls 下使用 http2 协议。

- **异步消息（Async Messaging）** - 发布订阅（PubSub）头等功能内置在异步通信与事件驱动架构中。事件通知在微服务开发中处于核心位置。默认的消息传送使用点到点 http/1.1，激活 tls 时则使用 http2。

- **可插拔接口（Pluggable Interfaces）** - Go Micro 为每个分布式系统抽象出接口。因此，Go Micro 的接口都是可插拔的，允许其在运行时不可知的情况下仍可支持。所以只要实现接口，可以在内部使用任何的技术。更多插件请参考：[github.com/micro/go-plugins](https://github.com/micro/go-plugins)。

## 安装 protobuf

代码生成依赖 Protobuf，参考安装：

- [protoc-gen-micro](https://github.com/micro/protoc-gen-micro)

## 服务发现

服务发现用于解析服务名与地址。

### Consul

[Consul](https://www.consul.io/) 在 Go Micro 中是默认（以后的版本可能会更改）的服务发现注册中心。

发现系统可插拔，其它插件像 etcd, kubernetes, zookeeper 可以参考[micro/go-plugins](https://github.com/micro/go-plugins) 库。

[Consul 安装指导](https://www.consul.io/intro/getting-started/install.html)

安装好后，可以在命令行启动时传入变量或指令便可以使用 consul 作为注册中心：

```bash
$ MICRO_REGISTRY=consul go run main.go
```

或者

```bash
$ go run main.go --registry=consul
```

### Multicast DNS

[组播 dns](https://en.wikipedia.org/wiki/Multicast_DNS)内置在服务发现系统之中的插件，提供零依赖的配置。

在启动命令中传入 `--registry=mdns`，或声明环境变量 `MICRO_REGISTRY=mdns`：

```
MICRO_REGISTRY=mdns go run main.go
```

## 编写服务

我们写一个简单的问候（greeter）程序作为示例。

例子可参考：[examples/service](https://github.com/micro/examples/tree/master/service).

### 服务原型

微服务中有个关键需求点，就是接口的强定义。Micro 使用 protobuf 来完成这个需求。下面我们定义 Greeter 处理器，它有一个 Hello 方法。它有 HelloRequest 入参对象及 HelloResponse 出参对象，两个对象都有一个字符串类型的参数。

```proto
syntax = "proto3";

service Greeter {
	rpc Hello(HelloRequest) returns (HelloResponse) {}
}

message HelloRequest {
	string name = 1;
}

message HelloResponse {
	string greeting = 2;
}
```

### 生成原型

在定义好原型后我们得使用 protoc 及 micro 的插件编译它，micro 插件可以帮助生成 go micro 需要的原型文件

```shell
protoc --proto_path=$GOPATH/src:. --micro_out=. --go_out=. path/to/greeter.proto
```

### 编写服务

下方的代码是 greeter 服务的代码

它要实现下面的几个要求

1. 实现在 Greeter Handler 中定义的接口。
2. 初始化 micro.Service
3. 注册 Greeter handler
4. 运行服务

```go
package main

import (
	"context"
	"fmt"

	micro "github.com/micro/go-micro/v2"
	proto "github.com/micro/examples/service/proto"
)

type Greeter struct{}

func (g *Greeter) Hello(ctx context.Context, req *proto.HelloRequest, rsp *proto.HelloResponse) error {
	rsp.Greeting = "Hello " + req.Name
	return nil
}

func main() {
	// 创建新的服务，这里可以传入其它选项。
	service := micro.NewService(
		micro.Name("greeter"),
	)

	// 初始化方法会解析命令行标识
	service.Init()

	// 注册处理器
	proto.RegisterGreeterHandler(service.Server(), new(Greeter))

	// 运行服务
	if err := service.Run(); err != nil {
		fmt.Println(err)
	}
}
```

### 运行服务

```
go run examples/service/main.go
```

输出

```
2016/03/14 10:59:14 Listening on [::]:50137
2016/03/14 10:59:14 Broker Listening on [::]:50138
2016/03/14 10:59:14 Registering node: greeter-ca62b017-e9d3-11e5-9bbb-68a86d0d36b6
```

### 定义客户端

下面的客户端代码用来查询 greeter 服务。上面我们生成的 proto 原型文件中包含了客户端部分，这样可以减少模板代码量。

```go
package main

import (
	"context"
	"fmt"

	micro "github.com/micro/go-micro/v2"
	proto "github.com/micro/examples/service/proto"
)


func main() {
	// 定义服务，可以传入其它可选参数
	service := micro.NewService(micro.Name("greeter.client"))
	service.Init()

	// 创建新的客户端
	greeter := proto.NewGreeterService("greeter", service.Client())

	// 调用greeter
	rsp, err := greeter.Hello(context.TODO(), &proto.HelloRequest{Name: "John"})
	if err != nil {
		fmt.Println(err)
	}

	// 打印响应请求
	fmt.Println(rsp.Greeting)
}
```

### 运行客户端

```shell
go run client.go
```

输出

```
Hello John
```

## 编写 Function

Go Micro 包含了函数式编程模型。

Function 是指接收一次请求，执行后便退出的服务

### 定义 Function

```go
package main

import (
	"context"

	proto "github.com/micro/examples/function/proto"
	"github.com/micro/go-micro/v2"
)

type Greeter struct{}

func (g *Greeter) Hello(ctx context.Context, req *proto.HelloRequest, rsp *proto.HelloResponse) error {
	rsp.Greeting = "Hello " + req.Name
	return nil
}

func main() {
	// 创建新函数
	fnc := micro.NewFunction(
		micro.Name("greeter"),
	)

	// 初始化命令行
	fnc.Init()

	// 注册handler
	fnc.Handle(new(Greeter))

	// 运行服务
	fnc.Run()
}
```

简单吧！

## 发布与订阅

Go-micro 给事件驱动架构内置了消息代理（broker）接口。发布与订阅像 RPC 一样操控生成的 protobuf 消息。这些消息会自动编/解码并通过代理发送。

Go-micro 默认包含点到点的 http 代理，但是也可以通过 go-plugins 把这层逻辑替换掉。

### 发布

创建发布器，传入`topic`主题名，及服务客户端。

```go
p := micro.NewPublisher("events", service.Client())
```

发布一条 protobuf 消息

```go
p.Publish(context.TODO(), &proto.Event{Name: "event"})
```

### 订阅

创建消息处理器，签名得是`func(context.Context, v interface{}) error`。

```go
func ProcessEvent(ctx context.Context, event *proto.Event) error {
	fmt.Printf("Got event %+v\n", event)
	return nil
}
```

在这个消息处理器注册上`topic`主题

```go
micro.RegisterSubscriber("events", ProcessEvent)
```

查看完成例子：[examples/pubsub](https://github.com/micro/examples/tree/master/pubsub)

## 插件

Go-micro 默认下只提供了少量的核心接口实现，但是这些都是可插拔的。[github.com/micro/go-plugins](https://github.com/micro/go-plugins)提供了一捆插件，可以供参考，也欢迎贡献您的代码。

### 构建插件

如果想要集成插件，只需要把插件位置导入到文件中，重新编译即可。

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

打包二进制文件：

```shell
// 本地使用
go build -i -o service ./main.go ./plugins.go
```

标识使用插件

```shell
service --registry=etcdv3 --transport=nats --broker=kafka
```

### 插件即选项

另外，你也可以在服务中设置插件作为选项

```go

import (
        "github.com/micro/go-micro/v2"
        // etcd v3 registry
        "github.com/micro/go-plugins/registry/etcdv3"
        // nats transport
        "github.com/micro/go-plugins/transport/nats"
        // kafka broker
        "github.com/micro/go-plugins/broker/kafka"
)

func main() {
	registry := etcdv3.NewRegistry()
	broker := kafka.NewBroker()
	transport := nats.NewTransport()

    service := micro.NewService(
            micro.Name("greeter"),
            micro.Registry(registry),
            micro.Broker(broker),
            micro.Transport(transport),
    )

	service.Init()
	service.Run()
}
```

### 编写插件

插件是构建在 Go 接口之上的的概念。每个包都维护着高度抽象的接口。简单实现接口并把它作为选项传入服务。

服务发现的接口称作[注册（Registry）](https://pkg.go.dev/github.com/micro/go-micro/v2/registry#Registry)。任何实现了这个接口的都可以当作注册中心。同样，对于其它包的实现也是如此。

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

浏览[go-plugins](https://github.com/micro/go-plugins)获取更多优秀实现内容。

## 包装器（Wrappers）

Go-micro 中有中间件即包装器的概念。客户端或者处理器可以使用装饰模式包装起来。

### 处理器

这里演示服务处理器包装器，它负责打印传入请求的日志。 Here's an example service handler wrapper which logs the incoming request

```go
// 实现server.HandlerWrapper接口
func logWrapper(fn server.HandlerFunc) server.HandlerFunc {
	return func(ctx context.Context, req server.Request, rsp interface{}) error {
		fmt.Printf("[%v] server request: %s", time.Now(), req.Endpoint())
		return fn(ctx, req, rsp)
	}
}
```

可以在创建服务时初始化

```go
service := micro.NewService(
	micro.Name("greeter"),
	// 把handler包起来
	micro.WrapHandler(logWrapper),
)
```

### 客户端

下面演示客户端包装器，它负责打印请求创建的日志。 Here's an example of a client wrapper which logs requests made

```go
type logWrapper struct {
	client.Client
}

func (l *logWrapper) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	fmt.Printf("[wrapper] client request to service: %s method: %s\n", req.Service(), req.Endpoint())
	return l.Client.Call(ctx, req, rsp)
}

// 实现client.Wrapper，充当日志包装器
func logWrap(c client.Client) client.Client {
	return &logWrapper{c}
}
```

可以在创建服务时初始化

```go
service := micro.NewService(
	micro.Name("greeter"),
	// 把客户端包起来
	micro.WrapClient(logWrap),
)
```

## 相关示例

服务示例可以在[**examples/service**](https://github.com/micro/examples/tree/master/service)中找到，Function 则到[**examples/function**](https://github.com/micro/examples/tree/master/function)查看

[**examples**](https://github.com/micro/examples)的 Github 目录下包含了各种示例，比如中间件/包装器，选择过滤器，发布/订阅，gRPC，插件等。

greeter 示例的完整代码[**examples/greeter**](https://github.com/micro/examples/tree/master/greeter)。

所有的示例都可以在 GitHub 仓库中找到。

观看[Golang 英国会议 2016](https://www.youtube.com/watch?v=xspaDovwk34)视频，获得更高级的视角。

{% include links.html %}
