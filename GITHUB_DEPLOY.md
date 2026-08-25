# GitHub + Vercel 部署指南

## 步骤 1：推送到 GitHub

### 1.1 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库名称（如：`web-app-store`）
3. 选择 Public 或 Private
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 **Create repository**

### 1.2 推送代码

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 步骤 2：在 Vercel 中导入

### 2.1 导入仓库

1. 访问 https://vercel.com/new
2. 点击 **Import Git Repository**
3. 选择你的 GitHub 仓库
4. 点击 **Import**

### 2.2 配置项目

Vercel 会自动检测项目结构，但需要手动配置：

**Framework Preset**: 选择 `Other`

**Root Directory**: 保持默认 `./`

**Build Command**: 保持默认或留空

**Output Directory**: 保持默认或留空

**Install Command**: 保持默认

### 2.3 添加环境变量

在 **Environment Variables** 部分添加：

| 名称 | 值 |
|------|-----|
| `EXPO_PUBLIC_BACKEND_BASE_URL` | `https://your-app.vercel.app` |

> ⚠️ 注意：这个值是你的 Vercel 部署后的域名，可以先部署一次获取域名后再设置

### 2.4 部署

点击 **Deploy** 按钮

## 步骤 3：配置 Vercel 路由

由于这是一个 monorepo 项目（前端 + 后端），需要配置 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/v1/(.*)",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

## 步骤 4：验证部署

部署完成后，访问你的 Vercel 域名：

- 前端：`https://your-app.vercel.app`
- 后端 API：`https://your-app.vercel.app/api/v1/health`

## 常见问题

### Q: 前端无法连接后端

**A**: 确保设置了 `EXPO_PUBLIC_BACKEND_BASE_URL` 环境变量，值为你的 Vercel 域名

### Q: 后端 API 返回 404

**A**: 检查 `vercel.json` 路由配置是否正确

### Q: 构建失败

**A**: 检查 `server/package.json` 和 `client/package.json` 中的依赖是否完整

## 自动部署

配置完成后，每次推送到 GitHub 的 `main` 分支都会自动触发 Vercel 部署：

```bash
git add .
git commit -m "your changes"
git push origin main
```

Vercel 会自动构建和部署最新版本。
