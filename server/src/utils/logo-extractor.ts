/**
 * 从网页提取 logo/favicon
 */

import * as https from 'https';
import * as http from 'http';

/**
 * 从网页 HTML 中提取 logo/favicon URL
 * 优先级：apple-touch-icon > og:image > shortcut icon > favicon
 */
export async function extractLogoFromUrl(url: string): Promise<string | null> {
  try {
    // 添加整体超时保护
    const html = await Promise.race([
      fetchHtml(url),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
    ]);

    if (!html) return null;

    // 1. 查找 apple-touch-icon（最高质量）
    const appleTouchIcon = extractMetaTag(html, 'link', 'rel', 'apple-touch-icon');
    if (appleTouchIcon) {
      return resolveUrl(url, appleTouchIcon);
    }

    // 2. 查找 og:image（Open Graph 图片，通常是网站 logo 或 banner）
    const ogImage = extractMetaTag(html, 'meta', 'property', 'og:image');
    if (ogImage) {
      return resolveUrl(url, ogImage);
    }

    // 3. 查找 shortcut icon
    const shortcutIcon = extractMetaTag(html, 'link', 'rel', 'shortcut icon');
    if (shortcutIcon) {
      return resolveUrl(url, shortcutIcon);
    }

    // 4. 查找 icon
    const icon = extractMetaTag(html, 'link', 'rel', 'icon');
    if (icon) {
      return resolveUrl(url, icon);
    }

    // 5. 回退到 /favicon.ico
    const domain = new URL(url).origin;
    return `${domain}/favicon.ico`;
  } catch {
    return null;
  }
}

/**
 * 提取 meta/link 标签的 content/href 属性
 */
function extractMetaTag(
  html: string,
  tag: string,
  attr: string,
  value: string
): string | null {
  // 更宽松的匹配模式
  const regex = new RegExp(
    `<${tag}[^>]*${attr}\\s*=\\s*["']?${value}["']?[^>]*>`,
    'i'
  );
  const match = html.match(regex);
  if (!match) return null;

  // 提取 content 或 href 属性
  const contentMatch = match[0].match(/content\s*=\s*["']?([^"'\s>]+)["']?/i);
  if (contentMatch) return contentMatch[1];

  const hrefMatch = match[0].match(/href\s*=\s*["']?([^"'\s>]+)["']?/i);
  if (hrefMatch) return hrefMatch[1];

  return null;
}

/**
 * 解析相对 URL 为绝对 URL
 */
function resolveUrl(baseUrl: string, relativeUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch {
    return relativeUrl;
  }
}

/**
 * 获取网页 HTML 内容
 */
function fetchHtml(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 5000, // 5 秒超时
    }, (res) => {
      // 跟随重定向
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        fetchHtml(redirectUrl).then(resolve);
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        // 只读取前 50KB，足够找到 meta 标签
        if (data.length > 50000) {
          res.destroy();
        }
      });
      res.on('end', () => resolve(data));
      res.on('error', () => resolve(null));
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}
