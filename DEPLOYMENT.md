# Vercel 部署指南

## 快速部署（推荐）

### 方式一：Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署后端**
   ```bash
   cd server
   vercel --prod
   ```
   记录输出的 Production URL（如：https://webappstore-server.vercel.app）

4. **部署前端**
   ```bash
   cd ../client
   vercel --prod
   ```

5. **设置环境变量**
   在 Vercel Dashboard 中为前端项目添加环境变量：
   - 名称：`EXPO_PUBLIC_BACKEND_BASE_URL`
   - 值：你的后端 URL（如：https://webappstore-server.vercel.app）

6. **重新部署前端**
   ```bash
   vercel --prod
   ```

### 方式二：GitHub 集成部署

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/webappstore.git
   git push -u origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com/new
   - 选择你的 GitHub 仓库
   - Framework Preset: 选择 `Other`

3. **配置构建命令**
   - Root Directory: 留空
   - Build Command: 留空（使用 vercel.json 配置）
   - Output Directory: 留空

4. **添加环境变量**
   在 Vercel 项目设置 > Environment Variables 中添加：
   - `EXPO_PUBLIC_BACKEND_BASE_URL`

5. **部署**
   Vercel 会自动构建和部署

## 项目结构

```
webappstore/
├── client/          # Expo 前端（React Native Web）
├── server/          # Express 后端
├── vercel.json      # Vercel 配置
── DEPLOYMENT.md    # 部署说明
```

## 注意事项

1. **环境变量**
   - 前端通过 `EXPO_PUBLIC_BACKEND_BASE_URL` 访问后端 API
   - 后端不需要特殊环境变量

2. **CORS**
   - 后端已配置 CORS，允许所有来源访问
   - 生产环境建议限制为前端域名

3. **数据持久化**
   - 当前使用内存存储，重启后数据会丢失
   - 生产环境建议使用数据库（如 Supabase、MongoDB）

4. **自定义域名**
   - 可在 Vercel Dashboard 中为前后端分别设置自定义域名
   - 设置后需要更新 `EXPO_PUBLIC_BACKEND_BASE_URL` 环境变量

## 故障排查

### 前端无法连接后端
- 检查 `EXPO_PUBLIC_BACKEND_BASE_URL` 环境变量是否正确设置
- 确保后端部署成功且 URL 可访问
- 检查浏览器控制台是否有 CORS 错误

### 后端 API 返回 404
- 检查 vercel.json 中的路由配置
- 确保 API 路径以 `/api/v1/` 开头
- 查看 Vercel Functions 日志

### 构建失败
- 检查 Node.js 版本（需要 18.x 或更高）
- 确保所有依赖已正确安装
- 查看 Vercel 构建日志

## 优化建议

1. **数据库集成**
   - 使用 Supabase 或 MongoDB 存储应用数据
   - 实现用户收藏功能的持久化

2. **CDN 加速**
   - Vercel 自动提供全球 CDN
   - 图片资源可使用对象存储（如 AWS S3）

3. **监控**
   - 启用 Vercel Analytics
   - 配置错误监控（如 Sentry）

4. **安全**
   - 添加 API 速率限制
   - 实现用户认证（如需要）
   - 限制 CORS 来源
