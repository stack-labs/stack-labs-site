---
order: 23
title: Go Micro插件
---

Micro 是可插拔的工具库与框架，在[go-plugins](https://github.com/micro/go-plugins)中您可以随意根据需要替换需要的插件。

micro 工具集有独立的插件接口，查看[micro/plugin](https://github.com/micro/micro/tree/master/plugin)了解更多。

下面是 go-micro 插件使用方式。

## 使用方式

go-micro 中插件可以通过下面几种方式使用，可以通过命令行参数或者环境变量。

在 Golang 中引用插件代码，然后调用`service.Init`方法就会解析命令行、环境变量。

```go
import (
	"github.com/micro/go-micro/v2"
	_ "github.com/micro/go-plugins/broker/rabbitmq"
	_ "github.com/micro/go-plugins/registry/kubernetes"
	_ "github.com/micro/go-plugins/transport/nats"
)

func main() {
	service := micro.NewService(
		// Set service name
		micro.Name("my.service"),
	)

	// Parse CLI flags
	service.Init()
}
```

### 参数标识

您可以像下面这样声明参数标记：

```shell
go run service.go --broker=rabbitmq --registry=kubernetes --transport=nats
```

### 环境变量

在启动应用前声明环境变量：

```
MICRO_BROKER=rabbitmq \
MICRO_REGISTRY=kubernetes \
MICRO_TRANSPORT=nats \
go run service.go
```

### 其它选项

在创建新服务前引入并设置选项：

```go
import (
	"github.com/micro/go-micro/v2"
	"github.com/micro/go-plugins/registry/kubernetes"
)

func main() {
	registry := kubernetes.NewRegistry() // a default to using env vars for master API

	service := micro.NewService(
		// Set service name
		micro.Name("my.service"),
		// Set service registry
		micro.Registry(registry),
	)
}
```

## 构建

不提倡直接在`main.go`文件中加入插件代码这种反模式的方式，推荐创建新的插件文件来引用插件。这样就可以自动构建插件并且插件与主逻辑分离。

创建新的文件，plugins.go，并引入需要的插件

```go
package main

import (
	_ "github.com/micro/go-plugins/broker/rabbitmq"
	_ "github.com/micro/go-plugins/registry/kubernetes"
	_ "github.com/micro/go-plugins/transport/nats"
)
```

重新带上 plugins.go 构建成二进制文件

```shell
go build -o service main.go plugins.go
```

然后在启动时声明环境变量，变量会被加入的插件识别并使用

```shell
MICRO_BROKER=rabbitmq \
MICRO_REGISTRY=kubernetes \
MICRO_TRANSPORT=nats \
service
```

## 重新构建工具

如果想集成插件，那您只需要把插件引入单独的文件中，然后重新构建即可。

创建 plugins.go，引入插件

```go
import (
        // etcd v3 registry
        _ "github.com/micro/go-plugins/registry/etcdv3"
        // nats transport
        _ "github.com/micro/go-plugins/transport/nats"
        // kafka broker
        _ "github.com/micro/go-plugins/broker/kafka"
)
```

构建二进制文件

```shell
// 本地使用
go build -i -o micro ./main.go ./plugins.go

// docker镜像
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w' -i -o micro ./main.go ./plugins.go
```

使用插件

```shell
micro --registry=etcdv3 --transport=nats --broker=kafka
```

## 源码仓库

go-micro 插件集可以在[github.com/micro/go-plugins](https://github.com/micro/go-plugins)中找到。

{% include links.html %}
