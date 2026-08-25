import { execSync } from 'child_process';

export interface SafetyCheckResult {
  isSafe: boolean;
  score: number; // 0-100
  warnings: string[];
  suggestions: string[];
}

/**
 * 验证 URL 是否安全
 */
export async function checkUrlSafety(url: string): Promise<SafetyCheckResult> {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  try {
    // 1. 基本 URL 格式验证
    const urlObj = new URL(url);
    
    // 检查协议
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      warnings.push('不支持的协议，请使用 http:// 或 https://');
      score -= 30;
    }

    // 检查是否是 IP 地址
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(urlObj.hostname)) {
      warnings.push('直接使用 IP 地址访问，可能存在风险');
      score -= 20;
    }

    // 检查可疑域名模式
    const suspiciousPatterns = [
      /phishing/i,
      /malware/i,
      /virus/i,
      /hack/i,
      /crack/i,
      /pirate/i,
    ];
    
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
      pattern.test(urlObj.hostname)
    );
    
    if (hasSuspiciousPattern) {
      warnings.push('域名包含可疑关键词，可能存在安全风险');
      score -= 40;
    }

    // 2. 检查 URL 是否可访问
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.status === 404) {
        warnings.push('该网页不存在（404 错误）');
        score -= 50;
      } else if (response.status >= 400) {
        warnings.push(`网页返回错误状态码：${response.status}`);
        score -= 20;
      }
    } catch (error) {
      warnings.push('无法访问该网页，可能已失效或网络问题');
      score -= 30;
    }

    // 3. 使用 web search 验证网站真实性
    try {
      const domain = urlObj.hostname.replace('www.', '');
      const searchResult = execSync(
        `coze-coding-ai search --query "${domain} website" --count 3`,
        { 
          encoding: 'utf-8',
          timeout: 10000,
          cwd: '/workspace/projects/server'
        }
      );
      
      if (searchResult && searchResult.includes(domain)) {
        suggestions.push('该网站在搜索结果中被找到，可信度较高');
      } else {
        suggestions.push('该网站在搜索结果中未找到，建议谨慎添加');
        score -= 10;
      }
    } catch (error) {
      // 搜索失败不影响主要流程
      suggestions.push('无法验证网站真实性，请手动确认');
    }

    // 4. 检查是否是常见钓鱼网站特征
    const urlStr = url.toLowerCase();
    if (urlStr.includes('@') || urlStr.includes('..') || urlStr.includes('%')) {
      warnings.push('URL 包含特殊字符，可能是钓鱼网站');
      score -= 25;
    }

    // 确保分数在 0-100 之间
    score = Math.max(0, Math.min(100, score));

    return {
      isSafe: score >= 60,
      score,
      warnings,
      suggestions,
    };
  } catch (error) {
    return {
      isSafe: false,
      score: 0,
      warnings: ['URL 格式无效'],
      suggestions: [],
    };
  }
}
