---
order: 29
title: 运行时插件
---

Micro 支持通过插件将外部代码嵌入到 Micro 运行时中。不过需要注意的是，它与 go-micro 的插件不同，micro 运行时插件只是为了运行时而生。通过插件我们也可以增加需要的 flag、命令和 http 接口。

## 插件如何生效

在**micro/plugin**下我们组装有全局插件管理器（global plugin manager），它由所有插件组成，并且会用到整个 micro 运行时中。通过调用`plugin.Register`方法注册插件。

每个组件（如 api、web、proxy、cli、bot）都也有其各自的插件管理器，所以它们的插件都只在其所属组件内产生影响并运行。可以通过调用`api.Register`， `web.Register`等等注册。

**micro/plugin/plugin.go**

```go
// Plugin is the interface for plugins to micro. It differs from go-micro in that it's for
// the micro API, Web, Proxy, CLI. It's a method of building middleware for the HTTP side.
type Plugin interface {
	// Global Flags
	Flags() []cli.Flag
	// Sub-commands
	Commands() []cli.Command
	// Handle is the middleware handler for HTTP requests. We pass in
	// the existing handler so it can be wrapped to create a call chain.
	Handler() Handler
	// Init called when command line args are parsed.
	// The initialised cli.Context is passed in.
	Init(*cli.Context) error
	// Name of the plugin
	String() string
}

// Manager is the plugin manager which stores plugins and allows them to be retrieved.
// This is used by all the components of micro.
type Manager interface {
        Plugins() map[string]Plugin
        Register(name string, plugin Plugin) error
}

// Handler is the plugin middleware handler which wraps an existing http.Handler passed in.
// Its the responsibility of the Handler to call the next http.Handler in the chain.
type Handler func(http.Handler) http.Handler
```

## 如何使用

下面我们演示通过自定义 flag 并打印其值来演示如何使用插件

### 创建文件

在项目程序根目录下创建**plugin.go**文件，与**main.go**同级。

```go
package main

import (
	"log"
	"github.com/micro/cli"
	"github.com/micro/micro/plugin"
)

func init() {
	plugin.Register(plugin.NewPlugin(
		plugin.WithName("example"),
		plugin.WithFlag(cli.StringFlag{
			Name:   "example_flag",
			Usage:  "This is an example plugin flag",
			EnvVar: "EXAMPLE_FLAG",
			Value: "avalue",
		}),
		plugin.WithInit(func(ctx *cli.Context) error {
			log.Println("Got value for example_flag", ctx.String("example_flag"))
			return nil
		}),
	))
}
```

### 编译代码

```shell
go build -o micro ./main.go ./plugin.go
```

## 仓库

运行时工具集插件可以在[go-plugins/micro](https://github.com/micro/go-plugins/tree/master/micro)中查看。

{% include links.html %}
