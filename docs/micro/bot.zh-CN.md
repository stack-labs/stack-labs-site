---
order: 5
title: 机器人
---

# micro bot

**micro bot**是一只藏在微服务中的小马蝇，有了它，我们可以在 Slack、HipChat、XMPP 等等聊天程序中与它对话，通过它来操控服务。

我们把消息发送给它，它基于这些消息模仿执行 CLI，触发指定的接口功能。

<p align="center">
  <img src="../images/bot.png" />
</p>

## 现在支持的输入方式

- Slack
- HipChat

## 准备上车

### 安装 Micro

安装 Micro，已经安装跳过

```go
go get github.com/micro/micro
```

### slack

SLACK_TOKEN 需要到[Slack](https://api.slack.com/tokens)上去获取。

```shell
micro bot --inputs=slack --slack_token=SLACK_TOKEN
```

效果见图：

<img src="../images/slack.png">

-

### HipChat

```shell
micro bot --inputs=hipchat --hipchat_username=XMPP_USER --hipchat_password=XMPP_PASSWORD
```

效果见图：

<img src="../images/hipchat.png">

-

如果使用多种机器人，可以使用逗号分隔传入：

```shell
micro bot --inputs=hipchat,slack --slack_token=SLACK_TOKEN --hipchat_username=XMPP_USER --hipchat_password=XMPP_PASSWORD
```

### 帮助信息

Slack

```shell
micro help

deregister service [definition] - Deregisters a service
echo [text] - Returns the [text]
get service [name] - Returns a registered service
health [service] - Returns health of a service
hello - Returns a greeting
list services - Returns a list of registered services
ping - Returns pong
query [service] [method] [request] - Returns the response for a service query
register service [definition] - Registers a service
the three laws - Returns the three laws of robotics
time - Returns the server time
```

## 增加命令

小机器人是根据文本消息匹配命令执行指定功能。

### 编写命令

```go
import "github.com/micro/go-micro/v2/agent/command"

func Ping() command.Command {
	usage := "ping"
	description := "Returns pong"

	return command.NewCommand("ping", usage, desc, func(args ...string) ([]byte, error) {
		return []byte("pong"), nil
	})
}
```

### 注册命令

把命令加到命令映射表中，命令的 key 可以通过**golang/regexp.Match**正则匹配。

```go
import "github.com/micro/go-micro/v2/agent/command"

func init() {
	command.Commands["^ping$"] = Ping()
}
```

### 重构建 Micro 服务

打包二进制文件

```shell
cd github.com/micro/micro

// 本地打包
go build -i -o micro ./main.go

// docker方式打包
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w' -i -o micro ./main.go
```

## 增加新的输入源

输入针对通信软件是插件化的，比如 Slack、HipChat、XMPP、IRC、SMTP 等等。

新的输入源可以通过下列方式增加。

### 新增输入源

输入源要满足下面的接口。

```go
type Input interface {
	// 命令行接口标识
	Flags() []cli.Flag
	// 使用命令行上下文初始化
	Init(*cli.Context) error
	// 输入流事件
	Stream() (Conn, error)
	// 开始输入
	Start() error
	// 输入终止
	Stop() error
	// 输入源名
	String() string
}
```

### 注册输入

把新的输入注册到映射表中

```go
import "github.com/micro/go-micro/v2/agent/input"

func init() {
	input.Inputs["name"] = MyInput
}
```

### 重构建

二进制打包

```shell
cd github.com/micro/micro

// 本地打包
go build -i -o micro ./main.go

// docker打包
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w' -i -o micro ./main.go
```

## 命令即服务

小机器人支持创建服务式的命令。

### 是怎么工作的

小机器人值班时，它会监测它命名空间中注册的服务，默认的命名空间是`go.micro.bot`。所有在这个命名空间内的服务都会自动加到可执行列表中，当命令执行后，小机器人就会通过方法`Command.Exec`来调用服务。它也支持使用`Command.Help` 获取使用信息，当然是注册时要把帮助信息写上。

服务的接口示例如下，也可以在[go-bot/proto](https://github.com/micro/go-micro/agent/blob/master/proto/bot.proto)上找到。

```proto
syntax = "proto3";

package go.micro.bot;

service Command {
	rpc Help(HelpRequest) returns (HelpResponse) {};
	rpc Exec(ExecRequest) returns (ExecResponse) {};
}

message HelpRequest {
}

message HelpResponse {
	string usage = 1;
	string description = 2;
}

message ExecRequest {
	repeated string args = 1;
}

message ExecResponse {
	bytes result = 1;
	string error = 2;
}
```

### 示例

这里有一个示例，以调用微服务来执行打印命令

```go
package main

import (
	"fmt"
	"strings"

	"github.com/micro/go-micro/v2"
	"golang.org/x/net/context"

	proto "github.com/micro/go-micro/v2/agent/proto"
)

type Command struct{}

// Help 返回使用帮助信息
func (c *Command) Help(ctx context.Context, req *proto.HelpRequest, rsp *proto.HelpResponse) error {
	// Usage 应该要包含命令的名称
	rsp.Usage = "echo"
	rsp.Description = "This is an example bot command as a micro service which echos the message"
	return nil
}

// Exec 指行命令
func (c *Command) Exec(ctx context.Context, req *proto.ExecRequest, rsp *proto.ExecResponse) error {
	rsp.Result = []byte(strings.Join(req.Args, " "))
	// rsp.Error，如果发生错误，可以设置rsp.Error
	// 注意：函数（Exec）返回的错误则只是服务这一级的错误信息，Exec调用方法会收到这个错误，而rsp.Error是返
	// 回给命令执行处的错误
	return nil
}

func main() {
	service := micro.NewService(
		micro.Name("go.micro.bot.echo"),
	)

	service.Init()

	proto.RegisterCommandHandler(service.Server(), new(Command))

	if err := service.Run(); err != nil {
		fmt.Println(err)
	}
}
```

{% include links.html %}
