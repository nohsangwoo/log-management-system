"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useLogStore, type LogTemplate } from "@/lib/store/log-store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TemplateDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const templateId = params.id as string

  const getTemplate = useLogStore((state) => state.getTemplate)
  const createTemplate = useLogStore((state) => state.createTemplate)
  const [template, setTemplate] = useState<LogTemplate | null>(null)

  useEffect(() => {
    if (templateId) {
      const foundTemplate = getTemplate(templateId)
      if (foundTemplate) {
        setTemplate(foundTemplate)
      } else {
        window.location.href = "/checklists"
      }
    }
  }, [templateId, getTemplate])

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
    const newTemplate = {
      ...template,
      name: `${template.name} (복사본)`,
      description: template.description,
      checklistItems: template.checklistItems.map((item) => ({
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      })),
    }

    delete newTemplate.id

    createTemplate(newTemplate as any)
    toast({
      title: "템플릿 복제됨",
      description: "템플릿이 성공적으로 복제되었습니다.",
    })

    window.location.href = "/checklists"
  }

  const handleUseTemplate = () => {
    window.location.href = `/log-entry/new?template=${templateId}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/checklists")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <h1 className="text-2xl font-bold">{template.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => (window.location.href = `/checklists/edit/${template.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            편집
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            복제
          </Button>
          <Button onClick={handleUseTemplate}>이 템플릿으로 일지 작성</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>템플릿 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">설명</h3>
              <p className="mt-1">{template.description || "설명 없음"}</p>
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
          <CardTitle>체크리스트 항목</CardTitle>
        </CardHeader>
        <CardContent>
          {template.checklistItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">체크리스트 항목이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {template.checklistItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-2 border p-3 rounded-md">
                  <span className="text-sm text-muted-foreground">{index + 1}.</span>
                  <Checkbox id={`view-item-${item.id}`} disabled />
                  <Label htmlFor={`view-item-${item.id}`}>
                    {item.text}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            총 {template.checklistItems.length}개 항목, 필수 항목{" "}
            {template.checklistItems.filter((item) => item.required).length}개
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

