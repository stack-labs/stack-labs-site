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

- [服务配置](#服务配置)
- [业务配置](#业务配置)
- [读取配置](#读取配置)
- [侦听变动](#侦听变动)
- [本地备份](#本地备份)
- [使用多数据源](#使用多数据源)

## 服务配置

Stack 推荐使用 yml 作为配置格式，并且我们定义了标准的框架配置文件：[**stack.yml**](https://github.com/stack-labs/stack/blob/master/service/config/stack.yml)，文件中有详细每个字段的备注。

> yml 结构层次比 JSON、XML、properties 等更加简洁，且支持注释，故而我们推荐 yml。其它常见格式如：JSON、toml 等也是支持的，但需要自行启动时增加--config 指令声明。

默认情况下，程序会加载运行目录的**stack.yml**文件：

```bash
├── main.go
└── stack.yml
```

如果因为团队风格限制，可选择使用启动命令**config=/path/to/stack.yml**指定配置所在位置：

```
$ go run main.go --config=/path/to/stack.yml
```

使用示例：[StackYmlDemo](https://github.com/stack-labs/stack/tree/master/examples/config/file)

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

上面的服务声明了服务名为"stack.rpc.greeter"，端口为":8090"，日志引擎为"slogrus"

如果我们使用配置来辅助，那代码量将会少很多，且灵活性更强，本地调试也更方便：

**main.go**

```golang
	service := stack.NewService()
	service.Init()

	// ...

	if err := service.Run(); err != nil {
		logger.Error(err)
	}
```

配置为：

**stack.yml**

```yaml
stack:
  server:
    name: stack.rpc.greeter
    address: :8090
  logger:
    name: slogrus
```

通过配置来声明后，服务启动只需要一些模板代码，业务稍作后封装会更少。

> 不一定要放到 stack.yml 中，放到其它配置源，也是可以的。

## 业务配置

上面我们简单介绍了 Stack 自有属性配置的使用，接下来我们介绍业务配置的接入。

业务配置的接入主要有下面几种方法：

- 在 stack.yml 中 includes
- 通过--config 指定声明配置文件
- 使用 config.Source 加入

### 在 stack.yml 中 includes

**includes**属性允许用户在与 stack.yml 同目录下放置其它配置文件

**stack.yml**

```yaml
stack:
  includes: demoA.yml, demoB.yml
```

**demoA.yml**

```yaml
demoA:
  aKey: aValue
  extra: extraValue
```

读取时可如下：

```go
	service := stack.NewService()
	service.Init()
	log.Infof("demoA used get: %s", config.Get("includeA", "demoA").String(""))
```

完整代码参考：[includes](https://github.com/stack-labs/stack/tree/master/examples/config/file/stackyml)

### 通过--config 指定声明配置文件

当用户不需要默认的配置文件时，只想加载自己的文件，则可以使用**--config**指令

**demoA.yml**

```yaml
demoA:
  aKey: aValue
  extra: extraValue
```

```shell
$go run main.go --config=demoA.yml
```

> config 指令只接受传入一个文件，不支持多文件

### 使用 config.Source 加入

**config.Source**是 Stack 中的 API，上述的使用方式本质也是在框架层面调用了这个方法把源加入到**Config**模块。

**main.go**

```go
	service := stack.NewService(
		stack.Config(config.NewConfig(config.Source(file.NewSource(file.WithPath("./source.yml"))))),
	)
	service.Init()

	log.Infof("demoA: %s", value.Source.DemoA)
```

**source.yml**

```yaml
source:
  demoA: Hello! 我是Demo
```

上面的例子我们假设了用户有一个配置文件叫**source.yml**，并加载它。完成示例参考：[source](https://github.com/stack-labs/stack/blob/master/examples/config/file/source)

## 读取配置

读取配置有两种方法

- 绑定注入
- config.Get

### 绑定注入

Stack 提供了快速绑定对象，并自动渲染的 API-**config.RegisterOptions**与配置标记 Tag（**sc**），方便开发者在应用初始化后直接使用对象的属性，而不需要手动去指定配置 Key。

> sc 的意思为：stack config

假设我们有如下业务配置结构，业务名为**includeA**，**includeB**：

```yaml
includeA:
  demoA: Hello! 我是DemoA
includeB:
  demoB: Hello! 我是DemoB
```

其对应的业务配置结构体则应该如下：

```go
// 配置的具体类型
type includeA struct {
	DemoA    string   `sc:"demoA"`
}
type includeB struct {
	DemoB    string   `sc:"demoB"`
}


// 声明一个结构，用于接受注入
type Value struct {
	IncludeA includeA `sc:"includeA"`
	IncludeB includeB `sc:"includeB"`
    // ...(其它业务结构的配置)
}
```

我们的读取代码就如下：

**main.go**

```go
    value := Value{}
    // 注册该对象，将会动态渲染该对象的值
    config.RegisterOptions(&value)
	service := stack.NewService()
	service.Init()

	log.Infof("demoA: %s", value.IncludeA.DemoA)
	log.Infof("demoB: %s", value.IncludeA.IncludeB.DemoB)
```

使用时注意结构体与配置的层级要一一匹配，否则无法渲染注入成功。

[示例参考](https://github.com/stack-labs/stack/blob/master/examples/config/file/stackyml)

### config.Get

我们依旧使用上方的业务定义，如果不想声明一个结构体来接受注入，也可以直接使用 API 读取，如下：

**main.go**

```go
	log.Infof("demoA used get: %s", config.Get("includeA", "demoA").String("这里填写默认值"))
```

**config.Get**支持常见的数据类型与默认值，参数的 Path（Key）找不到值时，那就会使用声明的默认值返回

支持的类型有：

```go
    Bool(def bool) bool
	Int(def int) int
	String(def string) string
	Float64(def float64) float64
	Duration(def time.Duration) time.Duration
	StringSlice(def []string) []string
	StringMap(def map[string]string) map[string]string
	Scan(val interface{}) error
	Bytes() []byte
```

## 侦听变动

## 本地备份

## 使用多数据源

## 支持的配置源

-> 示例跟进中

- 文件 [示例](https://github.com/stack-labs/stack/blob/master/examples/config/file)
- 配置中心
  - xconf
  - apollo [示例](https://github.com/stack-labs/stack/blob/master/examples/config/apollo)
  - stack
  - etcd
  - consul
