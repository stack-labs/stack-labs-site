---
order: 25
title: Proxy
---

# micro proxy

**micro proxy** 其实就是服务与服务之间如果不方便直接调用时，就可能通过 proxy 服务来调用另一方的接口。

<img src="../images/proxy.svg" />

## 概览

Micro proxy 提供基于 go-micro 框架的代理服务。它把 go-micro 中的各种特性组成一个本地化的服务，并且支持把需要的特性转到其上，比如服务发现、负载均衡、容错、插件化、包装器等等。我们并不需要给把每个 go-micro 服务都升级以满足底层框架所要求的种种东西，只需要通过代理即可，而其它语言就只用实现很轻的客户端而不用实现所有特性就能调用服务。

## 使用方法

### 安装

```shell
go get -u github.com/micro/micro
```

### 依赖

代理基于 go-micro 开发，也就是说它是依赖服务发现的。

安装 Consul

```
brew install consul
consul agent -dev
```

### 运行

Micro 代理默认是运行在 8081 端口下。

启动代理：

```shell
micro proxy
```

### ACME

服务默认使用 ACME 安全协议

```
MICRO_ENABLE_ACME=true micro proxy
```

可以选择性配置主机白名单

```
MICRO_ENABLE_ACME=true MICRO_ACME_HOSTS=example.com,api.example.com micro proxy
```

## Proxy CLI

命令行如果要指定代理，可以像下面这样设置：

```shell
MICRO_PROXY_ADDRESS=127.0.0.1:8081 micro list services
```

```
MICRO_PROXY_ADDRESS=127.0.0.1:8081 micro call greeter Say.Hello '{"name": "john"}'
```

{% include links.html %}
