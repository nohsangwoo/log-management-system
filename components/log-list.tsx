"use client"

import { useLogStore } from "@/lib/store/log-store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, FileText, PlusCircle } from "lucide-react"
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

export function LogList() {
  const router = useRouter()
  const logs = useLogStore((state) => state.logs)
  const deleteLog = useLogStore((state) => state.deleteLog)
  const [logToDelete, setLogToDelete] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = () => {
    if (logToDelete) {
      deleteLog(logToDelete)
      setLogToDelete(null)
    }
  }

  const handleNewLog = () => {
    console.log("새 일지 작성 버튼 클릭")
    window.location.href = "/log-entry/new"
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">작성된 일지가 없습니다.</p>
        <Button className="mt-4" onClick={handleNewLog}>
          <PlusCircle className="mr-2 h-4 w-4" />새 일지 작성
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {logs.map((log) => (
        <Card key={log.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{log.title}</CardTitle>
              {log.isDraft && <Badge variant="outline">임시저장</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(log.createdAt)}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="line-clamp-3 text-sm">
              {log.content.substring(0, 150)}
              {log.content.length > 150 && "..."}
            </p>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                체크리스트: {log.checklistItems.filter((item) => item.checked).length}/{log.checklistItems.length}
              </p>
              {log.attachments.length > 0 && (
                <p className="text-xs text-muted-foreground">첨부파일: {log.attachments.length}개</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = `/log-entry/${log.id}`)}>
              <FileText className="mr-2 h-4 w-4" />
              보기
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => (window.location.href = `/log-entry/edit/${log.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                편집
              </Button>
              <AlertDialog open={logToDelete === log.id} onOpenChange={(open) => !open && setLogToDelete(null)}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setLogToDelete(log.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>일지 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 일지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

