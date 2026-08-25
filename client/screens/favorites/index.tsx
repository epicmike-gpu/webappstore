import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useFavorites } from '@/hooks/useFavorites';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect } from 'expo-router';

// 未设置环境变量时使用空字符串（相对路径），适配 Vercel 同域部署
const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? '';

interface WebApp {
  id: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  categoryId: string;
  brandColor: string;
  tags: string[];
}

const getFaviconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

// Favorite item component - defined outside to prevent re-renders
function FavoriteItem({
  app,
  onToggleFav,
}: {
  app: WebApp;
  onToggleFav: (id: string) => void;
}) {
  const handleOpen = () => {
    WebBrowser.openBrowserAsync(app.url);
  };

  return (
    <View style={styles.cardOuter}>
      <View style={styles.cardInner}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: getFaviconUrl(app.domain) }}
              style={styles.icon}
              defaultSource={require('@/assets/images/favicon.png')}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.appName} numberOfLines={1}>
              {app.name}
            </Text>
            <Text style={styles.appDesc} numberOfLines={2}>
              {app.description}
            </Text>
            <View style={styles.tagRow}>
              {app.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpen} activeOpacity={0.7}>
              <FontAwesome6 name="arrow-up-right-from-square" size={16} color="#6C63FF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onToggleFav(app.id)}
              activeOpacity={0.7}
            >
              <FontAwesome6 name="heart" size={16} color="#FF6584" solid />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, loaded, toggleFavorite } = useFavorites();
  const [favApps, setFavApps] = useState<WebApp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!loaded) return;
    if (favorites.length === 0) {
      setFavApps([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/apps`);
      const data = await res.json();
      const allApps: WebApp[] = data.data;
      const filtered = allApps.filter((app) => favorites.includes(app.id));
      setFavApps(filtered);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [favorites, loaded]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <FontAwesome6 name="heart" size={48} color="#B2BEC3" />
      </View>
      <Text style={styles.emptyTitle}>还没有收藏</Text>
      <Text style={styles.emptyDesc}>浏览 Web 应用并点击爱心收藏你喜欢的应用</Text>
    </View>
  );

  return (
    <Screen safeAreaEdges={['left', 'right']}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <FontAwesome6 name="heart" size={22} color="#FF6584" solid />
          <Text style={styles.headerTitle}>我的收藏</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {favApps.length > 0 ? `已收藏 ${favApps.length} 个应用` : '收藏你喜欢的 Web 应用'}
        </Text>
      </View>

      <FlatList
        data={favApps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FavoriteItem app={item} onToggleFav={toggleFavorite} />
        )}
        contentContainerStyle={[
          styles.listContent,
          favApps.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F0F0F3',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },

  // Card
  cardOuter: {
    borderRadius: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  cardInner: {
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    padding: 18,
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(108,99,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  appDesc: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6C63FF',
  },
  actions: {
    marginLeft: 10,
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108,99,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8E8EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
  },
});
