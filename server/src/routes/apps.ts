import { Router } from 'express';
import { z } from 'zod';
import { getWebApps, addCustomApp, getCategories as getCnCategories } from '../data/webapps-cn.js';
import { getCategories as getOverseasCategories } from '../data/webapps-overseas.js';
import { checkUrlSafety } from '../utils/safety-check.js';
import { extractLogoFromUrl } from '../utils/logo-extractor.js';

const router = Router();

// GET /api/v1/apps/categories - 获取所有分类
router.get('/categories', (req, res) => {
  const version = (req.query.version as 'overseas' | 'cn') || 'cn';
  const cats = version === 'overseas' ? getOverseasCategories() : getCnCategories();
  const allApps = getWebApps(version);
  const result = cats.map((cat) => ({
    ...cat,
    count: allApps.filter((app) => app.categoryId === cat.id).length,
  }));
  res.json({ success: true, data: result });
});

// GET /api/v1/apps/featured - 获取精选推荐
router.get('/featured', (req, res) => {
  const version = (req.query.version as 'overseas' | 'cn') || 'cn';
  const allApps = getWebApps(version);

  const featuredIds = version === 'overseas'
    ? ['chatgpt', 'notion', 'figma', 'github', 'youtube', 'spotify', 'coursera', 'canva', 'perplexity', 'vercel']
    : ['wenxin', 'feishu', 'jsdesign', 'gitee', 'wechat', 'bilibili', 'mooc', 'alipay', 'amap', 'douyin'];

  const featured = allApps.filter((app) => featuredIds.includes(app.id));
  res.json({ success: true, data: featured });
});

// GET /api/v1/apps/search - 搜索应用
router.get('/search', (req, res) => {
  const { q, version } = req.query;
  const appVersion = (version as 'overseas' | 'cn') || 'cn';

  if (!q || typeof q !== 'string') {
    res.json({ success: true, data: [] });
    return;
  }
  const query = q.toLowerCase();
  const allApps = getWebApps(appVersion);
  const results = allApps.filter(
    (app) =>
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.tags.some((tag) => tag.toLowerCase().includes(query))
  );
  res.json({ success: true, data: results });
});

// GET /api/v1/apps - 获取所有应用（可按分类筛选）
router.get('/', (req, res) => {
  const { category, version } = req.query;
  const appVersion = (version as 'overseas' | 'cn') || 'cn';
  const allApps = getWebApps(appVersion);

  let result = allApps;
  if (category && typeof category === 'string') {
    result = allApps.filter((app) => app.categoryId === category);
  }
  res.json({ success: true, data: result });
});

// GET /api/v1/apps/:id - 获取单个应用详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const version = (req.query.version as 'overseas' | 'cn') || 'cn';
  const allApps = getWebApps(version);
  const app = allApps.find((a) => a.id === id);

  if (!app) {
    res.status(404).json({ success: false, error: 'App not found' });
    return;
  }
  res.json({ success: true, data: app });
});

// POST /api/v1/apps - 创建新应用（带安全验证）
const createAppSchema = z.object({
  name: z.string().min(1).max(50),
  url: z.string().url(),
  categoryId: z.string().min(1),
  description: z.string().max(200).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

router.post('/', async (req, res) => {
  const version = (req.query.version as 'overseas' | 'cn') || 'cn';
  const parseResult = createAppSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: 'Invalid request body',
      details: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, url, categoryId, description, tags } = parseResult.data;

  // 执行安全验证
  const safetyResult = await checkUrlSafety(url);

  // 如果安全评分过低，拒绝添加
  if (!safetyResult.isSafe) {
    res.status(400).json({
      success: false,
      error: '安全验证未通过',
      safetyCheck: safetyResult,
    });
    return;
  }

  const domain = new URL(url).hostname;
  const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  // 尝试从网页提取 logo
  const logoUrl = await extractLogoFromUrl(url);

  const newApp = {
    id,
    name,
    domain,
    url,
    description,
    categoryId,
    brandColor: '#6C63FF',
    logoUrl: logoUrl || null,
    tags,
  };

  addCustomApp(newApp, version);
  res.status(201).json({ 
    success: true, 
    data: newApp,
    safetyCheck: safetyResult,
  });
});

export default router;
