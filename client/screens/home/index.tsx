import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFavorites } from '@/hooks/useFavorites';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

// 未设置环境变量时使用空字符串（相对路径），适配 Vercel 同域部署
const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? '';

type AppVersion = 'overseas' | 'cn';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  count: number;
}

interface WebApp {
  id: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  categoryId: string;
  brandColor: string;
  logoUrl?: string | null;
  tags: string[];
}

// Favicon URL helper
const getFaviconUrl = (domain: string) => {
  return `https://logo.clearbit.com/${domain}`;
};

// 生成首字母图标颜色
const getInitialColor = (name: string) => {
  const colors = ['#6C63FF', '#FF6584', '#00B894', '#FDCB6E', '#E17055', '#74B9FF', '#A29BFE', '#FD79A8'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// App Icon Component - 真正的 App Store 风格图标
function AppIcon({ app, size = 48 }: { app: WebApp; size?: number }) {
  const [iconError, setIconError] = useState(false);
  const bgColor = app.brandColor || getInitialColor(app.name);

  // 优先使用网页提取的 logo，否则使用 Clearbit
  const iconUrl = app.logoUrl || getFaviconUrl(app.domain);

  // 获取应用简称（1-2 个字）
  const getShortName = (name: string) => {
    if (name.length <= 2) return name;
    return name.substring(0, 2);
  };

  return (
    <View
      style={[
        styles.appIconBox,
        {
          width: size,
          height: size,
          borderRadius: size * 0.22,
          backgroundColor: bgColor,
        },
      ]}
    >
      {!iconError ? (
        <Image
          source={{ uri: iconUrl }}
          style={[styles.appIconImage, { width: size * 0.9, height: size * 0.9 }]}
          onError={() => setIconError(true)}
        />
      ) : (
        <Text
          style={[
            styles.appIconText,
            {
              fontSize: size * 0.35,
              color: '#FFFFFF',
              fontWeight: 'bold',
            },
          ]}
        >
          {getShortName(app.name)}
        </Text>
      )}
    </View>
  );
}

// App Card Component - defined outside to prevent re-renders
function AppCard({
  app,
  isFav,
  onToggleFav,
}: {
  app: WebApp;
  isFav: boolean;
  onToggleFav: (id: string) => void;
}) {
  const handleOpen = () => {
    WebBrowser.openBrowserAsync(app.url);
  };

  return (
    <View style={styles.cardOuter}>
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <AppIcon app={app} size={48} />
          <TouchableOpacity
            style={styles.favButton}
            onPress={() => onToggleFav(app.id)}
            activeOpacity={0.6}
          >
            <FontAwesome6
              name={isFav ? 'heart' : 'heart'}
              size={18}
              color={isFav ? '#FF6584' : '#B2BEC3'}
              solid={isFav}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.appName} numberOfLines={1}>
          {app.name}
        </Text>
        <Text style={styles.appDesc} numberOfLines={2}>
          {app.description}
        </Text>
        <TouchableOpacity style={styles.visitButton} onPress={handleOpen} activeOpacity={0.7}>
          <Text style={styles.visitButtonText}>访问</Text>
          <FontAwesome6 name="arrow-up-right-from-square" size={10} color="#6C63FF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Featured Card Component
function FeaturedCard({
  app,
  isFav,
  onToggleFav,
}: {
  app: WebApp;
  isFav: boolean;
  onToggleFav: (id: string) => void;
}) {
  const handleOpen = () => {
    WebBrowser.openBrowserAsync(app.url);
  };

  return (
    <TouchableOpacity
      style={styles.featuredCardOuter}
      onPress={handleOpen}
      activeOpacity={0.8}
    >
      <View style={styles.featuredCardInner}>
        <AppIcon app={app} size={56} />
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredName} numberOfLines={1}>
            {app.name}
          </Text>
          <Text style={styles.featuredDesc} numberOfLines={1}>
            {app.tags[0]}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.featuredFavBtn}
          onPress={() => onToggleFav(app.id)}
          activeOpacity={0.6}
        >
          <FontAwesome6
            name="heart"
            size={16}
            color={isFav ? '#FF6584' : '#B2BEC3'}
            solid={isFav}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Add App Modal Component
function AddAppModal({
  visible,
  categories,
  version,
  onClose,
  onAdded,
}: {
  visible: boolean;
  categories: Category[];
  version: AppVersion;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingSafety, setCheckingSafety] = useState(false);
  const [safetyResult, setSafetyResult] = useState<{
    isSafe: boolean;
    score: number;
    warnings: string[];
    suggestions: string[];
  } | null>(null);

  const resetForm = () => {
    setName('');
    setUrl('');
    setCategoryId('');
    setDescription('');
    setTags('');
    setSafetyResult(null);
  };

  // 验证 URL 安全性
  const checkSafety = async () => {
    if (!url.trim()) {
      Alert.alert('提示', '请先输入 URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      Alert.alert('提示', '请输入有效的 URL');
      return;
    }

    setCheckingSafety(true);
    try {
      /**
       * 服务端文件：server/src/routes/apps.ts
       * 接口：POST /api/v1/apps
       * Body 参数：name: string, url: string, categoryId: string, description?: string, tags?: string[]
       * 返回：safetyCheck 包含安全验证结果
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/apps?version=${version}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || '临时检查',
          url: url.trim(),
          categoryId: categoryId || 'productivity',
          description: '',
          tags: [],
        }),
      });
      const data = await res.json();
      
      if (data.safetyCheck) {
        setSafetyResult(data.safetyCheck);
        
        if (!data.safetyCheck.isSafe) {
          Alert.alert(
            '安全验证未通过',
            `安全评分：${data.safetyCheck.score}/100\n\n警告：\n${data.safetyCheck.warnings.join('\n')}`,
            [{ text: '确定' }]
          );
        }
      }
    } catch (err) {
      Alert.alert('验证失败', '无法进行安全验证');
    } finally {
      setCheckingSafety(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入应用名称');
      return;
    }
    if (!url.trim()) {
      Alert.alert('提示', '请输入应用 URL');
      return;
    }
    if (!categoryId) {
      Alert.alert('提示', '请选择分类');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      Alert.alert('提示', '请输入有效的 URL（如 https://example.com）');
      return;
    }

    // 先检查安全性
    if (!safetyResult) {
      Alert.alert(
        '安全验证',
        '请先点击"验证安全性"按钮检查 URL 是否安全',
        [{ text: '确定' }]
      );
      return;
    }

    if (!safetyResult.isSafe) {
      Alert.alert(
        '安全验证未通过',
        `该 URL 可能存在安全风险，建议不要添加。\n\n警告：\n${safetyResult.warnings.join('\n')}`,
        [{ text: '确定' }]
      );
      return;
    }

    setSubmitting(true);
    try {
      /**
       * 服务端文件：server/src/routes/apps.ts
       * 接口：POST /api/v1/apps
       * Body 参数：name: string, url: string, categoryId: string, description?: string, tags?: string[]
       */
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/apps?version=${version}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          categoryId,
          description: description.trim() || undefined,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        resetForm();
        onClose();
        onAdded();
      } else {
        Alert.alert('添加失败', data.error || '未知错误');
      }
    } catch (err) {
      Alert.alert('添加失败', '网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={Platform.OS === 'web'}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>添加 Web App</Text>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <FontAwesome6 name="xmark" size={20} color="#636E72" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.formLabel}>应用名称 *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="例如：ChatGPT"
                  placeholderTextColor="#B2BEC3"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.formLabel}>URL *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://example.com"
                  placeholderTextColor="#B2BEC3"
                  value={url}
                  onChangeText={(text) => {
                    setUrl(text);
                    setSafetyResult(null); // 清除之前的验证结果
                  }}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* 安全验证按钮 */}
                <TouchableOpacity
                  style={styles.safetyCheckBtn}
                  onPress={checkSafety}
                  disabled={checkingSafety || !url.trim()}
                  activeOpacity={0.7}
                >
                  <FontAwesome6
                    name={checkingSafety ? 'spinner' : 'shield-halved'}
                    size={16}
                    color={checkingSafety ? '#B2BEC3' : '#6C63FF'}
                    spin={checkingSafety}
                  />
                  <Text style={styles.safetyCheckBtnText}>
                    {checkingSafety ? '验证中...' : '验证安全性'}
                  </Text>
                </TouchableOpacity>

                {/* 安全验证结果 */}
                {safetyResult && (
                  <View style={[
                    styles.safetyResult,
                    { backgroundColor: safetyResult.isSafe ? '#E8F5E9' : '#FFEBEE' }
                  ]}>
                    <View style={styles.safetyScore}>
                      <Text style={[
                        styles.safetyScoreText,
                        { color: safetyResult.isSafe ? '#2E7D32' : '#C62828' }
                      ]}>
                        {safetyResult.score}
                      </Text>
                      <Text style={styles.safetyScoreLabel}>安全评分</Text>
                    </View>
                    <View style={styles.safetyDetails}>
                      {safetyResult.warnings.length > 0 && (
                        <>
                          <Text style={styles.safetyWarningTitle}>警告</Text>
                          {safetyResult.warnings.map((w, i) => (
                            <Text key={i} style={styles.safetyWarningText}>• {w}</Text>
                          ))}
                        </>
                      )}
                      {safetyResult.suggestions.length > 0 && (
                        <>
                          <Text style={styles.safetySuggestionTitle}>建议</Text>
                          {safetyResult.suggestions.map((s, i) => (
                            <Text key={i} style={styles.safetySuggestionText}>• {s}</Text>
                          ))}
                        </>
                      )}
                    </View>
                  </View>
                )}

                <Text style={styles.formLabel}>分类 *</Text>
                <View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categorySelectScroll}
                  >
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categorySelectPill,
                          categoryId === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                        ]}
                        onPress={() => setCategoryId(cat.id)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.categorySelectText,
                            categoryId === cat.id && { color: '#FFFFFF' },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.formLabel}>描述（可选）</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="简单描述这个应用..."
                  placeholderTextColor="#B2BEC3"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Text style={styles.formLabel}>标签（可选，逗号分隔）</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="例如：AI, 对话, 效率"
                  placeholderTextColor="#B2BEC3"
                  value={tags}
                  onChangeText={setTags}
                />
              </ScrollView>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                  disabled={submitting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.7}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>添加</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [version, setVersion] = useState<AppVersion>('cn');
  const [categories, setCategories] = useState<Category[]>([]);
  const [apps, setApps] = useState<WebApp[]>([]);
  const [featured, setFeatured] = useState<WebApp[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WebApp[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Fetch categories and apps
  const fetchData = async () => {
    try {
      const [catRes, appRes, featRes] = await Promise.all([
        fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/apps/categories?version=${version}`),
        fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/apps?version=${version}`),
        fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/apps/featured?version=${version}`),
      ]);
      const [catData, appData, featData] = await Promise.all([
        catRes.json(),
        appRes.json(),
        featRes.json(),
      ]);
      setCategories(catData.data);
      setApps(appData.data);
      setFeatured(featData.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [version]);

  // Refresh after adding new app
  const handleAppAdded = () => {
    fetchData();
  };

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/apps/search?q=${encodeURIComponent(searchQuery)}&version=${version}`
        );
        const data = await res.json();
        setSearchResults(data.data);
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, version]);

  const displayApps = searchResults !== null
    ? searchResults
    : selectedCategory === 'all'
      ? apps
      : apps.filter((app) => app.categoryId === selectedCategory);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSearchQuery('');
    setSearchResults(null);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 16 },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Web App Store</Text>
              <Text style={styles.headerSubtitle}>发现并收藏你喜欢的 Web 应用</Text>
            </View>
            <View style={styles.headerActions}>
              {/* Version Toggle */}
              <TouchableOpacity
                style={styles.versionToggle}
                onPress={() => setVersion(version === 'cn' ? 'overseas' : 'cn')}
                activeOpacity={0.7}
              >
                <FontAwesome6
                  name={version === 'cn' ? 'globe' : 'flag'}
                  size={16}
                  color="#6C63FF"
                />
                <Text style={styles.versionToggleText}>
                  {version === 'cn' ? '国内版' : '海外版'}
                </Text>
              </TouchableOpacity>
              {/* Favorites Button */}
              <TouchableOpacity
                style={styles.favNavButton}
                onPress={() => router.navigate('/favorites')}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="heart" size={20} color="#FF6584" solid />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <FontAwesome6 name="magnifying-glass" size={16} color="#B2BEC3" />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索 Web 应用..."
              placeholderTextColor="#B2BEC3"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults(null); }}>
                <FontAwesome6 name="xmark" size={16} color="#B2BEC3" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Pills */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryPill,
                selectedCategory === 'all' && styles.categoryPillActive,
              ]}
              onPress={() => handleCategorySelect('all')}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="grip"
                size={14}
                color={selectedCategory === 'all' ? '#FFFFFF' : '#636E72'}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === 'all' && styles.categoryPillTextActive,
                ]}
              >
                全部
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  selectedCategory === cat.id && styles.categoryPillActive,
                ]}
                onPress={() => handleCategorySelect(cat.id)}
                activeOpacity={0.7}
              >
                <FontAwesome6
                  name={cat.icon as any}
                  size={14}
                  color={selectedCategory === cat.id ? '#FFFFFF' : '#636E72'}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    selectedCategory === cat.id && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Results */}
        {searchResults !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              搜索结果 ({searchResults.length})
            </Text>
            {searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesome6 name="magnifying-glass" size={40} color="#B2BEC3" />
                <Text style={styles.emptyText}>未找到相关应用</Text>
              </View>
            ) : (
              <View style={styles.appGrid}>
                {searchResults.map((app) => (
                  <View key={app.id} style={styles.gridItem}>
                    <AppCard
                      app={app}
                      isFav={isFavorite(app.id)}
                      onToggleFav={toggleFavorite}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Featured Section (only show when no search & all category) */}
        {searchResults === null && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>精选推荐</Text>
              <FontAwesome6 name="fire" size={16} color="#FF6584" />
            </View>
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredScroll}
              >
                {featured.map((app) => (
                  <FeaturedCard
                    key={app.id}
                    app={app}
                    isFav={isFavorite(app.id)}
                    onToggleFav={toggleFavorite}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* All Apps Grid */}
        {searchResults === null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all'
                ? '全部应用'
                : categories.find((c) => c.id === selectedCategory)?.name ?? ''}
            </Text>
            <View style={styles.appGrid}>
              {displayApps.map((app) => (
                <View key={app.id} style={styles.gridItem}>
                  <AppCard
                    app={app}
                    isFav={isFavorite(app.id)}
                    onToggleFav={toggleFavorite}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB - Add App Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <FontAwesome6 name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add App Modal */}
      <AddAppModal
        visible={addModalVisible}
        categories={categories}
        version={version}
        onClose={() => setAddModalVisible(false)}
        onAdded={handleAppAdded}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
  },

  // App Icon Box - 真正的 App Store 风格图标
  appIconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  appIconImage: {
    resizeMode: 'contain',
  },
  appIconText: {
    fontWeight: 'bold',
  },

  // Header
  header: {
    paddingBottom: 16,
    backgroundColor: '#F0F0F3',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  versionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F3',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    ...(Platform.OS === 'android' && {
      elevation: 3,
    }),
  },
  versionToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  favNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    ...(Platform.OS === 'android' && {
      elevation: 4,
    }),
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3436',
    marginLeft: 10,
    paddingVertical: 0,
  },

  // Categories
  categorySection: {
    marginBottom: 20,
  },
  categoryScroll: {
    paddingHorizontal: 2,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#F0F0F3',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    gap: 6,
    ...(Platform.OS === 'android' && {
      elevation: 2,
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.5)',
    }),
  },
  categoryPillActive: {
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },

  // Featured
  featuredScroll: {
    gap: 12,
    paddingRight: 20,
  },
  featuredCardOuter: {
    borderRadius: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  featuredCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    padding: 14,
    minWidth: 200,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    ...(Platform.OS === 'android' && {
      elevation: 4,
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.5)',
    }),
  },
  featuredInfo: {
    flex: 1,
    marginLeft: 10,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
  featuredDesc: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  featuredFavBtn: {
    padding: 6,
  },

  // App Grid
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47.5%',
  },

  // App Card
  cardOuter: {
    borderRadius: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    marginBottom: 4,
  },
  cardInner: {
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    ...(Platform.OS === 'android' && {
      elevation: 4,
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.5)',
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  favButton: {
    padding: 4,
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  appDesc: {
    fontSize: 12,
    color: '#636E72',
    lineHeight: 17,
    marginBottom: 12,
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(108,99,255,0.10)',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  visitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#B2BEC3',
    marginTop: 12,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    ...(Platform.OS === 'android' && {
      elevation: 6,
    }),
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F0F0F3',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    ...(Platform.OS === 'android' && {
      elevation: 10,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 500,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E8E8EB',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#636E72',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Form
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 8,
    marginTop: 4,
  },
  formInput: {
    backgroundColor: '#E8E8EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelectScroll: {
    gap: 8,
    marginBottom: 16,
  },
  categorySelectPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#E8E8EB',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categorySelectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
  },

  // Safety Check
  safetyCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F3',
    borderWidth: 1,
    borderColor: '#DFE6E9',
    marginBottom: 16,
  },
  safetyCheckBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  safetyResult: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  safetyScore: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  safetyScoreText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  safetyScoreLabel: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
  },
  safetyDetails: {
    flex: 1,
  },
  safetyWarningTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 4,
  },
  safetyWarningText: {
    fontSize: 12,
    color: '#C62828',
    marginBottom: 2,
  },
  safetySuggestionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
    marginTop: 8,
  },
  safetySuggestionText: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 2,
  },
});
