"use client"

import { useEffect, useState } from "react"
import { useLogStore, type LogEntry, type ExportTemplate } from "@/lib/store/log-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"

interface LogPreviewProps {
  logId: string
  templateId: string
}

export function LogPreview({ logId, templateId }: LogPreviewProps) {
  const getLog = useLogStore((state) => state.getLog)
  const getExportTemplate = useLogStore((state) => state.getExportTemplate)

  const [log, setLog] = useState<LogEntry | null>(null)
  const [template, setTemplate] = useState<ExportTemplate | null>(null)

  useEffect(() => {
    if (logId) {
      const foundLog = getLog(logId)
      if (foundLog) {
        setLog(foundLog)
      }
    }

    if (templateId) {
      const foundTemplate = getExportTemplate(templateId)
      if (foundTemplate) {
        setTemplate(foundTemplate)
      }
    }
  }, [logId, templateId, getLog, getExportTemplate])

  if (!log) {
    return <div>일지를 찾을 수 없습니다.</div>
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4 p-4">
      {template?.includeHeader && (
        <div className="border-b pb-2 text-center">
          <p className="text-sm">{template.headerText || "일지 관리 시스템"}</p>
        </div>
      )}

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{log.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          작성일: {formatDate(log.createdAt)}
          {log.updatedAt > log.createdAt && <span> (수정됨: {formatDate(log.updatedAt)})</span>}
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>일지 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">
              {log.content || <span className="text-muted-foreground">내용이 없습니다.</span>}
            </div>
          </CardContent>
        </Card>

        {template?.includeChecklist && log.checklistItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>체크리스트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {log.checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 border p-3 rounded-md">
                    <Checkbox id={`preview-item-${item.id}`} checked={item.checked} disabled />
                    <Label
                      htmlFor={`preview-item-${item.id}`}
                      className={`${item.checked ? "line-through text-muted-foreground" : ""}`}
                    >
                      {item.text}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {template?.includeAttachments && log.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>첨부파일</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {log.attachments.map((file) => (
                  <div key={file.id} className="flex items-center space-x-2 border p-3 rounded-md">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {template?.includeFooter && (
        <div className="border-t pt-2 text-center mt-6">
          <p className="text-sm">{template.footerText || "© 일지 관리 시스템"}</p>
        </div>
      )}
    </div>
  )
}

