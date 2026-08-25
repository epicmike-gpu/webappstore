import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Loader2, Sparkles, Plus } from 'lucide-react';
import { Category, AppVersion, SafetyCheckResult } from '../types';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  version: AppVersion;
  onAppAdded: () => void;
}

export const AddAppModal: React.FC<AddAppModalProps> = ({
  isOpen,
  onClose,
  categories,
  version,
  onAppAdded,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'ai');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [brandColor, setBrandColor] = useState('#6C63FF');
  const [logoUrl, setLogoUrl] = useState('');

  const [checkingSafety, setCheckingSafety] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyCheckResult | null>(null);
  const [extractingLogo, setExtractingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCheckSafety = async () => {
    if (!url.trim()) return;
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
      setUrl(validUrl);
    }

    setCheckingSafety(true);
    setSafetyResult(null);
    setErrorMsg('');

    try {
      // 1. Safety check
      const res = await fetch('/api/v1/apps/safety-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setSafetyResult(data.data);
      }

      // 2. Auto logo extraction
      setExtractingLogo(true);
      const logoRes = await fetch('/api/v1/apps/extract-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validUrl }),
      });
      const logoData = await logoRes.json();
      if (logoData.success && logoData.data?.logoUrl) {
        setLogoUrl(logoData.data.logoUrl);
      }
    } catch {
      setErrorMsg(version === 'cn' ? '检测失败，请检查网络或 URL' : 'Validation request failed');
    } finally {
      setCheckingSafety(false);
      setExtractingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setErrorMsg(version === 'cn' ? '请填写应用名称和网址' : 'Please provide app name and URL');
      return;
    }

    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const tags = tagInput
        .split(/[,，\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/v1/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          url: validUrl,
          categoryId,
          description: description.trim(),
          tags: tags.length > 0 ? tags : [version === 'cn' ? '自定义' : 'Custom'],
          brandColor,
          logoUrl: logoUrl.trim() || undefined,
          version,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onAppAdded();
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to add app');
      }
    } catch {
      setErrorMsg('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorPresets = ['#6C63FF', '#00B894', '#FF6584', '#0984E3', '#E17055', '#D63031', '#FDCB6E', '#00CEC9', '#10A37F'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg neu-flat rounded-3xl p-6 border border-white/80 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {version === 'cn' ? '提交并收录 Web 应用' : 'Submit New Web Application'}
              </h2>
              <p className="text-xs text-neutral-600">
                {version === 'cn' ? '支持自动提取图标与安全评分检测' : 'Auto favicon extraction & instant safety audit'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input & Safety Check Button */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {version === 'cn' ? '应用网址 (URL) *' : 'Web Application URL *'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F0F0F3] border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
              <button
                type="button"
                onClick={handleCheckSafety}
                disabled={checkingSafety || !url.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {checkingSafety ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{version === 'cn' ? '检测中...' : 'Checking...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{version === 'cn' ? '安全检测' : 'Verify'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Safety Result Box */}
          {safetyResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                safetyResult.isSafe
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-1.5">
                  {safetyResult.isSafe ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                  )}
                  <span>{safetyResult.isSafe ? '安全评估良好' : '存在潜在风险'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-white text-xs font-mono font-bold shadow-xs">
                  {safetyResult.score} / 100
                </span>
              </div>
              {safetyResult.warnings.map((w, idx) => (
                <p key={idx} className="text-[11px] text-amber-700 pl-5">
                  • {w}
                </p>
              ))}
              {safetyResult.suggestions.map((s, idx) => (
                <p key={idx} className="text-[11px] text-emerald-700 pl-5">
                  ✓ {s}
                </p>
              ))}
            </div>
          )}

          {/* App Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {version === 'cn' ? '应用名称 *' : 'App Name *'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={version === 'cn' ? '例如: Notion, Figma, 豆包...' : 'e.g. Notion, Figma'}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-[#F0F0F3] border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {version === 'cn' ? '所属分类 *' : 'Category *'}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F0F0F3] border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {version === 'cn' ? '功能描述' : 'Description'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={
                version === 'cn'
                  ? '简要介绍该网页应用的核心特色与用法...'
                  : 'Brief description of features and usage...'
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#F0F0F3] border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {version === 'cn' ? '标签 (逗号或空格分隔)' : 'Tags (separated by comma/spaces)'}
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="AI, 工具, 生产力"
              className="w-full px-3.5 py-2 rounded-xl bg-[#F0F0F3] border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
          </div>

          {/* Brand Color & Logo Preview */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                {version === 'cn' ? '主题颜色' : 'Brand Color'}
              </label>
              <div className="flex items-center gap-1.5">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      brandColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {logoUrl && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 font-medium">
                  {version === 'cn' ? '提取图标' : 'Logo Preview'}
                </span>
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-300 shadow-sm">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-neutral-700 hover:text-neutral-900"
            >
              {version === 'cn' ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{version === 'cn' ? '提交中...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{version === 'cn' ? '确认添加' : 'Add to Store'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
