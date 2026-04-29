"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RunResult({ output }: { output: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">运行结果</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded-lg overflow-auto whitespace-pre-wrap">
          {output}
        </pre>
      </CardContent>
    </Card>
  );
}
