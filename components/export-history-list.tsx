"use client"

import { useState } from "react"
import { useLogStore, type LogEntry } from "@/lib/store/log-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, MoreVertical, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { saveAs } from 'file-saver'
import { downloadFile, generateFileContent } from "@/lib/document-utils"

export function ExportHistoryList() {
  const { toast } = useToast()
  const exportHistory = useLogStore((state) => state.exportHistory)
  const logs = useLogStore((state) => state.logs)
  const exportTemplates = useLogStore((state) => state.exportTemplates)
  const deleteExportHistory = useLogStore((state) => state.deleteExportHistory)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setHistoryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (historyToDelete) {
      deleteExportHistory(historyToDelete)
      toast({
        title: "출력 이력 삭제됨",
        description: "출력 이력이 성공적으로 삭제되었습니다.",
      })
      setHistoryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleDownload = async (history: any) => {
    try {
      // 템플릿 찾기
      const template = exportTemplates.find(t => t.id === history.templateId)
      if (!template) {
        toast({
          title: "템플릿 없음",
          description: "해당 출력 양식을 찾을 수 없습니다.",
          variant: "destructive",
        })
        return
      }
      
      // 로그 찾기
      const logsToExport = logs.filter(log => history.logIds.includes(log.id))
      if (logsToExport.length === 0) {
        toast({
          title: "일지 없음",
          description: "출력할 일지를 찾을 수 없습니다.",
          variant: "destructive",
        })
        return
      }
      
      // 파일 형식에 따라 콘텐츠 생성 및 다운로드
      const content = await generateFileContent(logsToExport, template, history.format);
      await downloadFile(history.fileName.split('.')[0], content, history.format);
      
      toast({
        title: "다운로드 완료",
        description: `${history.fileName} 파일이 다운로드되었습니다.`,
      })
    } catch (error) {
      console.error("다운로드 중 오류 발생:", error)
      toast({
        title: "오류 발생",
        description: "파일을 다운로드하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }
  
  function getMimeType(format: string) {
    switch (format) {
      case 'pdf':
        return 'application/pdf'
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      default:
        return 'text/plain'
    }
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
    <div className="space-y-4">
      {exportHistory.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">출력 이력이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {exportHistory.map((history) => (
            <Card key={history.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{history.fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(history.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownload(history)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    다운로드
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(history.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>출력 이력 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 출력 이력을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

