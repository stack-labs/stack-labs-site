---
order: 3
title: 快速上手
---

> 在开始使用之前，我们建议读者对 Golang、微服务及 RPC 要有一定的理解。

## 依赖

环境依赖参考：[环境准备工作](https://stacklabs.cn/docs/stack-rpc/prepare-env-cn)

## 新建项目

```bash
$ mkdir stack-demo && cd stack-demo
$ go mod init stacklabs.cn/stack-rpc/stack-demo
```

StackRPC 目前还没有脚手架):

## 安装 Stack-RPC

```bash
$ go get github.com/stack-labs/stack-rpc
```

## 编写服务

我们写一个简单的问候（greeter）程序作为示例。

例子可参考：[examples/service](https://github.com/stack-labs/stack-rpc-tutorials/tree/master/examples/service/rpc).

### 服务原型

微服务中有个关键需求点，就是接口的强定义。Stack 使用 protobuf 来完成这个需求。

下面我们定义 Greeter 问候服务接口，它有一个 Hello 方法，及方法的入参 HelloRequest 及出参 HelloResponse，两个对象都有一个字符串类型的参数。

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

我们创建一个**proto/greeter**目录并在其下生成**greeter.proto**文件，然把上面的内容贴到该文件中。

```bash
$ mkdir -p proto/greeter && cd proto/greeter
# 或使用其它编辑器创建并编辑
$ vim greeter.proto
```

### 生成原型

在定义好原型后我们得使用 protoc 及 stack_out 指令 的插件编译它，Stack 插件可以帮助生成 Stack-RPC 需要的原型文件

```shell
$ protoc --proto_path=$GOPATH/src:. --stack_out=. --go_out=. greeter.proto
```

我们可以看到在 proto 目录中生成了如下文件

```text
└── proto
    └── greeter
        ├── greeter.pb.go       # 接口声明文件
        ├── greeter.pb.stack.go # Stack服务声明文件
        └── greeter.proto       # 原型
```

### 编写服务

下方的代码开始编写 greeter 服务的代码

它要实现下面的几个要求

1. 实现在 Greeter Handler 中定义的接口。
2. 初始化 stack.Service
3. 注册 Greeter handler
4. 运行服务

```bash
# 回到主目录，创建server目录并创建main.go
$ vim server/main.go
# 代码结构如下
└── proto
    └── greeter
        ├── greeter.pb.go       # 接口声明文件
        ├── greeter.pb.stack.go # Stack服务声明文件
        └── greeter.proto       # 原型
└── server
    └── main.go
```

将代码贴到**server/main.go**中

```go
package main

import (
	"context"

	"github.com/stack-labs/stack-rpc"
	proto "github.com/stack-labs/stack-rpc-tutorials/examples/proto/service/rpc"
	"github.com/stack-labs/stack-rpc/logger"
)

// 服务类
type Greeter struct {
}

// 实现proto中的Hello接口
func (g Greeter) Hello(ctx context.Context, req *proto.HelloRequest, rsp *proto.HelloResponse) error {
	rsp.Greeting = "Hello! " + req.Name
	return nil
}

func main() {
	// 实例化服务，并命名为stack.rpc.greeter
	service := stack.NewService(
		stack.Name("stack.rpc.greeter"),
	)
	// 初始化服务
	service.Init()

	// 将Greeter接口注册到服务上
	proto.RegisterGreeterHandler(service.Server(), new(Greeter))

	// 运行服务
	if err := service.Run(); err != nil {
		logger.Error(err)
	}
}
```

### 运行服务

```
go run server/main.go
```

输出

```
2020-11-25 00:38:04.284527 I | Transport [http] Listening on [::]:50783
2020-11-25 00:38:04.284592 I | Broker [http] Connected to [::]:50784
2020-11-25 00:38:04.284851 I | Registry [mdns] Registering node: stack.rpc.greeter-e6d90337-1638-49e7-9084-c927517dee7e
```

> 以上输出根据运行环境有所差异

### 定义客户端

下面的客户端代码用来调用**greeter**服务。上面我们生成的 proto 原型文件中包含了客户端部分，相当于一个模块，这样可以减少代码量。

```
# 回到主目录，创建client目录并创建main.go
$ vim client/main.go
# 代码结构如下
└── proto
    └── greeter
        ├── greeter.pb.go       # 接口声明文件
        ├── greeter.pb.stack.go # Stack服务声明文件
        └── greeter.proto       # 原型
└── server
    └── main.go
└── client
    └── main.go
```

将下方代码贴到**client/main.go**中

```go
package main

import (
	"context"

	"github.com/stack-labs/stack-rpc"
	proto "github.com/stack-labs/stack-rpc-tutorials/examples/proto/service/rpc"
	"github.com/stack-labs/stack-rpc/logger"
)

func main() {
	// 定义服务，可以传入其它可选参数
	service := stack.NewService(stack.Name("stack.rpc.client"))
	service.Init()

	// 创建客户端
	greeter := proto.NewGreeterService("stack.rpc.greeter", service.Client())

	// 调用greeter服务
	rsp, err := greeter.Hello(context.TODO(), &proto.HelloRequest{Name: "StackLabs"})
	if err != nil {
		logger.Fatal(err)
		return
	}

	// 打印响应结果
	logger.Info(rsp.Greeting)
}
```

### 运行客户端

```bash
go run client/main.go
```

输出

```
2020-11-25 00:41:17  file=client/main.go:27 level=info Hello! StackLabs
```

是不是很简单！

我们演示了如何基于 StackRPC 来编写一个简单的微服务。但上面的过程隐藏了微服务服务启动、请求处理等的很多关键细节，比如服务的注册、日志库加载、服务发现、请求均衡等等，这些都封装在了 StackRPC 库里。
