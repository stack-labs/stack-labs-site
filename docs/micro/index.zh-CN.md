---
order: 18
title: Micro 文档
---

在构建微服务中，Micro 希望能为大家提供平台层面、高度弹性的工具组件，让服务开发者们可以把复杂的分布式系统以简单的方式构建起来，并且尽可能让开发者使用最少的时间完成基础架构的创建。

## 概览

在 Micro 架构中，作为与其同名的运行时管理工具[Micro](https://github.com/micro/micro)就是最主要的构件。我们通过下图了解 Micro 架构：

<center>
<img src="https://micro.mu/runtime3.svg" style="width: 100%; max-width: 600px; height: auto; margin-bottom: 25px;" />
</center>

micro 由以下几个部分组成：

- **API 网关（API Gateway）：** - API Gateway 网关。API 网关是请求的入口，把请求动态路由到具体服务。网关允许我们建立可伸缩的后台微服务架构，并且让工作在前端的公共 API 更健壮。Micro API 基于服务发现拥有强大的路由能力，通过我们预置的 handlers 插件，它可以处理 http、gRPC、websocket、消息推送事件等等。

- **命令行接口（Interactive CLI）：** 交互式的命令行接口。CLI 通过终端可以描述、查询、直接与平台和服务进行交互。CLI 提供所有的命令让开发者明白微服务正在处理的事情。CLI 也包含了交互模式。

- **服务代理（Service Proxy）：** 服务代理，基于[Go Micro](https://github.com/micro/go-micro)和[MUCP 协议](https://github.com/micro/protocol)构建的透明的代理服务。它将服务发现、负载均衡、消息编码、中间件、传输及代理插件转移到某一（具体服务所在）位置，同 api 不同，它不暴露任何接口，只工作在内部环境，相当于桥接内部服务。

- **模板生成（Template Generation）：** 基于模板快速创建新的服务代码。Micor 提供预置的模板，通过模板编写统一风格的代码。

- **SlackOps 小机器人（SlackOps Bot）：** Slack 小机器人插件，当它运行中服务中时，这个插件允许开发者通过 Slack 消息来操作平台。MicroBot 插件提供聊天配置选项，这样就可以让团队通过向小机器人发送聊天消息来做一些我们希望它做的事，这里面当然也包含像动态发现服务一样创建 slack 命令。

- **管理控制台（Web Dashboard）：** 通过 Web 管理控制台，可以直接在 Web 页面上查看服务的运行情况，展示端点信息，请求与响应状态，甚至直接向服务进行查询。管理控制台也有 CLI 交互页面提供给开发者在线上处理，就像直接操作终端一样。

- **Go-micro 框架（Go Framework）：** [Go Micro](https://github.com/micro/go-micro)框架是 Micro 的底层、核心。GO-Micro 把分布式服务抽象，并提供简便的方式让大家构建具有高弹性的微服务。

## 快速上手

- 点击[go-micro](go-micro.html)了解 Go—Micro 框架。
- 通过[micro](runtime.html)查看服务。

## 相关资源

- [示例](https://github.com/micro/examples)，上面有相关如何使用 micro 的信息。
- [搜索](https://micro.mu/explore/)，使用 micro 的开源项目。
- [博客](https://micro.mu/blog/)，深入理解 micro，了解更多的服务设计思路。
- [视频](https://www.youtube.com/watch?v=xspaDovwk34) 2016 年在英国 Golong 会议上，关于 micro 的简单介绍。
- [PPT](https://speakerdeck.com/asim)，上面有一些 PPT，可供查阅。

## 相关用户

可以查看[用户列表](users.html)
