---
order: 13
title: Web服务
---

Stack 支持编写 Web 服务，方便开发人员暴露 HTTP 接口

## 编写服务

Stack 中启动 Web 服务与 RPC 服务一样简单，大致如下：

```go
func main() {
	s := stack.NewWebService(
        // 服务名
		stack.Name("stack.rpc.web"),
		// 地址与端口
		stack.Address(":8080"),
		// 根目录
		stack.WebRootPath("web-demo"),
		// 路由与Handler
		stack.WebHandleFuncs(
			web.HandlerFunc{
				Route: "hello",
				Func: func(w http.ResponseWriter, r *http.Request) {
					w.Write([]byte(`hello world`))
				},
			},
		),
		// 静态目录
		stack.WebStaticDir("webapp", "static"),
	)
	s.Init()
    s.Run()
}
```

上面的代码中我们启动了一个简单的 HTTP 服务，并声明了一个 Hello 接口与静态目录。

如果嫌代码冗长，也可以把关键配置放到配置文件（或配置中心中）：

```yaml
stack:
  service:
    name: stack.rpc.web
    web:
      root-path: web-demo
      static:
        route: webapp
        dir: static
  server:
    address: :8090
```

通过该配置，启动代码可省略为：

```go
func main(){
    s := stack.NewWebService(
		// 路由与Handler
		stack.WebHandleFuncs(
			web.HandlerFunc{
				Route: "hello",
				Func: func(w http.ResponseWriter, r *http.Request) {
					w.Write([]byte(`hello world`))
				},
			},
		),
	)
	s.Init()
    s.Run()
}
```

完整代码参考：[Web](https://github.com/stack-labs/stack/blob/master/examples/service/web)

## 配置详解

### 未完待续
