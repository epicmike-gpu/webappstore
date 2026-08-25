#!/bin/bash

# GitHub + Vercel 部署脚本

echo "========================================="
echo "GitHub + Vercel 部署指南"
echo "========================================="
echo ""

# 检查是否已配置远程仓库
REMOTE=$(git remote -v)
if [ -z "$REMOTE" ]; then
    echo "❌ 未配置 GitHub 远程仓库"
    echo ""
    echo "请按以下步骤操作："
    echo ""
    echo "1. 在 GitHub 上创建新仓库："
    echo "   - 访问 https://github.com/new"
    echo "   - 填写仓库名称（如：web-app-store）"
    echo "   - 选择 Public 或 Private"
    echo "   - 点击 Create repository"
    echo ""
    echo "2. 添加远程仓库并推送："
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "3. 在 Vercel 中导入："
    echo "   - 访问 https://vercel.com/new"
    echo "   - 点击 Import Git Repository"
    echo "   - 选择你的仓库"
    echo "   - 点击 Deploy"
    echo ""
else
    echo "✅ 已配置远程仓库："
    echo "$REMOTE"
    echo ""
    echo "推送最新代码："
    echo "   git push origin main"
    echo ""
    echo "然后在 Vercel 中导入仓库即可自动部署"
fi

echo "========================================="
echo "Vercel 环境变量配置"
echo "========================================="
echo ""
echo "在 Vercel Dashboard 中为项目添加环境变量："
echo ""
echo "1. 进入项目 Settings → Environment Variables"
echo "2. 添加以下变量："
echo "   - EXPO_PUBLIC_BACKEND_BASE_URL"
echo "     值：https://your-backend.vercel.app"
echo ""
echo "3. 重新部署项目"
echo ""
echo "========================================="
