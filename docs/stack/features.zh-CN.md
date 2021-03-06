---
order: 2
title: 框架特性【编写中】
---

Stack 生态系统基于原 Micro 能力发展，但是目前还是有很多事要做。

本页面会一直保持更新最重要的或者值得一提的特性。

- [框架](https://github.com/stack-labs/stack) 用于编写微服务
- [插件集](https://github.com/stack-labs/stack/blob/master/plugin) 集成第三方能力、服务
- [示例](https://github.com/stack-labs/stack/blob/master/examples) 演示使用 Stack 的方法

## [Stack 框架](https://github.com/stack-labs/stack)

StackRPC 可以帮你快速编写微服务。

- 包含分布式系统所需的组件，服务注册、均衡、编码、通信等
- 集成服务发布、RPC、异步消息（订阅/分发）
- 可扩展的超时容错、重试机制、负载均衡接口
- 可扩展的配置中心设置接口
- 组件可插拔，最大化、最灵活支持不同团队技术背景

## [StackCtl](https://github.com/stack-labs/stack/tree/master/util/stackctl)

StackCtl 包括了工具集用于查询和访问微服务。

- **new**，用于快整生成服务模板，快速开发
- **service**，todo，通过命令行查询服务注册信息
- **list**，todo，通过命令行查询服务列表
- **call**，todo，通过命令行调用指定服务
- **stream**，todo，通过命令行调用指定服务的 Stream 流式接口
- **kill**，todo，通过命令行关闭某个服务
- **deregister**，todo，通过命令行卸载某个服务
- **register**，todo，通过命令行注册某个服务

## [StackWay](https://github.com/stack-labs/stack/blob/master/service/stackway)

StackWay 是 StackRPC 的网关，专业代理 RPC 后台应用，暴露出 HTTP 接口

- 支持 HTTP 请求转 RPC
- 支持 HTTP 请求转异步（Event）
- 支持 HTTP、WebSocket 反向代理

## [StackPlatform](https://github.com/stack-labs/stack/blob/master/service/stackway)

todo StackPlatform 是 StackRPC 的 Web 管理后台

- 与 StackCtl 对称的 Web 管理功能

## [Stack-Plugins](https://github.com/stack-labs/stack/blob/master/plugin)

- Stack 的插件集
- 包含了 grpc, kubernetes, etcd, kafka 等等
