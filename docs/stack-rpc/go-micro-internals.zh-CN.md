---
order: 16
title: Go Micro 架构
---

Go Micro 是一个可插拔的 RPC 框架，用于分布式系统的开发。

<p align="center">
  <img src="../images/go-micro.svg" />
</p>

## 特性

Go Micro 把分布式系统的各种细节抽象出来。下面是它的主要特性。

- **服务发现（Service Discovery）** - 自动服务注册与名称解析。
- **负载均衡（Load Balancing）** - 在服务发现之上构建了智能的负载均衡机制
- **同步通信（Synchronous Comms）** - 基于 RPC 的通信，支持双向流。
- **异步通信（Asynchronous Comms）** - 内置发布/订阅的事件驱动架构
- **消息编码（Message Encoding）** - 基于 content-type 的动态编码，支持 protobuf、json，开箱即用。
- **服务接口（Service Interface）** - 所有特性都被打包在简单且高级的接口中，方便开发微服务。

Go Micro 支持服务与函数式编程模型。继续往下看了解更多。

## 相关插件

Go Micro 旨在使用接口达到让其抽象化。因此，内部的实现可以被抽离出来。

我们提供了一些默认的完整的开箱即用的插件。

- Consul 或 mDNS，用于服务发现
- Random hashed client side load balancing，哈希随机客户端负载均衡
- JSON-RPC 1.0 及 PROTO-RPC 的消息编码
- HTTP，基于 HTTP 的通信机制

## 示例

服务示例可查看[**examples/service**](https://github.com/micro/examples/tree/master/service)。 Function 可查看[**examples/function**](https://github.com/micro/examples/tree/master/function)。

[**examples**](https://github.com/micro/examples)的 Github 目录下包含了各种示例，比如中间件/包装器，选择过滤器，发布/订阅，gRPC，插件等。

greeter 示例的完整代码[**examples/greeter**](https://github.com/micro/examples/tree/master/greeter)。

所有的示例都可以在 GitHub 仓库中找到。

观看[Golang 英国会议 2016](https://www.youtube.com/watch?v=xspaDovwk34)视频，获得更高级的视角。

## 相关包

Go micro 由下面的几个包组成

- **transport** 用于同步消息
- **broker** 用于异步消息
- **codec** 用于消息编码
- **registry** 用于服务发现
- **selector** 用于负载均衡
- **client** 用于发送请求
- **server** 用于处理请求

下面进一步介绍

### 注册（Registry）

注册提供了服务发现机制来解析服务名到地址上。它可以使用 Consul、etcd、zookeeper、dns、gossip 等等提供支持。服务使用启动注册关机卸载的方式注册。服务可以选择性提供过期 TTL 和定时重注册来保证服务在线，以及在服务不在线时把它清理掉。

### 选择器（Selector）

选择器是构建在注册这上的负载均衡抽象。它允许服务被过滤函数过滤掉不提供服务，也可以通过选择适当的算法来被选中提供服务，算法可以是随机、轮询（客户端均衡）、最少链接（leastconn）等等。选择器通过客户端创建语法时发生作用。客户端会使用选择器而不是注册表，因为它提供内置的负载均衡机制。

### 传输（Transport）

Transport 是服务与服务之间同步请求/响应的通信接口。和 Golang 的 net 包类似，但是提供更高级的抽象，请允许我们可以切换通信机制，比如 http、rabbitmq、websockets、NATs。传输也支持双向流，这一强大的功能使得客户端可以向服务端推送数据。

### 代理（Broker）

Broker 提供异步通信的消息发布/订阅接口。对于微服务系统及事件驱动型的架构来说，发布/订阅是基础。一开始，默认我们使用收件箱方式的点到点 HTTP 系统来最小化依赖的数量。但是，在 go-plugins 是提供有消息代理实现的，比如 RabbitMQ、NATS、NSQ、Google Cloud Pub Sub 等等。

### 编码（Codec）

编码包用于在消息传输到两端时进行编码与解码，可以是 json、protobuf、bson、msgpack 等等。与其它编码方式不同，我们支持 RPC 格式。所以我们有 JSON-RPC、PROTO-RPC、BSON-RPC 等格式。

编码包把客户端与服务端的编码隔离开来，并提供强大的方法来集成其它系统，比如 gRPC、Vanadium 等等。

### Server（服务端）

Server 包是使用编写服务的构建包，可以命名服务，注册请求处理器，增加中间件等等。服务构建在以上说的包之上，提供独立的接口来服务请求。现在服务的构建是 RPC 系统，在未来可能还会有其它的实现。服务端允许定义多个不同的编码来服务不同的编码消息。

### Client（客户端）

客户端提供接口来创建向服务端的请求。与服务端类似，它构建在其它包之上，它提供独立的接口，通过注册中心来基于名称发现服务，基于选择器（selector）来负载均衡，使用 transport、broker 处理同步、异步消息。

上面的这些组件都可以在 micro 中，从更高的角度看成是**服务（Service）**

## 内部机制

下面是说明一下核心功能是如何工作的

### service.Run()

Go-micro 服务通过调用 service.Run()启动。

1. 执行在启动之前的函数


        for _, fn := range s.opts.BeforeStart {
                if err := fn(); err != nil {
                        return err
                }
        }

2. 启动服务


        if err := s.opts.Server.Start(); err != nil {
                return err
        }

3.  在服务发现中心注册服务

        if err := s.opts.Server.Register(); err != nil {
                return err
        }

4)  执行在启动之后的函数

        for _, fn := range s.opts.AfterStart {
                if err := fn(); err != nil {
                        return err
                }
        }

### server.Start()

server.Start 会被 service.Run 调用

1.  调用 transport.Listen 侦听连接

        ts, err := config.Transport.Listen(config.Address)
        if err != nil {
                return err
        }

2.  调用 transport.Accept 接受连接

        go ts.Accept(s.accept)

3.  调用 broker.Connect 开始连接消息代理

        config.Broker.Connect()

4.  等待退出信息，关掉 transport，断掉 broker 链接。

        go func() {
                // wait for exit
                ch := <-s.exit

                // wait for requests to finish
                if wait(s.opts.Context) {
                        s.wg.Wait()
                }

                // close transport listener
                ch <- ts.Close()

                // disconnect the broker
                config.Broker.Disconnect()
        }()

## 如何编写服务

查看[编写 Go 服务](cn/writing-a-go-service.html)
