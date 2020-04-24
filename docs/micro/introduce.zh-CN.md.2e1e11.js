(window.webpackJsonp=window.webpackJsonp||[]).push([[196],{3215:function(o,e){o.exports={content:["article",["p","Go-Micro 微服务开发框架"],["h2","概览"],["p","Go Micro提供分布式系统开发的核心库，包含RPC与事件驱动的通信机制。"],["p",["strong","micro"],"的设计哲学是可插拔的架构理念，她提供可快速构建系统的组件，并且可以根据自身的需求剥离默认实现并自行定制。"],["h2","特性"],["p","Go-Micro 主要有以下特性"],["ul",["li",["p",["strong","服务发现（Service Discovery）"]," - 通过注册组件（Registry）向注册中心注册服务信息，其它服务通过从注册中心查询服务地址及其它支撑信息（如版本号、元数据、接口等）。"]],["li",["p",["strong","负载均衡（Load Balancing）"]," - 负载均衡基于",["strong","服务发现"],"，当我们从注册中心查询出任意多个的服务实例节点时，我们要有负载均衡机制从这些节点选出一台，请求服务。"]],["li",["p",["strong","消息编码（Message Encoding）"]," - 服务之间通信需要对称编码格式，彼此才能进行编/解码。"]],["li",["p",["strong","Request/Response"]," - 同步请求，也即远程过程调用RPC"]],["li",["p",["strong","异步消息（Async Messaging）"]," - 异步消息"]],["li",["p",["strong","可插拔接口（Pluggable Interfaces）"]," - 各大组件都支持替换插拔"]]]],meta:{order:0,title:"Go-Micro 框架",filename:"docs/micro/introduce.zh-CN.md"},toc:["ul",["li",["a",{className:"bisheng-toc-h2",href:"#概览",title:"概览"},"概览"]],["li",["a",{className:"bisheng-toc-h2",href:"#特性",title:"特性"},"特性"]]]}}}]);