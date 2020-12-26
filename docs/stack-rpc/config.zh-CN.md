---
order: 11
title: 配置[编写中]
---

Stack 中有专门的 Config 模块负责加载框架与业务配置，支持常见的配置方式，如配置文件、配置中心等，同时支持不同源、不同文件格式之间的数据合并与渲染。

## 特性

- **动态加载** - 动态按时按需从多个资源加载配置。
- **可插拔** - 可选择从任意数量的资源中加载、合并配置，后台资源在内部被抽象成标准格式并通过编码器解码。支持环境变量、参数 flag、文件、etcd、k8s configmap 等等。
- **合并配置** - 假设指定了多个配置源，格式不限，它们会被合并划一。 这样大大简化了配置的优先级与环境的变动。
- **侦听变动** - 可以选择观测指定配置值的变动，支持配置绑定对象。
- **配置安全** - 为了避免某些情况如配置加载失败，可以配置备份指令（默认关闭），框架可以帮助在配置源读取不到时使用该备份文件作为配置项启动。

## 快速开始

- [配置 Stack 服务](#配置Stack服务)
- [业务配置的使用](#业务配置的使用)
- [加载配置](#加载配置)
- [读取全部配置](#读取全部配置)
- [读取指定配置](#读取指定配置)
- [监控配置](#监控配置)
- [使用多数据源](#使用多数据源)

### 配置 Stack 服务

Stack 推荐使用 yml 作为配置格式，并且我们定义了标准的框架配置文件：[**stack.yml**](https://github.com/stack-labs/stack-rpc/blob/master/cmd/stack.yml)，文件中有详细每个字段的备注。

> yml 结构层次比 JSON、XML、properties 等更加简洁，且支持注释，故而我们推荐 yml。其它常见格式如：JSON、toml 等也是支持的，但需要自行启动时增加--config 指令声明。

默认情况下，程序会加载运行目录的**stack.yml**文件：

```bash
├── file.go
└── stack.yml
```

如果因为团队风格限制，可选择使用启动命令**config=/path/to/stack.yml**指定配置所在位置：

```
$ go run main.go --config=/path/to/stack.yml
```

使用示例：[StackYmlDemo](https://github.com/stack-labs/stack-rpc-tutorials/tree/master/examples/config/file)

我们拿纯代码编写应用与配置辅助声明的区别：

纯代码的方式：

**main.go**

```golang
	service := stack.NewService(
		stack.Name("stack.rpc.greeter"),
        stack.Address(":8090")
		stack.Logger(slogrus.NewLogger()),
	)
	service.Init()

	// ...

	if err := service.Run(); err != nil {
		logger.Error(err)
	}
```

上面的服务声明了服务名为"stack.rpc.greeter"，端口为":8090"，"slogrus"

如果我们使用配置来辅助，那代码量将会少很多，且灵活性更强，本地调试也更方便：

**main.go**

```golang
	service := stack.NewService()
	service.Init()
	if err := service.Run(); err != nil {
		logger.Error(err)
	}
```

配置为：

**stack.yml**

```yml
stack:
  server:
    name: stack.rpc.greeter
    address: :8090
  logger:
    name: slogrus
```

通过配置来声明后，服务启动只需要一些模板代码，业务稍作封装会更少。

> 不一定要放到 stack.yml 中，放到其它配置源，也是可以的。

### 业务配置的使用

新增配置（直接使用默认的配置对象也可）

```go
import "github.com/micro/go-micro/v2/config"

conf := config.NewConfig()
```

### 加载配置

加载文件配置，文件的扩展名即为配置的格式。

```go
import (
	"github.com/micro/go-micro/v2/config"
)

// Load json config file
config.LoadFile("/tmp/config.json")
```

也可以是其它如 yaml、toml 或者 xml，看适当情况使用。

```go
// Load yaml config file
config.LoadFile("/tmp/config.yaml")
```

如果没有扩展名时，则指定编码器

```go
import (
	"github.com/micro/go-micro/v2/config"
	"github.com/micro/go-micro/v2/config/source/file"
)

enc := toml.NewEncoder()

// Load toml file with encoder
config.Load(file.NewSource(
        file.WithPath("/tmp/config"),
	source.WithEncoder(enc),
))
```

### 读取全部配置

读取全部配置

```go
// retrieve map[string]interface{}
conf := config.Map()

// map[cache:map[address:10.0.0.2 port:6379] database:map[address:10.0.0.1 port:3306]]
fmt.Println(conf["hosts"])
```

将配置写入结构

```go
type Host struct {
        Address string `json:"address"`
        Port int `json:"port"`
}

type Config struct{
	Hosts map[string]Host `json:"hosts"`
}

var conf Config

config.Scan(&conf)

// 10.0.0.1 3306
fmt.Println(conf.Hosts["database"].Address, conf.Hosts["database"].Port)
```

### 读取指定配置

如果将配置写入结构

```go
type Host struct {
	Address string `json:"address"`
	Port int `json:"port"`
}

var host Host

config.Get("hosts", "database").Scan(&host)

// 10.0.0.1 3306
fmt.Println(host.Address, host.Port)
```

读取独立的值

```go
// 获取address值，缺省值使用 “localhost”
address := config.Get("hosts", "database", "address").String("localhost")

// 获取port值，缺省值使用 3000
port := config.Get("hosts", "database", "port").Int(3000)
```

### 监控配置

观测目录的变化。当文件有改动时，新值便可生效。

```go
w, err := config.Watch("hosts", "database")
if err != nil {
	// do something
}

// wait for next value
v, err := w.Next()
if err != nil {
	// do something
}

var host Host

v.Scan(&host)
```

### 使用多数据源

多资源可以加载并合并，合并优先级顺序则是反向的，即后面导入的优先级高。

```go
config.Load(
	// base config from env
	env.NewSource(),
	// override env with flags
	flag.NewSource(),
	// override flags with file
	file.NewSource(
		file.WithPath("/tmp/config.json"),
	),
)
```

### 设置源编码器

资源需要编码器才能将配置编码与解码成所需的 changeset 格式。

默认编码器是 JSON 格式，也可以使用 yaml、xml、toml 等选项。

```go
e := yaml.NewEncoder()

s := consul.NewSource(
	source.WithEncoder(e),
)
```

### 增加读编码器

Reader 使用各种编码器来解码不同格式源的数据。

默认的 Reader 支持 json、yaml、xml、toml、hcl，合并配置后会把其转成 json 格式。

也可指定给其特定的编码器：

```go
e := yaml.NewEncoder()

r := json.NewReader(
	reader.WithEncoder(e),
)
```

## 常见问题

### 与 Viper 有哪些不同？

[Viper](https://github.com/spf13/viper)与 go-config 都着力解决同样的问题，只是 Go-confi 使用不同的接口，并且它是 micro 工具生态中的一员。

### Encoder 和 Reader 有什么不同？

Encoder 编码器负责的是后台资源数据的编解码工作。而 Reader 则使用不同的 encoder 解码，解码的配置源可能有不同的格式，而这些 encoder 会解决这个事情并合并成单一编码格式。

如果是文件资源，则配置的解码器取决于文件的扩展名。

如果是基于 consul 的配置、etcd 或类似的键值对资源，则可能会从前缀中带有多个键（特定规则）的加载，也就是说资源需要明白编码，才能返回单一的变更集。

如果是环境变量、参数 flag，则会把这些值编码成 byte 数组，指定格式以备 reader 合并。

### 为什么 changeset 变更集不是 map[string]interface{}的格式？

总有配置源数据不是键值对的情况，而 byte 数组的方式再解码给 Reader 更简单些。
