"use client"
import Editor from "@monaco-editor/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
}

export function JsonEditor({ value, onChange }: JsonEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "")
  }

  return (
    <Card className="h-full bg-card border-border rounded-none border-0 border-r flex flex-col">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-sm font-mono text-muted-foreground">schema.json</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={handleEditorChange}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full bg-card text-muted-foreground">
              Loading editor...
            </div>
          }
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            wrappingIndent: "indent",
            padding: { top: 16, bottom: 16 },
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </CardContent>
    </Card>
  )
}
