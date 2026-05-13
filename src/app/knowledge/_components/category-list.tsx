"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { HOT_TOPICS, type CategoryItem } from "../_lib/knowledge-types";

interface CategoryListProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (name: string) => void;
  onSelectTopic: (topic: string) => void;
}

export function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectTopic,
}: CategoryListProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">分类</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category.name
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              <span>{category.label}</span>
              <span className="text-xs text-gray-500">{category.articleCount}</span>
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
          {HOT_TOPICS.map((topic, index) => (
            <div key={topic} className="flex items-center gap-2">
              <span
                className={`text-xs font-bold ${index < 3 ? "text-red-500" : "text-gray-400"}`}
              >
                #{index + 1}
              </span>
              <button
                className="flex-1 text-left text-sm hover:text-blue-600 transition-colors"
                onClick={() => onSelectTopic(topic)}
              >
                {topic}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
