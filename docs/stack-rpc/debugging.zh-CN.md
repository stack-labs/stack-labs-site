---
order: 7
title: Debug
---

Go-micro 支持设置日志打印级别以及采集运行概要。

## 打印日志

调整日志级别

```go
MICRO_LOG_LEVEL=debug go run main.go
```

目前日志支持的级别：

```
trace
debug
error
info
```

## Profiling 运行概要

支持激活 Go pprof 采集运行概要

```go
MICRO_DEBUG_PROFILE=true go run main.go
```

该变量会激活 cpu 及内存 heap 运行的信息到 **/tmp/[service name].[service version].{cpu, mem}.pprof**中。
