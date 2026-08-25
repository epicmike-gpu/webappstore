import express from 'express';
import cors from 'cors';
import path from 'path';
import https from 'https';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { cnCategories, cnWebApps } from './src/data/webapps-cn';
import { overseasCategories, overseasWebApps } from './src/data/webapps-overseas';
import { WebApp, Category, SafetyCheckResult } from './src/types';

// In-memory custom apps store
const customApps: { cn: WebApp[]; overseas: WebApp[] } = {
  cn: [],
  overseas: [],
};

// URL Safety Checker
async function checkUrlSafety(url: string): Promise<SafetyCheckResult> {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  try {
    const urlObj = new URL(url);

    // Protocol check
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      warnings.push('不支持的协议，请使用 http:// 或 https://');
      score -= 30;
    }

    // IP address check
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(urlObj.hostname)) {
      warnings.push('直接使用 IP 地址访问，可能存在风险');
      score -= 20;
    }

    // Suspicious keywords in hostname
    const suspiciousPatterns = [
      /phishing/i,
      /malware/i,
      /virus/i,
      /hack/i,
      /crack/i,
      /pirate/i,
    ];
    if (suspiciousPatterns.some((pattern) => pattern.test(urlObj.hostname))) {
      warnings.push('域名包含可疑关键词，可能存在安全风险');
      score -= 40;
    }

    // URL special characters check
    const urlStr = url.toLowerCase();
    if (urlStr.includes('@') || urlStr.includes('..')) {
      warnings.push('URL 包含特殊格式字符，请检查是否为正常网址');
      score -= 25;
    }

    // Ping check with timeout
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(4000),
      });
      if (response.status === 404) {
        warnings.push('该网页不存在 (404 Not Found)');
        score -= 40;
      } else if (response.status >= 400) {
        warnings.push(`网页返回状态码：${response.status}`);
        score -= 20;
      } else {
        suggestions.push('目标网站可正常访问连接');
      }
    } catch {
      suggestions.push('网络连接超时或无法直接探测，请确认网址可访问');
      score -= 10;
    }

    score = Math.max(0, Math.min(100, score));

    return {
      isSafe: score >= 60,
      score,
      warnings,
      suggestions,
    };
  } catch {
    return {
      isSafe: false,
      score: 0,
      warnings: ['URL 格式无效，请输入正确的标准网址'],
      suggestions: [],
    };
  }
}

// Logo Extractor
async function extractLogoFromUrl(url: string): Promise<string | null> {
  try {
    const html = await Promise.race([
      fetchHtml(url),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);

    if (html) {
      // 1. Apple Touch Icon
      const appleTouch = extractMetaTag(html, 'link', 'rel', 'apple-touch-icon');
      if (appleTouch) return resolveUrl(url, appleTouch);

      // 2. OpenGraph Image
      const ogImage = extractMetaTag(html, 'meta', 'property', 'og:image');
      if (ogImage) return resolveUrl(url, ogImage);

      // 3. Shortcut icon / icon
      const shortcut = extractMetaTag(html, 'link', 'rel', 'shortcut icon');
      if (shortcut) return resolveUrl(url, shortcut);

      const icon = extractMetaTag(html, 'link', 'rel', 'icon');
      if (icon) return resolveUrl(url, icon);
    }

    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return null;
  }
}

function extractMetaTag(html: string, tag: string, attr: string, value: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}\\s*=\\s*["']?${value}["']?[^>]*>`, 'i');
  const match = html.match(regex);
  if (!match) return null;

  const contentMatch = match[0].match(/content\s*=\s*["']?([^"'\s>]+)["']?/i);
  if (contentMatch) return contentMatch[1];

  const hrefMatch = match[0].match(/href\s*=\s*["']?([^"'\s>]+)["']?/i);
  if (hrefMatch) return hrefMatch[1];

  return null;
}

function resolveUrl(baseUrl: string, relativeUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch {
    return relativeUrl;
  }
}

function fetchHtml(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        timeout: 4000,
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).href;
          fetchHtml(redirectUrl).then(resolve);
          return;
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          if (data.length > 50000) res.destroy();
        });
        res.on('end', () => resolve(data));
        res.on('error', () => resolve(null));
      }
    );

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get categories with counts
  app.get('/api/v1/apps/categories', (req, res) => {
    const version = (req.query.version as string) === 'overseas' ? 'overseas' : 'cn';
    const baseCategories = version === 'overseas' ? overseasCategories : cnCategories;
    const allApps = [
      ...(version === 'overseas' ? overseasWebApps : cnWebApps),
      ...customApps[version],
    ];

    const categoriesWithCount = baseCategories.map((cat) => ({
      ...cat,
      count: allApps.filter((a) => a.categoryId === cat.id).length,
    }));

    res.json({
      success: true,
      data: categoriesWithCount,
      totalApps: allApps.length,
    });
  });

  // Get featured apps
  app.get('/api/v1/apps/featured', (req, res) => {
    const version = (req.query.version as string) === 'overseas' ? 'overseas' : 'cn';
    const allApps = [
      ...(version === 'overseas' ? overseasWebApps : cnWebApps),
      ...customApps[version],
    ];
    // Return top curated apps
    const featured = allApps.slice(0, 6);
    res.json({
      success: true,
      data: featured,
    });
  });

  // Get list of apps (filter by category, search term, pagination)
  app.get('/api/v1/apps', (req, res) => {
    const version = (req.query.version as string) === 'overseas' ? 'overseas' : 'cn';
    const category = req.query.category as string | undefined;
    const search = (req.query.search as string | undefined)?.toLowerCase().trim();

    let allApps = [
      ...(version === 'overseas' ? overseasWebApps : cnWebApps),
      ...customApps[version],
    ];

    if (category && category !== 'all') {
      allApps = allApps.filter((a) => a.categoryId === category);
    }

    if (search) {
      allApps = allApps.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search) ||
          a.domain.toLowerCase().includes(search) ||
          a.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    res.json({
      success: true,
      data: allApps,
      total: allApps.length,
    });
  });

  // Get single app details
  app.get('/api/v1/apps/:id', (req, res) => {
    const { id } = req.params;
    const allApps = [
      ...cnWebApps,
      ...overseasWebApps,
      ...customApps.cn,
      ...customApps.overseas,
    ];
    const appItem = allApps.find((a) => a.id === id);

    if (!appItem) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    res.json({ success: true, data: appItem });
  });

  // Safety check endpoint
  app.post('/api/v1/apps/safety-check', async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const result = await checkUrlSafety(url);
    res.json({ success: true, data: result });
  });

  // Extract logo endpoint
  app.post('/api/v1/apps/extract-logo', async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const logoUrl = await extractLogoFromUrl(url);
    res.json({ success: true, data: { logoUrl } });
  });

  // Add new app
  app.post('/api/v1/apps', (req, res) => {
    const { name, url, description, categoryId, brandColor, tags, version, logoUrl } = req.body;

    if (!name || !url || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Name, URL, and category are required',
      });
    }

    let domain = url;
    try {
      domain = new URL(url).hostname;
    } catch {
      // fallback
    }

    const targetVersion = version === 'overseas' ? 'overseas' : 'cn';
    const newApp: WebApp = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      domain,
      url: url.trim(),
      description: description?.trim() || 'User submitted web application',
      categoryId,
      brandColor: brandColor || '#6C63FF',
      logoUrl: logoUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      tags: Array.isArray(tags) ? tags : [targetVersion === 'overseas' ? 'Web App' : '应用'],
    };

    customApps[targetVersion].unshift(newApp);

    res.status(201).json({
      success: true,
      data: newApp,
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web App Store server is running on http://localhost:${PORT}`);
  });
}

startServer();
