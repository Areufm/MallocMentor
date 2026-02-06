"use client"

import { Editor } from '@monaco-editor/react'
import { Card } from '@/components/ui/card'

interface MonacoEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  language?: string
  height?: string
}

export function MonacoEditor({ 
  value, 
  onChange, 
  language = 'cpp',
  height = '500px' 
}: MonacoEditorProps) {
  return (
    <Card className="overflow-hidden">
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </Card>
  )
}
