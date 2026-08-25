import { Tabs } from 'expo-router';
import { Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle: ViewStyle = {
    backgroundColor: '#F0F0F3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 0,
    paddingTop: 12,
    paddingBottom: insets.bottom + 8,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    ...(Platform.OS === 'web' ? { height: 'auto' as unknown as number } : {}),
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#B2BEC3',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '发现',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="compass" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: '收藏',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="heart" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
