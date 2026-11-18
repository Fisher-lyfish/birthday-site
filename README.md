<<<<<<< HEAD
# birthday-site
Happy birthday!
=======
# 邹宇乐生日快乐 · 实时留言板

## 运行步骤

1. 安装 Node.js（18 或更高版本）
2. 进入项目目录，安装依赖：

```bash
npm install
```

3. 启动服务：

```bash
npm start
```

4. 打开浏览器访问：`http://localhost:3000`

## 手机 / 平板如何访问

**必须连接同一个局域网（同一个 WiFi）**

1. 在电脑上查看内网 IP：
   - Windows: `ipconfig`，找 IPv4 地址，例如 `192.168.1.100`
   - macOS / Linux: `ifconfig`，找 `inet` 地址

2. 手机和平板用浏览器访问：

```
http://192.168.1.100:3000
```

3. 两台设备同时打开，手机发布留言，平板会自动出现 ✨

> 如果访问不了，检查电脑防火墙是否放行了 3000 端口，
> 或者手机 WiFi 是否和电脑在同一个网段。

## 部署到公网（可选）

推荐支持 Node.js + SSE 长连接的平台：

- **Render**（免费额度可用）
- **Railway**
- **Fly.io**
- **自己的 VPS**

> ⚠️ Vercel / Netlify 的 Serverless 函数不适合 SSE 长连接，
> 如果要部署到那里，需要把前端实时同步改成轮询。
> 本代码已经内置了 SSE 失败时自动降级为 8 秒轮询。

## 数据存储

留言保存在 `data/messages.json` 中，重启不会丢。

> 免费 PaaS 平台重启可能会清空文件系统，
> 如需长期保存，可以改为挂载持久卷或接入数据库。

## 文件结构

```
.
├── package.json
├── server.js          # Express 后端 + SSE
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── data/
    └── messages.json  # 自动生成
```
>>>>>>> 2c57d3d (Add birthday greeting website)
