---
order: 5
title: 环境准备工作
---

## 安装 Go 环境

请访问[Golang](https://golang.org/dl/)下载对应环境的包，目前最高支持 1.14 版本

## 安装 protoc

*protoc*是 ProtoBuffer 跨语言通信协议的命令行工具，可以帮助我们将接口文件转译成指定语言的 API 接口源码

- Linux

```bash
$ apt install -y protobuf-compiler
# 查看版本
$ protoc --version
```

- Windows

Windows 下可使用 Github 上的[Release](https://github.com/protocolbuffers/protobuf/releases/) 包，下载后解压，打开 README.md 文件，按操作安装即可

更多资料参考：[Protoc 安装](https://grpc.io/docs/protoc-installation/)

## 安装 Protoc Go 与 Stack 插件

```bash
$ go get github.com/golang/protobuf/protoc-gen-go@v1.3.2
$ go get github.com/stack-labs/stack/util/protoc-gen-stack
```

*protoc-gen-go*帮助我们将 proto 文件转成 golang 版本的接口代码。

*protoc-gen-stack*插件则帮我将 proto 接口生成 stack 标准的接口代码。
