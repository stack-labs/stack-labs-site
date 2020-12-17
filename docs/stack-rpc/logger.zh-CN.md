---
order: 12
title: Logger
---

Stack 中的定义了轻量的日志 Logger 接口。

## 设置级别

日志级别目前支持在环境变量、配置文件中设置

- 硬编码
- 配置文件
- 环境变量
- 启动参数

四个配置方式的优先级大小为：启动参数>环境变量>配置文件>硬编码

### 硬编码

硬编码也即在代码中直接声明日志级别：

```
log.Init(log.WithLevel(log.DebugLevel))
```

示例：[HardcodeLevel](https://github.com/stack-labs/stack-rpc-tutorials/tree/master/examples/logger/level/hardcode)

### 配置文件

> 实现中

在应用启动的目录中如果有**resources**目录，则会主动加载该目录的**stack.yml**配置文件

**resources/stack.yml**

```yaml
stack:
  logger:
    level: debug
```

示例：[ConfigFileLevel](https://github.com/stack-labs/stack-rpc-tutorials/tree/master/examples/logger/level/configfile)

### 环境变量

可以通过环境变量**STACK_LOG_LEVEL**定义日志级别：

```bash
STACK_LOG_LEVEL=debug go run main.go
```

### 启动参数

参数注入也是级别最高的，可以自行初始化日志时传入级别，设置为业务需要初始默认的级别

```
go run main.go --logger_level=debug
```

## 动态级别

有时候我们需要在运行时改变日志级别，此时我们可以调用**Init**方法覆盖原有配置

```bash
import (
	"github.com/stack-labs/stack-rpc/logger"
)

func main() {
	logger.Init(logger.WithLevel(logger.DebugLevel))
	logger.Debug("hello，这是Debug级别")

    // 修改级别
	logger.Init(logger.WithLevel(logger.InfoLevel))

	logger.Debug("hello，这是Debug级别")
	logger.Info("hello，这是Info级别")
}
```

示例：[DynamicLevel](https://github.com/stack-labs/stack-rpc-tutorials/tree/master/examples/logger/level/hardcode)

## 固有字段

我们在日志打印时，有时候需要在每次打印都把固有的信息打印出来，比如当前机器 IP 等等，此时可以通过 WithFields 声明在当前上下文中：

- 全局

```go
func main() {
	logger.Init(logger.WithFields(map[string]interface{}{
		"header1": "头1",
	}))

	logger.Info("hello，这条日志带有固定字段")
}
```

```shell
2020-12-18 00:06:32  file=fields/fields.go:10 header1=头1 level=info hello，这条日志带有固定字段
```

示例：[Fields](https://github.com/stack-labs/stack-rpc-tutorials/tree/master/examples/logger/fields)

## 持久化

默认的日志输是标准输入输出(stdout)，所以是不会落盘到文件系统的，只会在控制台打印出来，如果我们需要将日志落盘持久化，那需要通过插件库中的日志插件来完成。

Stack 提供了日志持久化规范参数[PersistenceOptions](https://github.com/stack-labs/stack-rpc/blob/master/logger/options.go#L8) ：

```go
log.Persistence(&log.PersistenceOptions{
	Enable:                true,   // 是否启动持久化
	MaxFileSize:           10,     // 文件大小上限，单位：M
	MaxBackupSize:         500,    // 文件备份目录大小上限，单位：M
	MaxBackupKeepDays:     1,      // 文件储存最大期限，单位：天
	FileNamePattern:       "",     // 文件名自定义模板，暂未实现
	BackupFileNamePattern: "",     // 备份名自定义模板，暂未实现
	Dir:                   "/tmp/logs",  // 日志存储目录
	BackupDir:             "/tmp/logs/backup",  // 日志备份存储目录
}),
```

> 注：目前只支持 Logrus 插件。

## 插件

StackRPC 提供了常见的日志库集成实现

- [zap](https://github.com/stack-labs/stack-rpc-plugins/tree/master/logger/zap) 研发中
- [logrus](https://github.com/stack-labs/stack-rpc-plugins/tree/master/logger/logrus)

### Logurs

下面的示例演示了如何使用 [logrus](https://github.com/micro/go-plugins/tree/master/logger/logrus) 来覆盖默认的实现：

```go
func main() {
	service := stack.NewService(
		stack.Logger(logrus.NewLogger(
			log.WithLevel(log.TraceLevel),
			log.Persistence(&log.PersistenceOptions{
				Enable:                true,
				MaxFileSize:           10,
				MaxBackupSize:         500,
				MaxBackupKeepDays:     1,
				FileNamePattern:       "",
				BackupFileNamePattern: "",
				Dir:                   "/tmp/logs",
				BackupDir:             "/tmp/logs/backup",
			}),
			// 将不同级别切成不同文件存储
			logrus.SplitLevel(true),
		)))

	service.Init()
	service.Run()
}
```

示例：[Logrus](https://github.com/stack-labs/stack-rpc-tutorials/tree/master/examples/logger/logrus)

### 未完待续
