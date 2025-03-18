"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useLogStore, type LogEntry } from "@/lib/store/log-store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit, FileText, Download } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"
import { toast } from "sonner"

export default function LogDetailPage() {
  const params = useParams()
  const logId = params.id as string

  const getLog = useLogStore((state) => state.getLog)
  const exportTemplates = useLogStore((state) => state.exportTemplates)
  const addExportHistory = useLogStore((state) => state.addExportHistory)
  const [log, setLog] = useState<LogEntry | null>(null)

  useEffect(() => {
    if (logId) {
      const foundLog = getLog(logId)
      if (foundLog) {
        setLog(foundLog)
      } else {
        window.location.href = "/log-entry"
      }
    }
  }, [logId, getLog])

  if (!log) {
    return <div>로딩 중...</div>
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

  const handlePrintPDF = async () => {
    if (!log) return

    try {
      // 기본 PDF 템플릿 사용 (없으면 첫 번째 템플릿 사용)
      const defaultTemplate = exportTemplates.find((t) => t.format === "pdf") || exportTemplates[0]

      if (!defaultTemplate) {
        toast.error("출력 양식 없음", {
          description: "PDF 출력을 위한 양식이 없습니다. 먼저 출력 양식을 생성해주세요.",
        })
        return
      }

      // PDF 생성
      const fileName = `${log.title}_${new Date().toISOString().split("T")[0]}`
      const pdfUrl = await generatePDF([log], defaultTemplate, fileName)

      // 출력 이력 추가
      addExportHistory({
        logIds: [log.id],
        templateId: defaultTemplate.id,
        format: "pdf",
        fileName: `${fileName}.pdf`,
        url: pdfUrl,
      })

      // 다운로드 링크 생성 및 클릭
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = `${fileName}.pdf`
      link.click()

      toast.success("PDF 다운로드 완료", {
        description: "일지가 PDF 형식으로 다운로드되었습니다.",
      })
    } catch (error) {
      console.error("PDF 생성 중 오류 발생:", error)
      toast.error("오류 발생", {
        description: "PDF를 생성하는 중 문제가 발생했습니다. 다시 시도해주세요.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/log-entry")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <h1 className="text-2xl font-bold">{log.title}</h1>
          {log.isDraft && <Badge variant="outline">임시저장</Badge>}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => (window.location.href = `/log-entry/edit/${log.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            편집
          </Button>
          <Button onClick={handlePrintPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF 다운로드
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>일지 내용</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  작성일: {formatDate(log.createdAt)}
                  {log.updatedAt > log.createdAt && <span> (수정됨: {formatDate(log.updatedAt)})</span>}
                </div>
                <div className="whitespace-pre-wrap mt-4">
                  {log.content || <span className="text-muted-foreground">내용이 없습니다.</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {log.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>첨부파일</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {log.attachments.map((file) => (
                    <div key={file.id} className="flex items-center justify-between border p-3 rounded-md">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{file.name}</span>
                        <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>체크리스트</CardTitle>
            </CardHeader>
            <CardContent>
              {log.checklistItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">체크리스트 항목이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {log.checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 border p-3 rounded-md">
                      <Checkbox id={`view-item-${item.id}`} checked={item.checked} disabled />
                      <Label
                        htmlFor={`view-item-${item.id}`}
                        className={`${item.checked ? "line-through text-muted-foreground" : ""}`}
                      >
                        {item.text}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                완료: {log.checklistItems.filter((item) => item.checked).length}/{log.checklistItems.length}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

