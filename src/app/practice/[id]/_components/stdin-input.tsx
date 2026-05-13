"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Terminal } from "lucide-react";
import {
  extractStdinFromTestCase,
  type ProblemTestCase,
} from "../_lib/practice-types";

interface StdinInputProps {
  value: string;
  onChange: (value: string) => void;
  testCases: ProblemTestCase[];
}

export function StdinInput({ value, onChange, testCases }: StdinInputProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            标准输入 (stdin)
          </CardTitle>
          {testCases.length > 0 && (
            <div className="flex gap-1">
              {testCases.map((tc, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => onChange(extractStdinFromTestCase(tc.input))}
                  title={`填入测试用例 ${i + 1} 的输入`}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  用例 {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="程序运行时需要读取的输入数据（如 scanf 读取的内容）&#10;点击右上角「用例」按钮可一键填入测试数据"
          className="w-full h-20 p-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </CardContent>
    </Card>
  );
}
