import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CategoryPills } from './components/CategoryPills';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { AppCard } from './components/AppCard';
import { FavoritesView } from './components/FavoritesView';
import { AddAppModal } from './components/AddAppModal';
import { AppDetailsModal } from './components/AppDetailsModal';
import { useFavorites } from './hooks/useFavorites';
import { AppVersion, Category, WebApp } from './types';
import { cnCategories, cnWebApps } from './data/webapps-cn';
import { overseasCategories, overseasWebApps } from './data/webapps-overseas';
import { Sparkles, Layers, Search, Compass, RefreshCw, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [version, setVersion] = useState<AppVersion>('cn');
  const [currentTab, setCurrentTab] = useState<'store' | 'favorites'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [categories, setCategories] = useState<Category[]>(cnCategories);
  const [allApps, setAllApps] = useState<WebApp[]>(cnWebApps);
  const [featuredApps, setFeaturedApps] = useState<WebApp[]>(cnWebApps.slice(0, 6));
  const [loading, setLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<WebApp | null>(null);

  const { favoriteIds, toggleFavorite, isFavorite, count: favoritesCount } = useFavorites();

  // Fetch categories and apps from server (or fallback to static data)
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await fetch(`/api/v1/apps/categories?version=${version}`);
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.data);
        }
      }

      // 2. Fetch featured
      const featRes = await fetch(`/api/v1/apps/featured?version=${version}`);
      if (featRes.ok) {
        const featData = await featRes.json();
        if (featData.success) {
          setFeaturedApps(featData.data);
        }
      }

      // 3. Fetch apps
      const appsRes = await fetch(`/api/v1/apps?version=${version}`);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        if (appsData.success) {
          setAllApps(appsData.data);
        }
      }
    } catch {
      // Fallback
      const baseCats = version === 'overseas' ? overseasCategories : cnCategories;
      const baseApps = version === 'overseas' ? overseasWebApps : cnWebApps;
      setCategories(
        baseCats.map((c) => ({
          ...c,
          count: baseApps.filter((a) => a.categoryId === c.id).length,
        }))
      );
      setAllApps(baseApps);
      setFeaturedApps(baseApps.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory('all');
    fetchData();
  }, [version]);

  // Filtered Apps for main display
  const displayedApps = useMemo(() => {
    let list = allApps;

    if (selectedCategory !== 'all') {
      list = list.filter((a) => a.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.domain.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allApps, selectedCategory, searchQuery]);

  // Favorite Apps full objects
  const favoriteApps = useMemo(() => {
    const combinedAll = [...cnWebApps, ...overseasWebApps, ...allApps];
    const map = new Map<string, WebApp>();
    combinedAll.forEach((a) => map.set(a.id, a));
    return favoriteIds.map((id) => map.get(id)).filter(Boolean) as WebApp[];
  }, [favoriteIds, allApps]);

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F0F0F3] text-neutral-800 pb-16">
      {/* Top Sticky Header */}
      <Header
        version={version}
        onVersionChange={setVersion}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favoritesCount}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {currentTab === 'favorites' ? (
          <FavoritesView
            favoriteApps={favoriteApps}
            onOpenDetails={setSelectedApp}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            onBackToStore={() => setCurrentTab('store')}
            version={version}
          />
        ) : (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <CategoryPills
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              totalApps={allApps.length}
              version={version}
            />

            {/* Featured Section (Shown when no search and on 'all' tab) */}
            {!searchQuery && selectedCategory === 'all' && (
              <FeaturedCarousel
                apps={featuredApps}
                onOpenApp={setSelectedApp}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                version={version}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {/* App Catalog Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-100 text-indigo-600">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-neutral-900">
                    {searchQuery
                      ? version === 'cn'
                        ? `搜索结果: "${searchQuery}"`
                        : `Search Results for "${searchQuery}"`
                      : selectedCategory === 'all'
                      ? version === 'cn'
                        ? '全部精选 Web 应用程序'
                        : 'Explore All Web Applications'
                      : selectedCategoryObj?.name || '分类应用'}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-bold">
                    {displayedApps.length}
                  </span>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                  >
                    {version === 'cn' ? '清除筛选' : 'Clear search'}
                  </button>
                )}
              </div>

              {/* Grid of App Cards */}
              {displayedApps.length === 0 ? (
                <div className="p-12 rounded-3xl neu-flat border border-white/60 text-center space-y-3 max-w-md mx-auto my-8">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800">
                    {version === 'cn' ? '未找到相关 Web 应用' : 'No Web Apps Found'}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    {version === 'cn'
                      ? '您可以尝试使用其他关键词，或点击右上角「提交应用」将其收录进来'
                      : 'Try different search terms or click "Submit App" to add it'}
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{version === 'cn' ? '提交收录' : 'Submit Application'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onOpenDetails={setSelectedApp}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={isFavorite(app.id)}
                      version={version}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Add App Modal */}
      <AddAppModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        version={version}
        onAppAdded={() => {
          fetchData();
        }}
      />

      {/* App Details Modal */}
      <AppDetailsModal
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onToggleFavorite={toggleFavorite}
        isFavorite={selectedApp ? isFavorite(selectedApp.id) : false}
        version={version}
      />
    </div>
  );
};

export default App;
