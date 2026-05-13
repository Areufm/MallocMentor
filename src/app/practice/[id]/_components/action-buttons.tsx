"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Play, Send } from "lucide-react";

interface ActionButtonsProps {
  isRunning: boolean;
  isSubmitting: boolean;
  onRun: () => void;
  onSubmit: () => void;
}

export function ActionButtons({
  isRunning,
  isSubmitting,
  onRun,
  onSubmit,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onRun} disabled={isRunning} variant="outline" className="flex-1">
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            运行中...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            运行代码
          </>
        )}
      </Button>
      <Button onClick={onSubmit} disabled={isSubmitting} className="flex-1">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            提交中...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            提交并审查
          </>
        )}
      </Button>
    </div>
  );
}
