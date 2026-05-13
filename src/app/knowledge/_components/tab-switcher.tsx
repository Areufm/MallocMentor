"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart } from "lucide-react";
import type { TabOption } from "../_lib/knowledge-types";

interface TabSwitcherProps {
  active: TabOption;
  onChange: (tab: TabOption) => void;
}

export function TabSwitcher({ active, onChange }: TabSwitcherProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={active === "all" ? "default" : "outline"}
            className="flex-1"
            onClick={() => onChange("all")}
          >
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            全部文章
          </Button>
          <Button
            size="sm"
            variant={active === "favorites" ? "default" : "outline"}
            className="flex-1"
            onClick={() => onChange("favorites")}
          >
            <Heart className="h-3.5 w-3.5 mr-1" />
            我的收藏
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
