"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { LogList } from "@/components/log-list"

export default function LogEntryPage() {
  const router = useRouter()

  const handleNewLog = () => {
    console.log("새 일지 작성 버튼 클릭")
    window.location.href = "/log-entry/new"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">일지 관리</h1>
        <Button onClick={handleNewLog}>
          <PlusCircle className="mr-2 h-4 w-4" />새 일지 작성
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>일지 목록</CardTitle>
          <CardDescription>작성된 모든 일지를 확인하고 관리하세요</CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
            <Input type="text" placeholder="일지 검색..." />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LogList />
        </CardContent>
      </Card>
    </div>
  )
}

