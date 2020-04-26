---
order: 6
title: CLI
---

# micro cli

**micro cli**是一个类命令行接口的工具，[micro](https://github.com/micro/micro)。

## 安装

```shell
go get github.com/micro/micro
```

## 交互模式

CLI 有带提示的交互模式：

```
micro cli
```

如果是在交互模式中时，下面的指令中的`micro`要删掉，非交互模式即直接命令行执行才需要。

## 使用示例

### 列出服务

```shell
micro list services
```

### 获取服务

```shell
micro get service go.micro.srv.example
```

输出：

```
go.micro.srv.example

go.micro.srv.example-fccbb6fb-0301-11e5-9f1f-68a86d0d36b6	[::]	62421
```

### 调用服务

```shell
micro call go.micro.srv.example Example.Call '{"name": "John"}'
```

输出：

```
{
	"msg": "go.micro.srv.example-fccbb6fb-0301-11e5-9f1f-68a86d0d36b6: Hello John"
}
```

### 服务健康检测

```shell
micro health go.micro.srv.example
```

输出

```
node		address:port		status
go.micro.srv.example-fccbb6fb-0301-11e5-9f1f-68a86d0d36b6		[::]:62421		ok
```

### 注册/卸载服务

```shell
micro register service '{"name": "foo", "version": "bar", "nodes": [{"id": "foo-1", "address": "127.0.0.1", "port": 8080}]}'
```

```shell
micro deregister service '{"name": "foo", "version": "bar", "nodes": [{"id": "foo-1", "address": "127.0.0.1", "port": 8080}]}'
```

## 代理远程环境

代理远程的环境，可以使用`micro proxy`

如果针对远程环境进行开发时，可能无法直接访问服务，这使用 CLI 操作变更很不方便。`micro proxy` 提供了 http 代理解决这种使用场景。

在远程环境中运行，启动代理

```
micro proxy
```

在命令行中带上`MICRO_PROXY_ADDRESS`远程代理的地址，这样客户端的 CLI 就知道要连上这个代理

```shell
MICRO_PROXY_ADDRESS=staging.micro.mu:8081 micro list services
```

## 使用方式

```shell
NAME:
   micro - A cloud-native toolkit

USAGE:
   micro [global options] command [command options] [arguments...]

VERSION:
   0.8.0

COMMANDS:
    api		Run the micro API
    bot		Run the micro bot
    registry	Query registry
    call	Call a service or function
    query	Deprecated: Use call instead
    stream	Create a service or function stream
    health	Query the health of a service
    stats	Query the stats of a service
    list	List items in registry
    register	Register an item in the registry
    deregister	Deregister an item in the registry
    get		Get item from registry
    proxy	Run the micro proxy
    new		Create a new micro service by specifying a directory path relative to your $GOPATH
    web		Run the micro web app
```

{% include links.html %}
