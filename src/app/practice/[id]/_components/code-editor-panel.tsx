"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { MonacoEditor } from "@/components/code-editor/monaco-editor";
import type { Language } from "../_lib/practice-types";

interface CodeEditorPanelProps {
  code: string;
  language: Language;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: Language) => void;
  onReset: () => void;
}

export function CodeEditorPanel({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onReset,
}: CodeEditorPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>代码编辑器</CardTitle>
            <div className="flex rounded-lg border overflow-hidden text-sm">
              <button
                className={`px-3 py-1 transition-colors ${language === "c" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                onClick={() => onLanguageChange("c")}
              >
                C
              </button>
              <button
                className={`px-3 py-1 transition-colors ${language === "cpp" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                onClick={() => onLanguageChange("cpp")}
              >
                C++
              </button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置代码
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <MonacoEditor
          value={code}
          onChange={(value) => onCodeChange(value || "")}
          language={language}
          height="500px"
        />
      </CardContent>
    </Card>
  );
}
