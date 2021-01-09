---
order: 1
title: Stack-RPC 框架
---

## 概览

Stack-RPC 是基于 Go 语言的微服务开发框架，提供快速构建微服务基础组件与开发工具库。开发者不再需要关注于分布式服务中基础能力，诸如注册发现、配置中心、通信协议、消息编码等等。

同时，Stack-RPC 天生基于插件化设计，开发者可以根据项目的需要将核心组件替换为合适自己运行环境的插件。

## 特性

Stack-RPC 主要有以下特性

- **服务发现（Service Discovery）** - 通过注册组件（Registry）向注册中心注册服务信息，其它服务通过从注册中心查询服务地址及其它支撑信息（如版本号、元数据、接口等）。

- **负载均衡（Load Balancing）** - 负载均衡基于**服务发现**，当我们从注册中心查询出任意多个的服务实例节点时，我们要有负载均衡机制从这些节点选出一台，请求服务。

- **消息编码（Message Encoding）** - 服务之间通信需要对称编码格式，彼此才能进行编/解码。

- **Request/Response** - 同步请求，也即远程过程调用 RPC

- **异步消息（Async Messaging）** - 异步消息

- **可插拔接口（Pluggable Interfaces）** - 各大组件都支持替换插拔

## 组件架构

【编写中】

```yaml
- service - name - id - server - ${service.id}-server - client - ${service.id}-client - registry - config - logger
```
