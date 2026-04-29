"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useKnowledgeCategories,
  useKnowledgeArticles,
  useKnowledgeFavorites,
  useToggleFavorite,
} from "@/hooks/use-api";
import {
  PAGE_SIZE,
  type ArticleItem,
  type CategoryItem,
  type SortOption,
  type TabOption,
} from "./_lib/knowledge-types";
import { SearchBar } from "./_components/search-bar";
import { TabSwitcher } from "./_components/tab-switcher";
import { CategoryList } from "./_components/category-list";
import { ArticleList } from "./_components/article-list";

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [activeTab, setActiveTab] = useState<TabOption>("all");
  const [page, setPage] = useState(1);

  // 切换条件时重置页码
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, sortBy, activeTab]);

  // 分类列表（独立于 tab）
  const { data: categoriesData } = useKnowledgeCategories();
  const categories = (categoriesData ?? []) as unknown as CategoryItem[];

  // 收藏 id 集合 - 一次拉满 200 个用于列表打星
  const { data: favoriteIdsData } = useKnowledgeFavorites({ page: 1, pageSize: 200 });
  const favoriteIds = useMemo(
    () => new Set((favoriteIdsData?.data ?? []).map((a) => a.id)),
    [favoriteIdsData],
  );

  // 主列表参数（依赖 tab）
  const listParams = useMemo(() => {
    if (activeTab === "favorites") {
      return { page, pageSize: PAGE_SIZE };
    }
    const p: Record<string, string | number> = {
      page,
      pageSize: PAGE_SIZE,
      sort: sortBy,
    };
    if (selectedCategory !== "all") p.category = selectedCategory;
    if (searchQuery) p.search = searchQuery;
    return p;
  }, [activeTab, page, sortBy, selectedCategory, searchQuery]);

  const allListSWR = useKnowledgeArticles(activeTab === "all" ? listParams : undefined);
  const favListSWR = useKnowledgeFavorites(activeTab === "favorites" ? listParams : undefined);
  const listData = activeTab === "favorites" ? favListSWR.data : allListSWR.data;
  const loading = activeTab === "favorites" ? favListSWR.isLoading : allListSWR.isLoading;
  const articles = (listData?.data ?? []) as unknown as ArticleItem[];
  const total = listData?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleFavorite = useToggleFavorite();
  async function handleToggleFavorite(articleId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite.trigger(articleId);
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">知识库</h1>
          <p className="text-gray-500 mt-1">
            深入学习 C/C++ 核心概念和最佳实践
          </p>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="grid gap-6 lg:grid-cols-4">
          {/* 左侧：分类 + 热门 */}
          <div className="space-y-4">
            <TabSwitcher active={activeTab} onChange={setActiveTab} />
            {activeTab === "all" && (
              <CategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectTopic={setSearchQuery}
              />
            )}
          </div>

          {/* 右侧：文章列表 */}
          <div className="lg:col-span-3">
            <ArticleList
              activeTab={activeTab}
              articles={articles}
              total={total}
              page={page}
              totalPages={totalPages}
              loading={loading}
              sortBy={sortBy}
              favoriteIds={favoriteIds}
              onPageChange={setPage}
              onSortChange={setSortBy}
              onToggleFavorite={handleToggleFavorite}
              onSwitchToAll={() => setActiveTab("all")}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
