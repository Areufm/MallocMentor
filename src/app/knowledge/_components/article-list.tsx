"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ArticleCard } from "./article-card";
import {
  SORT_OPTIONS,
  type ArticleItem,
  type SortOption,
  type TabOption,
} from "../_lib/knowledge-types";

interface ArticleListProps {
  activeTab: TabOption;
  articles: ArticleItem[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  sortBy: SortOption;
  favoriteIds: Set<string>;
  onPageChange: (page: number) => void;
  onSortChange: (sort: SortOption) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSwitchToAll: () => void;
}

export function ArticleList({
  activeTab,
  articles,
  total,
  page,
  totalPages,
  loading,
  sortBy,
  favoriteIds,
  onPageChange,
  onSortChange,
  onToggleFavorite,
  onSwitchToAll,
}: ArticleListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{activeTab === "favorites" ? "我的收藏" : "知识文章"}</CardTitle>
            <CardDescription>
              共 {total} 篇{activeTab === "favorites" ? "收藏" : "文章"}
            </CardDescription>
          </div>
          {activeTab === "all" && (
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={sortBy === opt.value ? "default" : "ghost"}
                  className="text-xs h-7 px-2.5"
                  onClick={() => onSortChange(opt.value)}
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
          <EmptyState activeTab={activeTab} onSwitchToAll={onSwitchToAll} />
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isFavorite={favoriteIds.has(article.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={onPageChange}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  activeTab,
  onSwitchToAll,
}: {
  activeTab: TabOption;
  onSwitchToAll: () => void;
}) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">
        {activeTab === "favorites"
          ? "还没有收藏任何文章，去浏览文章并点击 ★ 收藏吧"
          : "暂无文章"}
      </p>
      {activeTab === "favorites" && (
        <Button variant="outline" className="mt-3" onClick={onSwitchToAll}>
          浏览全部文章
        </Button>
      )}
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <span className="text-sm text-gray-500">
        第 {page} / {totalPages} 页，共 {total} 篇
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          上一页
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
