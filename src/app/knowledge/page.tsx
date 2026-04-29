"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  BookOpen,
  Star,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import {
  useKnowledgeCategories,
  useKnowledgeArticles,
  useKnowledgeFavorites,
  useToggleFavorite,
} from "@/hooks/use-api";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  difficulty: string;
  tags: string[];
  views: number;
  likes: number;
  author: string;
  estimatedTime?: number;
  updatedAt: string;
}

interface CategoryItem {
  id: string;
  name: string;
  label: string;
  articleCount: number;
}

type SortOption = "newest" | "views" | "likes";
type TabOption = "all" | "favorites";

const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof Eye }[] = [
  { value: "newest", label: "最新", icon: ArrowUpDown },
  { value: "views", label: "浏览量", icon: Eye },
  { value: "likes", label: "收藏量", icon: Heart },
];

const PAGE_SIZE = 10;

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
  const handleToggleFavorite = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite.trigger(articleId);
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">知识库</h1>
          <p className="text-gray-500 mt-1">
            深入学习 C/C++ 核心概念和最佳实践
          </p>
        </div>

        {/* 搜索框 */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="搜索知识点、概念、关键词..."
                className="pl-10 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* 左侧：分类 + 热门 */}
          <div className="space-y-4">
            {/* Tab 切换：全部 / 我的收藏 */}
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={activeTab === "all" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setActiveTab("all")}
                  >
                    <BookOpen className="h-3.5 w-3.5 mr-1" />
                    全部文章
                  </Button>
                  <Button
                    size="sm"
                    variant={activeTab === "favorites" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setActiveTab("favorites")}
                  >
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    我的收藏
                  </Button>
                </div>
              </CardContent>
            </Card>

            {activeTab === "all" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">分类</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.name
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{category.label}</span>
                        <span className="text-xs text-gray-500">
                          {category.articleCount}
                        </span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      热门话题
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {["智能指针", "STL 容器", "内存管理", "多线程", "模板编程"].map(
                      (topic, index) => (
                        <div key={topic} className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${index < 3 ? "text-red-500" : "text-gray-400"}`}
                          >
                            #{index + 1}
                          </span>
                          <button
                            className="flex-1 text-left text-sm hover:text-blue-600 transition-colors"
                            onClick={() => setSearchQuery(topic)}
                          >
                            {topic}
                          </button>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* 右侧：文章列表 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {activeTab === "favorites" ? "我的收藏" : "知识文章"}
                    </CardTitle>
                    <CardDescription>
                      共 {total} 篇{activeTab === "favorites" ? "收藏" : "文章"}
                    </CardDescription>
                  </div>
                  {/* 排序按钮组 */}
                  {activeTab === "all" && (
                    <div className="flex items-center gap-1">
                      {SORT_OPTIONS.map((opt) => (
                        <Button
                          key={opt.value}
                          size="sm"
                          variant={sortBy === opt.value ? "default" : "ghost"}
                          className="text-xs h-7 px-2.5"
                          onClick={() => setSortBy(opt.value)}
                        >
                          <opt.icon className="h-3 w-3 mr-1" />
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {activeTab === "favorites"
                        ? "还没有收藏任何文章，去浏览文章并点击 ★ 收藏吧"
                        : "暂无文章"}
                    </p>
                    {activeTab === "favorites" && (
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => setActiveTab("all")}
                      >
                        浏览全部文章
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article) => {
                      const isFav = favoriteIds.has(article.id);
                      return (
                        <Link
                          className="block"
                          key={article.id}
                          href={`/knowledge/${article.id}`}
                        >
                          <div className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors">
                                {article.title}
                              </h3>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                <Badge
                                  className={getDifficultyColor(
                                    article.difficulty,
                                  )}
                                  variant="outline"
                                >
                                  {article.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {article.summary}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {article.tags.map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {article.views}
                                </span>
                                <button
                                  className={`flex items-center gap-1 transition-colors ${
                                    isFav
                                      ? "text-yellow-500 hover:text-yellow-600"
                                      : "text-gray-400 hover:text-yellow-500"
                                  }`}
                                  onClick={(e) =>
                                    handleToggleFavorite(article.id, e)
                                  }
                                  title={isFav ? "取消收藏" : "收藏"}
                                >
                                  <Star
                                    className="h-3.5 w-3.5"
                                    fill={isFav ? "currentColor" : "none"}
                                  />
                                  {article.likes}
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}

                    {/* 分页 */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm text-gray-500">
                          第 {page} / {totalPages} 页，共 {total} 篇
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            上一页
                          </Button>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((p) => (
                            <Button
                              key={p}
                              variant={p === page ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                          >
                            下一页
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
