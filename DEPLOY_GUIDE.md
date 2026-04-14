# BUBAI_APP 上线指南（GitHub Pages + Render + 自定义域名）

## 1. 前提

- 代码已在 GitHub 仓库：kevincui613/BUBAI_APP
- 你有一个可购买和管理 DNS 的域名

## 2. 前端部署到 GitHub Pages（已自动化）

项目已包含自动部署工作流：`.github/workflows/deploy-frontend-pages.yml`。

### 2.1 在 GitHub 打开 Pages

1. 进入仓库 Settings -> Pages
2. Build and deployment 选择 Source: GitHub Actions

### 2.2 配置前端 API 环境变量

1. 进入仓库 Settings -> Secrets and variables -> Actions
2. 新建 Repository secret：`VITE_API_BASE_URL`
3. 值填写你的后端地址，例如：`https://api.your-domain.com/api`

### 2.3 触发部署

- 推送 main 分支时会自动部署（前端相关改动）
- 或在 Actions 页面手动运行 Deploy Frontend To GitHub Pages

部署成功后，你会先得到一个 GitHub 提供的访问地址。

## 3. 后端部署到 Render（Express）

### 3.1 创建 Web Service

1. 登录 Render
2. New + -> Web Service
3. 连接 GitHub 仓库：kevincui613/BUBAI_APP
4. Root Directory 填写：`backend`
5. Build Command：`npm install`
6. Start Command：`npm start`

### 3.2 配置环境变量

在 Render 的 Environment 中设置：

- `PORT` = `10000`（Render 常用端口，可不写，平台会注入）
- `CORS_ORIGINS` = `https://your-domain.com,https://www.your-domain.com,https://kevincui613.github.io`

发布后得到后端地址，例如：`https://bubai-backend.onrender.com`。

## 4. 绑定自定义域名

建议拆分为：

- 前端：`www.your-domain.com`
- 后端：`api.your-domain.com`

### 4.1 前端域名（GitHub Pages）

1. 仓库 Settings -> Pages -> Custom domain
2. 填入 `www.your-domain.com`
3. 等待证书签发（Enforce HTTPS 可开启）

### 4.2 后端域名（Render）

1. 打开 Render 服务 -> Settings -> Custom Domains
2. 添加 `api.your-domain.com`

### 4.3 DNS 解析（在你的域名服务商）

按平台提示添加记录，常见为：

- `www` -> CNAME 到 GitHub Pages 提供的目标
- `api` -> CNAME 到 Render 提供的目标
- 根域 `@` 可做 URL 转发到 `https://www.your-domain.com`

## 5. 回填前端 API 地址并重新部署

当后端自定义域名生效后，把 GitHub Secret `VITE_API_BASE_URL` 更新为：

- `https://api.your-domain.com/api`

然后重新执行前端部署工作流。

## 6. 验证清单

- 打开 `https://www.your-domain.com` 可访问页面
- 登录与业务接口请求成功
- 浏览器 Network 中 API 请求是 `https://api.your-domain.com/api/...`
- 后端响应头允许来自前端域名的跨域请求

## 7. 常见问题

- 403/404：确认 GitHub Pages Source 是 GitHub Actions，且工作流成功
- 跨域失败：确认 `CORS_ORIGINS` 包含前端最终域名
- 前端调用 localhost：确认 `VITE_API_BASE_URL` Secret 已正确设置并重新部署
- Render 首次访问慢：免费实例会冷启动
