---
order: 9
title: kubernetes
---

Micro 在 Kubernetes 中是原生 kubernetes 的微服务。

Micro 是一个微服务工具包，而 Kubernetes 是一个容器调度平台，它们组合在一起便构成微服务基础设施。

## 特性

- 无外部依赖
- 客户端缓存服务发现
- 可选 k8s 服务负载均衡
- 使用 gRPC 传输协议
- 预置工具包

## 安装 Micro

```
go get github.com/micro/kubernetes/cmd/micro
```

或者

```
docker pull micro/micro:kubernetes
```

如果使用 go-micro，可以导入：

```
import "github.com/micro/kubernetes/go/micro"
```

## 编写服务

在[go-micro](https://github.com/micro/go-micro)中可以使用其它服务一样集成 k8s。

```go
import (
	"github.com/micro/go-micro/v2"
	k8s "github.com/micro/kubernetes/go/micro"
)

func main() {
	service := k8s.NewService(
		micro.Name("greeter")
	)
	service.Init()
	service.Run()
}
```

## 部署服务

以下是 k8s 部署微服务的示例

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  namespace: default
  name: greeter
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: greeter-srv
    spec:
      containers:
        - name: greeter
          command: [
		"/greeter-srv",
		"--server_address=0.0.0.0:8080",
		"--broker_address=0.0.0.0:10001"
	  ]
          image: microhq/greeter-srv:kubernetes
          imagePullPolicy: Always
          ports:
          - containerPort: 8080
            name: greeter-port
```

通过 kubectl 部署

```
kubectl create -f greeter.yaml
```

## 健康检查器

健康检查器（healthchecking sidecar，参考 sidecar 模式）会调用服务 rpc 接口`Debug.Health`向外暴露`/health`端点，而每个 go-micro 服务都有一个内置的 Debug.Health 端点。

### 部署健康检查

```
go get github.com/micro/kubernetes/cmd/health
```

或者

```
docker pull microhq/health:kubernetes
```

### 运行健康检查

例如，运行 healthcheck greeter 服务，地址为 localhost：9091

```
health --server_name=greeter --server_address=localhost:9091
```

在 localhost:8080 调用 healthchecker

```
curl http://localhost:8080/health
```

### K8s 部署

添加 kubernetes 部署配置

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  namespace: default
  name: greeter
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: greeter-srv
    spec:
      containers:
        - name: greeter
          command: [
		"/greeter-srv",
		"--server_address=0.0.0.0:8080",
		"--broker_address=0.0.0.0:10001"
	  ]
          image: microhq/greeter-srv:kubernetes
          imagePullPolicy: Always
          ports:
          - containerPort: 8080
            name: greeter-port
        - name: health
          command: [
		"/health",
                "--health_address=0.0.0.0:8081",
		"--server_name=greeter",
		"--server_address=0.0.0.0:8080"
	  ]
          image: microhq/health:kubernetes
          livenessProbe:
            httpGet:
              path: /health
              port: 8081
            initialDelaySeconds: 3
            periodSeconds: 3
```

## K8s 负载均衡

Micro 默认提供客户端负载均衡，但 k8s 也提供有服务负载均衡策略。

要把默认的均衡卸掉迁移到 k8s，可以使用[静态选择器](https://github.com/micro/go-plugins/tree/master/selector/static)与 k8s 服务协同的方式。

不同于地址解析，选择器返回服务名与既定端口，例如 greeter 服务抬 greeter:8080。

点击了解更多关于[静态选择器](https://github.com/micro/go-plugins/tree/master/selector/static)。

### 用法

要在运行服务时使用静态选择器，请指定参数或环境变量

```
MICRO_SELECTOR=static ./service
```

或者

```
./service --selector=static
```

### K8s 部署

部署示例

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  namespace: default
  name: greeter
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: greeter-srv
    spec:
      containers:
        - name: greeter
          command: [
		"/greeter-srv",
		"--selector=static",
		"--server_address=0.0.0.0:8080",
		"--broker_address=0.0.0.0:10001"
	  ]
          image: microhq/greeter-srv:kubernetes
          imagePullPolicy: Always
          ports:
          - containerPort: 8080
            name: greeter-port
```

### K8s 服务

静态选择器将负载均衡迁移到 k8s 服务。因此，请确保为每个微服务创建了 k8s 服务。

服务样例

```
apiVersion: v1
kind: Service
metadata:
  name: greeter
  labels:
    app: greeter
spec:
  ports:
  - port: 8080
    protocol: TCP
  selector:
    app: greeter
```

通过 kubectl 部署

```
kubectl create -f service.yaml
```

这样，在你的服务中调用 greeter 微服务，会被路由到 k8s 服务中的 greeter 服务 8080 端口上。
