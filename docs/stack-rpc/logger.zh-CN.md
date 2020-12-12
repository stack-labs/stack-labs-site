---
order: 12
title: Logger
---

Go-Micro 中的 Logger 组件定义了日志打印的接口

## 设置级别

- 环境变量
- 参数

### 环境变量

可以通过环境变量**MICRO_LOG_LEVEL**定义日志级别：

```bash
MICRO_LOG_LEVEL=debug go run main.go
```

### 参数

logger 可以自行初始化日志时传入级别。

```bash
import (
	"github.com/micro/go-micro/v2/logger"
)

func main() {
    logger.Init(logger.WithLevel(logger.DebugLevel))
    // ...
}
```

## 动态级别

有时候我们需要在运行时改变日志级别，此时我们可以调用**Init**方法覆盖原有配置

```bash
import (
	"github.com/micro/go-micro/v2/logger"
)

func main() {
	logger.Init(logger.WithLevel(logger.DebugLevel))

	logger.Debug("Debug")
	logger.Debugf("Debug %s", "Hello")

	logger.Init(logger.WithLevel(logger.InfoLevel))
	logger.Debug("Debug2")
	logger.Debugf("Debug2 %s", "Hello")
}
```

此时，Debug2 不再被打印

## 固有字段

我们在日志打印时，有时候需要在每次打印都把固有的信息打印出来，比如当前机器 IP 等等，此时可以通过 WithFields 声明在当前上下文中：

- 全局

```go
func main() {
	logger.Init(
		logger.WithLevel(logger.DebugLevel),
		logger.WithFields(map[string]interface{}{
			"header1": "头1",
			"header2": "头2",
		}),
	)

	logger.Debug("Debug")
	logger.Debugf("Debug %s", "Hello")
}
```

## 插件

Go-Micro 提供了常见的日志库集成实现

- [zap](https://github.com/micro/go-plugins/tree/master/logger/zap)
- [logrus](https://github.com/micro/go-plugins/tree/master/logger/logrus)
- [zerolog](https://github.com/micro/go-plugins/tree/master/logger/zerolog)
- [apex](https://github.com/micro/go-plugins/tree/master/logger/apex)

## 替换默认实现

下面的示例演示了如何使用[logrus](https://github.com/micro/go-plugins/tree/master/logger/logrus)来覆盖默认的实现：

```go
package main

import (
	"os"

	"github.com/micro/go-micro/v2/logger"
	lr "github.com/micro/go-plugins/logger/logrus/v2"
)

func main() {
	l := lr.NewLogger(
		logger.WithOutput(os.Stdout)).Fields(map[string]interface{}{
		"header1": "头1",
		"header2": 8080,
	})

	logger.DefaultLogger = l

	logger.Info("testing: Info")
	logger.Infof("testing: %s", "Infof")
}
```
