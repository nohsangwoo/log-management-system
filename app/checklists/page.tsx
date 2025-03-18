"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { TemplateList } from "@/components/template-list"

export default function ChecklistsPage() {
  const router = useRouter()

  const handleNewTemplate = () => {
    console.log("새 템플릿 만들기 버튼 클릭")
    window.location.href = "/checklists/new"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">체크리스트 템플릿</h1>
        <Button onClick={handleNewTemplate}>
          <PlusCircle className="mr-2 h-4 w-4" />새 템플릿 만들기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>템플릿 목록</CardTitle>
          <CardDescription>일지 작성에 사용할 체크리스트 템플릿을 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateList />
        </CardContent>
      </Card>
    </div>
  )
}

