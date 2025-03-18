"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, CheckSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLogStore } from "@/lib/store/log-store"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const router = useRouter()
  const logs = useLogStore((state) => state.logs)
  const templates = useLogStore((state) => state.templates)

  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [recentTemplates, setRecentTemplates] = useState<any[]>([])

  useEffect(() => {
    // 최근 일지 3개 가져오기
    const sortedLogs = [...logs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)

    setRecentLogs(sortedLogs)

    // 최근 체크리스트 템플릿 3개 가져오기
    const sortedTemplates = [...templates]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)

    setRecentTemplates(sortedTemplates)
  }, [logs, templates])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    })
  }

  const handleNewLog = () => {
    console.log("새 일지 작성 버튼 클릭")
    window.location.href = "/log-entry/new"
  }

  const handleNewTemplate = () => {
    console.log("새 체크리스트 만들기 버튼 클릭")
    window.location.href = "/checklists/new"
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>최근 일지</CardTitle>
            <CardDescription>최근에 작성한 일지 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <ul className="space-y-2">
                {recentLogs.map((log) => (
                  <li key={log.id} className="flex justify-between items-center border-b pb-2">
                    <Link href={`/log-entry/${log.id}`} className="hover:underline">
                      {log.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-2">작성된 일지가 없습니다</p>
            )}
            <Button className="mt-4" variant="outline" onClick={() => router.push("/log-entry")}>
              <FileText className="mr-2 h-4 w-4" />
              모든 일지 보기
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>체크리스트</CardTitle>
            <CardDescription>활성화된 체크리스트</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTemplates.length > 0 ? (
              <ul className="space-y-2">
                {recentTemplates.map((template) => (
                  <li key={template.id} className="flex justify-between items-center border-b pb-2">
                    <Link href={`/checklists/${template.id}`} className="hover:underline">
                      {template.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">항목 {template.checklistItems.length}개</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-2">생성된 체크리스트가 없습니다</p>
            )}
            <Button className="mt-4" variant="outline" onClick={() => router.push("/checklists")}>
              <CheckSquare className="mr-2 h-4 w-4" />
              체크리스트 관리
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 작업</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mb-2" onClick={handleNewLog}>
              <PlusCircle className="mr-2 h-4 w-4" />새 일지 작성
            </Button>
            <Button className="w-full mb-2" variant="outline" onClick={handleNewTemplate}>
              <CheckSquare className="mr-2 h-4 w-4" />새 체크리스트 만들기
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => (window.location.href = "/document-conversion")}
            >
              <FileText className="mr-2 h-4 w-4" />
              보고서 생성
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

