# 邹宇乐生日快乐

这是一个纯静态生日祝福网站，可通过 GitHub Pages 免费托管，不需要 Node.js 服务或银行卡。

## 部署到 GitHub Pages

1. 将仓库中的更改提交并推送到 `main` 分支。
2. 打开 GitHub 仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 的 **Source** 中选择 **GitHub Actions**。
4. 打开仓库的 **Actions** 页面，等待 **Deploy static site to GitHub Pages** 工作流成功。
5. 在 **Settings → Pages** 页面打开 GitHub 提供的网站链接。

以后每次向 `main` 分支提交更改，网站都会自动重新部署。工作流只发布 `public/` 目录。

## 留言说明

留言保存在访客当前设备的浏览器中。同一浏览器可以查看自己写下的留言，但不同访客、设备和浏览器之间不会同步；清理浏览器数据也会删除这些留言。

如需所有访客共享留言，需要接入后端服务或数据库。
