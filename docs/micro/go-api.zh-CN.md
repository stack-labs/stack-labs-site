---
order: 12
title: Go API
---

Go API 是基于服务发现驱动开发的可插拔 API 框架，旨在帮助构建强大的 API 网关。

## 概览

Go API 支持网关路由。微服务架构是把应用解耦成逻辑上的相对隔离的服务，API 网关提供单一的入口把服务的 API 统一起来。Go API 使用服务发现中定义的元数据来生成路由规则并提供与之对应的 http 服务。

<img src="https://micro.mu/docs/images/go-api.png?v=1" alt="Go API" />

运行时工具[micro api](https://micro.mu/docs/cn/api.html)便是基于 Go API 构建。

## Handler 处理器

Handler 专门用于接收并处理 HTTP 请求，为了方便，handler 使用服务方法`http.Handler`的名字来路由。

**micro api**支持以下类型的网关转发

- [`api`](#api-handler) - http 转 RPC 请求
- [`broker`](#broker-handler) - pub/sub 异步请求
- [`cloudevents`](#cloudevents-handler) - 专门处理[CloudEvent](https://github.com/cloudevents/spec)事件，并向消息总线分发消息
- [`event`](#event-handler) - 处理任意的 http 请求并向消息总线分发消息。
- [`http`](#http-handler) - 处理 http 请求并转向反向代理。
- [`registry`](#registry-handler) - http 注册
- [`rpc`](#rpc-handler) - 处理 json 及 protobuf 格式的 POST 请求，并转向 RPC。
- [`web`](#web-handler) - 包含 web socket 的 http 反向代理。

## API Handler

API Handler 是默认的处理器，负责把内部的 RPC 服务对外暴露成 http 接口，它接收并处理 http 请求，再转成 RPC 请求转向具体服务，最后返回 RPC 服务的响应结果。

- Content-Type: 所有类型
- Body: 任务类型
- Forward Format: [api.Request](https://github.com/micro/go-micro/blob/master/api/proto/api.proto#L11)/[api.Response](https://github.com/micro/go-micro/blob/master/api/proto/api.proto#L21)
- Path: `/[service]/[method]`
- Resolver: 请求解析器，路径会被解析成服务与方法

## Broker Handler

broker handler Pub/Sub 订阅分发处理器，将内部的 Pub/Sub 服务接口对外暴露成 Http 接口，接收 http 请求，并根据参数指向的主题发送消息。

- Content-Type: Any
- Body: Any
- Forward Format: HTTP
- Path: `/`
- Resolver: 订阅主题通过 query 请求参数指定

## CloudEvents Handler

云事件处理器提供 HTTP 入口，并把收到的请求转成[CloudEvent](https://github.com/cloudevents/spec)消息通过消息总线的`go-micro/client.Publish`方法传出去。

- Content-Type: Any
- Body: Any
- Forward Format: 请求会按照[CloudEvents](https://github.com/cloudevents/spec)格式化
- Path: `/[topic]`
- Resolver: 请求路径会用来解析主题

## Event Handler

事件处理器提供 HTTP 入口，把请求转成消息调用`go-micro/client.Publish`方法通过消息总线发送出去。

- Content-Type: Any
- Body: Any
- Forward Format: 请求会按照[go-api/proto.Event](https://github.com/micro/go-api/blob/master/proto/api.proto#L28L39)格式化
- Path: `/[topic]/[event]`（可以看到与 CloudEvents 的不同）
- Resolver: 请求路径会用来解析主题及事件名

## HTTP Handler

Http 处理器是 HTTP 的反向代理，其内置有服务发现。

- Content-Type: Any
- Body: Any
- Forward Format: 反向代理
- Path: `/[service]`
- Resolver: 请求路径会用来解析服务名

## Registry Handler

注册处理器接收 HTTP 请求，它负责 go-micro 的注册接口请求

- Content-Type: Any
- Body: JSON
- Forward Format: HTTP
- Path: `/`
- Resolver: 获取服务，注册与卸载服务分别通过 GET, POST, DELETE 请求处理。

## RPC Handler

RPC 处理器接收 JSON 或 protobuf 的 HTTP 请求，并转成 RPC 请求向前转发。

- Content-Type: `application/json` or `application/protobuf`
- Body: JSON 或者 Protobuf
- Forward Format: json-rpc 或 proto-rpc，根据请求内容决定
- Path: `/[service]/[method]`
- Resolver: 请求路径会用来解析服务名与方法名

## Web Handler

web 处理器职责是反向代理，它内置服务发现，并支持 web socket。

- Content-Type: Any
- Body: Any
- Forward Format: 反向代理且支持 web socket
- Path: `/[service]`
- Resolver: 请求路径会用来解析服务名

{% include links.html %}
