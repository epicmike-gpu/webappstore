#!/bin/bash

# Web App Store - Vercel 部署脚本

echo "🚀 开始部署到 Vercel..."
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo " 未找到 Vercel CLI，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel..."
    vercel login
fi

echo "📦 部署后端 (server)..."
cd server
BACKEND_URL=$(vercel --prod --token=$VERCEL_TOKEN 2>&1 | grep "Production:" | awk '{print $2}')
cd ..

if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  无法自动获取后端 URL，请手动输入:"
    read BACKEND_URL
fi

echo "✅ 后端部署完成：$BACKEND_URL"
echo ""

echo "🎨 部署前端 (client)..."
cd client
vercel --prod --token=$VERCEL_TOKEN
cd ..

echo ""
echo "✅ 部署完成！"
echo ""
echo " 下一步："
echo "1. 在 Vercel 项目设置中添加环境变量："
echo "   EXPO_PUBLIC_BACKEND_BASE_URL=$BACKEND_URL"
echo ""
echo "2. 重新部署前端以应用新的环境变量"
echo ""
