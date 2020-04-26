---
order: 33
title: 编写Golang服务
---

这里主要和大家演示如何使用 go-micro。

如果想先从更高的角度了解相关的工具集，可以查看博客[https://micro.mu/blog/2016/03/20/micro.html](https://micro.mu/blog/2016/03/20/micro.html)。

## 编写服务

顶级的服务接口[Service](https://pkg.go.dev/github.com/micro/go-micro/v2#Service)，是构建服务所需的主要组件。它把所有 Go-Micror 的基础包打包成单一组件接口。

```go
type Service interface {
    Init(...Option)
    Options() Options
    Client() client.Client
    Server() server.Server
    Run() error
    String() string
}
```

### 1. 初始化

可以使用`micro.NewService`创建服务

```go
import "github.com/micro/go-micro/v2"

service := micro.NewService()
```

初始化时，也可以传入相关选项

```go
service := micro.NewService(
        micro.Name("greeter"),
        micro.Version("latest"),
)
```

所有的可选参数参考：[配置项](https://pkg.go.dev/github.com/micro/go-micro/v2#Option)

Go Micro 也提供通过命令行参数`micro.Flags`传递配置参数：

```go
import (
        "github.com/micro/cli"
        "github.com/micro/go-micro/v2"
)

service := micro.NewService(
        micro.Flags(
                cli.StringFlag{
                        Name:  "environment",
                        Usage: "The environment",
                },
        )
)
```

解析命令行标识参数可以使用`service.Init`，增加标识参数可以使用`micro.Action`选项：

```go
service.Init(
        micro.Action(func(c *cli.Context) {
                env := c.StringFlag("environment")
                if len(env) > 0 {
                        fmt.Println("Environment set to", env)
                }
        }),
)
```

Go Micro 提供预置的标识，`service.Init`执行时就会设置并解析这些参数。所有的标识[参考](https://pkg.go.dev/github.com/micro/go-micro/v2/cmd#pkg-variables).

### 2. 定义 API

我们使用 protobuf 文件来定义服务的 API 接口。使用 protobuf 可以非常方便去严格定义 API，提供服务端与客户端双边具体一致的类型。

下面是定义的示例

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

我们定义了一个服务叫做 Greeter 的处理器，它有一个接收 HelloRequest 并返回 HelloResponse 的 Hello 方法。

### 3. 生成 API 接口

我们需要下面这个工具来生成 protobuf 代码文件，它们负责生成定义的 go 代码实现。

- [protoc](https://github.com/google/protobuf)
- [protoc-gen-go](https://github.com/golang/protobuf)
- [protoc-gen-micro](https://github.com/micro/protoc-gen-micro)

```shell
go get github.com/golang/protobuf/{proto,protoc-gen-go}
```

```shell
go get github.com/micro/protoc-gen-micro
```

```
protoc --proto_path=$GOPATH/src:. --micro_out=. --go_out=. greeter.proto
```

生成的类现在可以引入**handler**中，在服务或客户端来创建请求了。

下面是部分生成的代码

```go
type HelloRequest struct {
	Name string `protobuf:"bytes,1,opt,name=name" json:"name,omitempty"`
}

type HelloResponse struct {
	Greeting string `protobuf:"bytes,2,opt,name=greeting" json:"greeting,omitempty"`
}

// Greeter service 客户端的API

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

// Greeter service 服务端

type GreeterHandler interface {
	Hello(context.Context, *HelloRequest, *HelloResponse) error
}

func RegisterGreeterHandler(s server.Server, hdlr GreeterHandler) {
	s.Handle(s.NewHandler(&Greeter{hdlr}))
}
```

### 4. 实现 handler 处理器

服务端需要注册**handlers**，这样才能提供服务并接收请求。处理器相当于是一个拥有公共方法的公共类，它需要符合签名`func(ctx context.Context, req interface{}, rsp interface{}) error`

通过上面的内容，我们看到，Greeter interface 的签名的看上去就是这样：

```go
type GreeterHandler interface {
        Hello(context.Context, *HelloRequest, *HelloResponse) error
}
```

Greeter 处理器实现：

```go
import proto "github.com/micro/examples/service/proto"

type Greeter struct{}

func (g *Greeter) Hello(ctx context.Context, req *proto.HelloRequest, rsp *proto.HelloResponse) error {
	rsp.Greeting = "Hello " + req.Name
	return nil
}
```

处理器会与服务一起被注册，就像 http 处理器一样。

```
service := micro.NewService(
	micro.Name("greeter"),
)

proto.RegisterGreeterHandler(service.Server(), new(Greeter))
```

### 5. 运行服务

服务可以调用`server.Run`运行起来。这一步会让服务绑到配置中的地址（默认遵循 RFC1918，分配随机的端口）接收请求。

另外，这一步会在服务启动时向注册中心`注册`，并在服务接收到关闭信号时`卸载`。

```go
if err := service.Run(); err != nil {
	log.Fatal(err)
}
```

### 6. 完整的服务代码

<br>
greeter.go

```go
package main

import (
        "log"

        "github.com/micro/go-micro/v2"
        proto "github.com/micro/examples/service/proto"

        "golang.org/x/net/context"
)

type Greeter struct{}

func (g *Greeter) Hello(ctx context.Context, req *proto.HelloRequest, rsp *proto.HelloResponse) error {
        rsp.Greeting = "Hello " + req.Name
        return nil
}

func main() {
        service := micro.NewService(
                micro.Name("greeter"),
                micro.Version("latest"),
        )

        service.Init()

        proto.RegisterGreeterHandler(service.Server(), new(Greeter))

        if err := service.Run(); err != nil {
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
greeter := proto.NewGreeterClient("greeter", service.Client())

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

`proto.NewGreeterClient` 需要服务名与客户端来请求服务。

完整示例参考：[go-micro/examples/service](https://github.com/micro/examples/tree/master/service).

{% include links.html %}
