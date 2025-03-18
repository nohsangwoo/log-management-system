"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLogStore, type ExportTemplate } from "@/lib/store/log-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Copy } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const templateId = params.id as string

  const getExportTemplate = useLogStore((state) => state.getExportTemplate)
  const createExportTemplate = useLogStore((state) => state.createExportTemplate)
  const [template, setTemplate] = useState<ExportTemplate | null>(null)

  useEffect(() => {
    if (templateId) {
      const foundTemplate = getExportTemplate(templateId)
      if (foundTemplate) {
        setTemplate(foundTemplate)
      } else {
        router.push("/document-conversion?tab=templates")
      }
    }
  }, [templateId, getExportTemplate, router])

  if (!template) {
    return <div>로딩 중...</div>
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDuplicate = () => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} (복사본)`,
      }

      delete (newTemplate as any).id
      delete (newTemplate as any).createdAt

      createExportTemplate(newTemplate)
      toast({
        title: "양식 복제됨",
        description: "출력 양식이 성공적으로 복제되었습니다.",
      })

      router.push("/document-conversion?tab=templates")
    } catch (error) {
      console.error("양식 복제 중 오류 발생:", error)
      toast({
        title: "오류 발생",
        description: "양식을 복제하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const getFormatLabel = (format: string) => {
    switch (format) {
      case "pdf":
        return "PDF"
      case "docx":
        return "Word"
      case "xlsx":
        return "Excel"
      default:
        return format.toUpperCase()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/document-conversion?tab=templates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{template.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/document-conversion/templates/edit/${template.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              편집
            </Link>
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            복제
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>양식 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">출력 형식</h3>
              <p className="mt-1">
                <Badge>{getFormatLabel(template.format)}</Badge>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">생성일</h3>
              <p className="mt-1">{formatDate(template.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>포함 항목</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">헤더</h3>
              <p className="text-sm">{template.includeHeader ? "포함" : "제외"}</p>
              {template.includeHeader && template.headerText && (
                <p className="text-sm text-muted-foreground">"{template.headerText}"</p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">푸터</h3>
              <p className="text-sm">{template.includeFooter ? "포함" : "제외"}</p>
              {template.includeFooter && template.footerText && (
                <p className="text-sm text-muted-foreground">"{template.footerText}"</p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">체크리스트</h3>
              <p className="text-sm">{template.includeChecklist ? "포함" : "제외"}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">첨부파일</h3>
              <p className="text-sm">{template.includeAttachments ? "포함" : "제외"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

