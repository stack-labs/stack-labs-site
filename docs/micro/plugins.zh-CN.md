---
order: 36
title: 插件库
---

Micro 架构中所有工具都可插拔，也即是说内在实现都是可以剥离出来。

Go-Micro 和 Micro 工具集的插件是各自独立的，可以在导航栏里查看更多的相关信息。

## 几个例子

### Go Micro

- [Etcd Registry](https://github.com/micro/go-plugins/tree/master/registry/etcd) - 基于 Etcd 服务注册发现插件
- [K8s Registry](https://github.com/micro/go-plugins/tree/master/registry/kubernetes) - 基于 k8s 的服务注册发现插件
- [Kafka Broker](https://github.com/micro/go-plugins/tree/master/broker/kafka) - Kafka 消息代理（broker）

### Micro Toolkit

- [Router](https://github.com/micro/go-plugins/tree/master/micro/router) - 可配置的 http 路由、代理
- [AWS X-Ray](https://github.com/micro/go-plugins/tree/master/micro/trace/awsxray) - 基于 AWS X-Ray 集成的链路追踪
- [IP Whitelite](https://github.com/micro/go-plugins/tree/master/micro/ip_whitelist) - IP 白名单插件

## 仓库

相关开源的插件可在 github 中找到[github.com/micro/go-plugins](https://github.com/micro/go-plugins)。
