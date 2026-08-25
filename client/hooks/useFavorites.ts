import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@webapp_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const toggleFavorite = useCallback(async (appId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => { /* ignore */ });
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (appId: string) => favorites.includes(appId),
    [favorites]
  );

  return { favorites, loaded, toggleFavorite, isFavorite };
}
