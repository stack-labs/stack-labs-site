---
order: 13
title: Go Config 配置库
---

Go Config 作为配置库，它也是动态的可插拔的。

大多数的应用配置都是放在静态文件中或者用复杂的逻辑从不同的文件中加载。

Go-config 就简单得多，可插拔且可合并。

## 特性

- **动态加载** - 动态按时按需从多资源加载配置。Go Config 会在后台监视配置资源，动态在内存中合并、更新。

- **可插拔资源** - 可选择从任意数量的资源中加载、合并配置，后台资源在内部被抽象成标准格式并通过编码器解码。资源可以是环境变量、参数 flag、文件、etcd、k8s configmap 等等。

- **可合并配置** - 假设指定了多个配置源，格式不限，它们会被合并划一。 这样大大简化了配置的优先级与环境的变动。

- **观察变动** - 可以选择观测指定配置值的变动。使用 Go Config 观测器热加载，可以随时查看配置值的变动情况。

- **安全修复** - 某些情况如配置加载失败或者被擦除时，可以指定回退值。这可以保证在发生事故时，我们能读取完整的默认值。

## 开始

- [Source](#source) - 后台获取加载的位置
- [Encoder](#encoder) - 负责处理资源配置编码、解码
- [Reader](#reader) - 将多个编码处理后的资源合并成单一的格式
- [Config](#config) - 配置管理器，负责管理多资源
- [Usage](#usage) - go-config 使用示例
- [FAQ](#faq) - 常见问题及回答
- [TODO](#todo) - 将来要开发的任务或特性

## Sources

`Source`也即后台加载的配置，同时可以使用多资源。

支持以下格式：

- [cli](https://github.com/micro/go-micro/tree/master/config/source/cli) - read from parsed CLI flags
- [consul](https://github.com/micro/go-micro/tree/master/config/source/consul) - read from consul
- [env](https://github.com/micro/go-micro/tree/master/config/source/env) - read from environment variables
- [etcd](https://github.com/micro/go-micro/tree/master/config/source/etcd) - read from etcd v3
- [file](https://github.com/micro/go-micro/tree/master/config/source/file) - read from file
- [flag](https://github.com/micro/go-micro/tree/master/config/source/flag) - read from flags
- [memory](https://github.com/micro/go-micro/tree/master/config/source/memory) - read from memory

也存在一些社区支持的插件：

- [configmap](https://github.com/micro/go-plugins/tree/master/config/source/configmap) - read from k8s configmap
- [grpc](https://github.com/micro/go-plugins/tree/master/config/source/grpc) - read from grpc server
- [runtimevar](https://github.com/micro/go-plugins/tree/master/config/source/runtimevar) - read from Go Cloud Development Kit runtime variable
- [url](https://github.com/micro/go-plugins/tree/master/config/source/url) - read from URL
- [vault](https://github.com/micro/go-plugins/tree/master/config/source/vault) - read from Vault server

TODO:

- git url

### ChangeSet 变更集

Sources 以变更集的方式返回配置。对于多个后台配置，变更集是单一的内部抽象。

```go
type ChangeSet struct {
	// Raw encoded config data
	Data      []byte
	// MD5 checksum of the data
	Checksum  string
	// Encoding format e.g json, yaml, toml, xml
	Format    string
	// Source of the config e.g file, consul, etcd
	Source    string
	// Time of loading or update
	Timestamp time.Time
}
```

## Encoder

`Encoder`负责资源配置编码、解码。后台资源可能会存在不同的格式，编码器负责处理不同的格式，默认的格式是 Json。

编码器支持以下格式：

- json
- yaml
- toml
- xml
- hcl

## Reader

`Reader`负责把多个 changeset 集合并成一个可查询的值集。

```go
type Reader interface {
	// Merge multiple changeset into a single format
	Merge(...*source.ChangeSet) (*source.ChangeSet, error)
	// Return return Go assertable values
	Values(*source.ChangeSet) (Values, error)
	// Name of the reader e.g a json reader
	String() string
}
```

Reader 复用 Encoder 编码器将 changeset 集解码成`map[string]interface{}`格式，然后将它们合成一个 changeset。它通过格式来确定使用哪个解码器。合成的 changeset 中的`Values`可以转成 Go 类型值，而如果有值不能加载时，其中的值也可以作为回退值使用。

```go

// Values is returned by the reader
type Values interface {
	// Return raw data
        Bytes() []byte
	// Retrieve a value
        Get(path ...string) Value
	// Return values as a map
        Map() map[string]interface{}
	// Scan config into a Go type
        Scan(v interface{}) error
}
```

`Value`接口支持使用构建、类型断言转化成 go 类型的值，默认使用回退值。

```go
type Value interface {
	Bool(def bool) bool
	Int(def int) int
	String(def string) string
	Float64(def float64) float64
	Duration(def time.Duration) time.Duration
	StringSlice(def []string) []string
	StringMap(def map[string]string) map[string]string
	Scan(val interface{}) error
	Bytes() []byte
}
```

## Config

`Config`管理所有配置、抽象后的资源、编码器及 reader。

读取、同步、监视多个后台资源，把资源合并成单一集合以供查询。

```go

// Config is an interface abstraction for dynamic configuration
type Config interface {
        // provide the reader.Values interface
        reader.Values
	// Stop the config loader/watcher
	Close() error
	// Load config sources
	Load(source ...source.Source) error
	// Force a source changeset sync
	Sync() error
	// Watch a value for changes
	Watch(path ...string) (Watcher, error)
}
```

## 使用方式

- [简单示例](#简单示例)
- [新增配置实例](#新增配置实例)
- [加载配置](#加载配置)
- [读取全部配置](#读取全部配置)
- [读取指定配置](#读取指定配置)
- [监控配置](#监控配置)
- [使用多数据源](#使用多数据源)
- [设置源编码器](#设置源编码)
- [增加读编码器](#增加读编码)

### 简单示例

配置文件可以是 Encoder 解码器支持的任何格式：

JSON json config:

```json
{
  "hosts": {
    "database": {
      "address": "10.0.0.1",
      "port": 3306
    },
    "cache": {
      "address": "10.0.0.2",
      "port": 6379
    }
  }
}
```

### 新增配置实例

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
