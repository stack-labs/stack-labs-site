---
order: 2
title: 框架特性【编写中】
---

Stack 生态系统基于原 Micro 能力发展，但是目前还是有很多事要做。

本页面会一直保持更新最重要的或者值得一提的特性。

- [框架](https://github.com/stack-labs/stack-rpc) 用于编写微服务
- [插件集](https://github.com/stack-labs/stack-rpc-plugins) 集成第三方能力、服务
- [示例](https://github.com/stack-labs/stack-rpc-tutorials) 演示使用 Stack 的方法

## [Stack](https://github.com/micro/micro)

Micro 包括了工具集用于查询和访问微服务。

- API Gateway，API 网关是独立的 http 入口。
- Web Dashboard，用于可视化管理微服务。
- CLI，命令行接口。
- Bot，面向 Slack 或 HipChat 访问微服务的工具。
- New，用于快整生成服务模板，快速开发。

## [Stack-RPC 框架](https://github.com/stack-labs/stack-rpc)

Stack RPC 可以帮你编写微服务。

- 抽象分布式系统所需的组件
- 集成服务发布、RPC、分发/订阅机制、消息编码
- 超时容错、重试机制、负载均衡
- 功能可扩展
- 可插拔的后台交换技术

## [Go Config](https://github.com/micro/go-micro/config)

Go Config 可以管理复杂的配置

- 动态管理 - 加载配置不需要重启
- 可插拔 - 可以选择从哪个源加载配置：文件、环境变量、consul。
- 可合并 - 针对多个配置源可以合并并重写。
- 回退 - 可以指定当 key 不存在时设置值。
- 可观察 - 可以查看配置的变动。

## [Go Plugins](https://github.com/micro/go-plugins)

- go-micro 与 micro 的插件集
- 包含了绝大多数的后端技术
- grpc, kubernetes, etcd, kafka 等等
- 经过生产环境验证

## 相关开发

- [Kubernetes](https://github.com/micro/kubernetes)
- [Docker Compose](https://github.com/micro/micro/blob/master/.compose.yml)
