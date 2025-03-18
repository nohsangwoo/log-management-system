"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLogStore } from "@/lib/store/log-store"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreVertical, Trash, Copy, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ExportTemplateList() {
  const router = useRouter()
  const { toast } = useToast()
  const templates = useLogStore((state) => state.exportTemplates)
  const deleteExportTemplate = useLogStore((state) => state.deleteExportTemplate)
  const createExportTemplate = useLogStore((state) => state.createExportTemplate)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setTemplateToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteExportTemplate(templateToDelete)
      toast({
        title: "양식 삭제됨",
        description: "출력 양식이 성공적으로 삭제되었습니다.",
      })
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  const handleDuplicate = (id: string) => {
    const template = templates.find(t => t.id === id)
    if (template) {
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
      } catch (error) {
        console.error("양식 복제 중 오류 발생:", error)
        toast({
          title: "오류 발생",
          description: "양식을 복제하는 중 문제가 발생했습니다.",
          variant: "destructive",
        })
      }
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

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">등록된 출력 양식이 없습니다.</p>
        <Button onClick={() => router.push("/document-conversion/templates/new")}>
          새 출력 양식 만들기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground">
          <div className="col-span-5">이름</div>
          <div className="col-span-3">형식</div>
          <div className="col-span-3">생성일</div>
          <div className="col-span-1"></div>
        </div>
        <div className="divide-y">
          {templates.map((template) => (
            <div key={template.id} className="grid grid-cols-12 items-center p-4">
              <div className="col-span-5 font-medium">{template.name}</div>
              <div className="col-span-3">
                <Badge variant="outline">{getFormatLabel(template.format)}</Badge>
              </div>
              <div className="col-span-3 text-sm text-muted-foreground">
                {new Date(template.createdAt).toLocaleDateString("ko-KR")}
              </div>
              <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">메뉴</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/document-conversion/templates/${template.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        상세보기
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/document-conversion/templates/edit/${template.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        편집
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      복제
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>출력 양식 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 출력 양식을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

