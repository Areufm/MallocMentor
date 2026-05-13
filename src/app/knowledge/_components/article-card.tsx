"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eye, Star } from "lucide-react";
import { type ArticleItem, getDifficultyColor } from "../_lib/knowledge-types";

interface ArticleCardProps {
  article: ArticleItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export function ArticleCard({ article, isFavorite, onToggleFavorite }: ArticleCardProps) {
  return (
    <Link className="block" href={`/knowledge/${article.id}`}>
      <div className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Badge className={getDifficultyColor(article.difficulty)} variant="outline">
              {article.difficulty}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{article.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
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
                isFavorite
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-gray-400 hover:text-yellow-500"
              }`}
              onClick={(e) => onToggleFavorite(article.id, e)}
              title={isFavorite ? "取消收藏" : "收藏"}
            >
              <Star className="h-3.5 w-3.5" fill={isFavorite ? "currentColor" : "none"} />
              {article.likes}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
