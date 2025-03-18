"use client"

import { useLogStore } from "@/lib/store/log-store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Copy, CheckSquare, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export function TemplateList() {
  const router = useRouter()
  const templates = useLogStore((state) => state.templates)
  const deleteTemplate = useLogStore((state) => state.deleteTemplate)
  const createTemplate = useLogStore((state) => state.createTemplate)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete)
      setTemplateToDelete(null)
      toast({
        title: "템플릿 삭제됨",
        description: "템플릿이 성공적으로 삭제되었습니다.",
      })
    }
  }

  const handleDuplicate = (template: any) => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} (복사본)`,
        description: template.description,
        checklistItems: template.checklistItems.map((item: any) => ({
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
    } catch (error) {
      console.error("템플릿 복제 중 오류 발생:", error)
      toast({
        title: "오류 발생",
        description: "템플릿을 복제하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleNewTemplate = () => {
    console.log("새 템플릿 만들기 버튼 클릭")
    window.location.href = "/checklists/new"
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">생성된 템플릿이 없습니다.</p>
        <Button className="mt-4" onClick={handleNewTemplate}>
          <PlusCircle className="mr-2 h-4 w-4" />새 템플릿 만들기
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground">생성일: {formatDate(template.createdAt)}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="line-clamp-3 text-sm">{template.description || "설명 없음"}</p>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">체크리스트 항목: {template.checklistItems.length}개</p>
              <p className="text-xs text-muted-foreground">
                필수 항목: {template.checklistItems.filter((item) => item.required).length}개
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = `/checklists/${template.id}`)}>
              <CheckSquare className="mr-2 h-4 w-4" />
              보기
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = `/checklists/edit/${template.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                편집
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDuplicate(template)}>
                <Copy className="mr-2 h-4 w-4" />
                복제
              </Button>
              <AlertDialog
                open={templateToDelete === template.id}
                onOpenChange={(open) => !open && setTemplateToDelete(null)}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setTemplateToDelete(template.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>템플릿 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

