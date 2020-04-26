---
order: 32
title: 编写Golang Function
---

本篇是指导大家使用 go-micro 的 Function 功能，Function 是执行一次的服务。（译者按：这里 Function 并不等同与平常我们编写的函数，而是只执行一次的服务所以我没有直接翻译，以免引起误解）

如果想先从更高的角度了解相关的工具集，可以查看博客[https://micro.mu/blog/2016/03/20/micro.html](https://micro.mu/blog/2016/03/20/micro.html)。

## 先写一个 Function

[Function](https://pkg.go.dev/github.com/micro/go-micro/v2#Function)作为顶级的接口，它是 go-micro 中函数式编程模型主要组件。它封装服务接口，并提供执行一次函数的能力。

```go
// Function 是只执行一次的函数
type Function interface {
	// Inherits Service interface
	Service
	// Done signals to complete execution
	Done() error
	// Handle registers an RPC handler
	Handle(v interface{}) error
	// Subscribe registers a subscriber
	Subscribe(topic string, v interface{}) error
}
```

### 1. 初始化

Function 使用`micro.NewFunction`构建。

```go
import "github.com/micro/go-micro/v2"

function := micro.NewFunction()
```

构建时也可以传入选项参数。

```go
function := micro.NewFunction(
        micro.Name("greeter"),
        micro.Version("latest"),
)
```

可选参数[参考](https://pkg.go.dev/github.com/micro/go-micro/v2#Option)。

Go micro 也可以通过`micro.Flags`解析命令行的传参。

```go
import (
        "github.com/micro/cli"
        "github.com/micro/go-micro/v2"
)

function := micro.NewFunction(
        micro.Flags(
                cli.StringFlag{
                        Name:  "environment",
                        Usage: "The environment",
                },
        )
)
```

命令行标记参数可以使用`function.Init`解析。增加参数可以使用`micro.Action`。

```go
function.Init(
        micro.Action(func(c *cli.Context) {
                env := c.StringFlag("environment")
                if len(env) > 0 {
                        fmt.Println("Environment set to", env)
                }
        }),
)
```

Go Micro 提供了一些预定义的参数标记，这些标记在执行`function.Init`时解析。所有预定义的标记参数可以[参考](https://pkg.go.dev/github.com/micro/go-micro/v2/cmd#pkg-variables)。

### 2. 定义 API

我们使用 protobuf 文件来定义服务的 API 接口。使用 protobuf 可以非常方便去严格定义 API，提供服务端与客户端双边具体一致的类型。

greeter.proto

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

我们定义了一个服务叫做 Greeter 的 Function 处理器，它有一个接收 HelloRequest 并返回 HelloResponse 的 Hello 方法。

### 3. 生成 API 接口

我们需要**protoc**和**protoc-gen-go**来生成 protobuf 代码文件，它们负责生成定义的 go 代码实现。

Go-micro 使用代码生成器生成客户端存根方法，这样可以像 gRPC 减少模板方法。这一步需要[golang/protobuf](https://github.com/golang/protobuf)fork 出来的插件[github.com/micro/protobuf](https://github.com/micro/protobuf).

```shell
go get github.com/micro/protobuf/{proto,protoc-gen-go}
protoc --go_out=plugins=micro:. greeter.proto
```

生成的类现在可以引入**handler**中，在服务或客户端来创建请求了。

下面是代码生成器生成的一部分代码。

```go
type HelloRequest struct {
	Name string `protobuf:"bytes,1,opt,name=name" json:"name,omitempty"`
}

type HelloResponse struct {
	Greeting string `protobuf:"bytes,2,opt,name=greeting" json:"greeting,omitempty"`
}

// 定义Greeter客户端的接口

type GreeterClient interface {
	Hello(ctx context.Context, in *HelloRequest, opts ...client.CallOption) (*HelloResponse, error)
}

type greeterClient struct {
	c           client.Client
	serviceName string
}

func NewGreeterClient(serviceName string, c client.Client) GreeterClient {
	if c == nil {
		c = client.NewClient()
	}
	if len(serviceName) == 0 {
		serviceName = "greeter"
	}
	return &greeterClient{
		c:           c,
		serviceName: serviceName,
	}
}

func (c *greeterClient) Hello(ctx context.Context, in *HelloRequest, opts ...client.CallOption) (*HelloResponse, error) {
	req := c.c.NewRequest(c.serviceName, "Greeter.Hello", in)
	out := new(HelloResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Greeter的服务端API

type GreeterHandler interface {
	Hello(context.Context, *HelloRequest, *HelloResponse) error
}

func RegisterGreeterHandler(s server.Server, hdlr GreeterHandler) {
	s.Handle(s.NewHandler(&Greeter{hdlr}))
}
```

### 4. 实现处理器

服务端需要注册**handlers**，这样才能提供服务并接收请求。处理器相当于是一个拥有公共方法的公共类，它需要符合签名`func(ctx context.Context, req interface{}, rsp interface{}) error`。

通过上面的内容，我们看到，Greeter interface 的签名的看上去就是这样：

```go
type GreeterHandler interface {
        Hello(context.Context, *HelloRequest, *HelloResponse) error
}
```

Greeter 处理器实现。

```go
import proto "github.com/micro/examples/service/proto"

type Greeter struct{}

func (g *Greeter) Hello(ctx context.Context, req *proto.HelloRequest, rsp *proto.HelloResponse) error {
	rsp.Greeting = "Hello " + req.Name
	return nil
}
```

处理器注册过程和`http.Handler`很像。

```
function := micro.NewFunction(
	micro.Name("greeter"),
)

proto.RegisterGreeterHandler(service.Server(), new(Greeter))
```

另外，Function 接口也提供更简单的注册方式。

```
function := micro.NewFunction(
        micro.Name("greeter"),
)

function.Handle(new(Greeter))
```

也可以使用 Subscribe 方法注册成异步的订阅者。

### 5. 运行 Function

运行 Function 可以通过`function.Run`。这样它会绑定到配置中指定的地址（默认使用 RFC1918 规则来分配并生成随机端口），然后开始侦听端口。

另外，这一步会在服务启动时向注册中心`注册`，并在服务接收到关闭信号时`卸载`。

```go
if err := function.Run(); err != nil {
	log.Fatal(err)
}
```

有接受服务请求后，这人 Function 就会退出。可以使用[micro run](https://micro.mu/docs/run.html) 来管理 Funtion 的生命周期。完整的例子查看：[examples/function](https://github.com/micro/examples/tree/master/function).

### 6. 完整的函数

<br>
greeter.go

```go
package main

import (
        "log"

        "github.com/micro/go-micro/v2"
        proto "github.com/micro/examples/function/proto"

        "golang.org/x/net/context"
)

type Greeter struct{}

func (g *Greeter) Hello(ctx context.Context, req *proto.HelloRequest, rsp *proto.HelloResponse) error {
        rsp.Greeting = "Hello " + req.Name
        return nil
}

func main() {
        function := micro.NewFunction(
                micro.Name("greeter"),
                micro.Version("latest"),
        )

        function.Init()

	    function.Handle(new(Greeter))

        if err := function.Run(); err != nil {
                log.Fatal(err)
        }
}
```

需要注意的是，要保证服务发现机制运行起来，这样服务才能注册，其它服务或客户端才能发现它。快速启动可[参考](https://github.com/micro/go-micro#getting-started)。

## 编写客户端

[客户端](https://pkg.go.dev/github.com/micro/go-micro/v2/client)包用于查询服务，当创建服务时，也包含了一个客户端，这个客户端匹配服务所使用的初始化包。

查询上面的服务很简单：

```go
// 创建greate客户端，这需要传入服务名与服务的客户端方法构建的客户端对象
greeter := proto.NewGreeterClient("greeter", function.Client())

// 在Greeter handler上请求调用Hello方法
rsp, err := greeter.Hello(context.TODO(), &proto.HelloRequest{
	Name: "John",
})
if err != nil {
	fmt.Println(err)
	return
}

fmt.Println(rsp.Greeter)
```

`proto.NewGreeterClient` 需要 Function 名与客户端来请求服务。

完整例子可查看[go-micro/examples/function](https://github.com/micro/examples/tree/master/function).

{% include links.html %}
