"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";

interface CelebrateCardProps {
  onDismiss: () => void;
}

export function CelebrateCard({ onDismiss }: CelebrateCardProps) {
  return (
    <Card className="border-yellow-300 bg-linear-to-br from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-950/40 dark:to-orange-950/30">
      <CardContent className="pt-6 text-center space-y-4">
        <Trophy className="h-16 w-16 text-yellow-500 mx-auto animate-bounce" />
        <h3 className="text-2xl font-bold">恭喜完成当前路径！</h3>
        <p className="text-gray-600 dark:text-gray-400">
          你已经掌握了本阶段的所有内容，继续挑战下一个目标吧！
        </p>
        <Button onClick={onDismiss} className="mt-2">
          <ArrowRight className="h-4 w-4 mr-2" />
          查看下一阶段
        </Button>
      </CardContent>
    </Card>
  );
}
