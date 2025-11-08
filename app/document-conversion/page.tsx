"use client"

import { Suspense, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, FileText, Settings, History } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { ExportTemplateList } from "@/components/export-template-list"
import { ExportHistoryList } from "@/components/export-history-list"
import { LogExportForm } from "@/components/log-export-form"
import { useLogStore } from "@/lib/store/log-store"

export default function DocumentConversionPage() {
  return (
    <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-md bg-muted" />}>
      <DocumentConversionInner />
    </Suspense>
  )
}

function DocumentConversionInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "export")
  const templates = useLogStore((state) => state.exportTemplates)

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleNewTemplate = () => {
    console.log("새 출력 양식 만들기 버튼 클릭")
    router.push("/document-conversion/templates/new")
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/document-conversion?tab=${value}`, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">문서 출력 및 변환</h1>
        <Button onClick={handleNewTemplate}>
          <PlusCircle className="mr-2 h-4 w-4" />새 출력 양식 만들기
        </Button>
      </div>

      <Tabs defaultValue="export" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">
            <FileText className="mr-2 h-4 w-4" />
            문서 출력
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Settings className="mr-2 h-4 w-4" />
            출력 양식 관리
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            출력 이력
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4 mt-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">출력 양식이 없습니다. 먼저 출력 양식을 만들어주세요.</p>
                  <Button onClick={handleNewTemplate}>
                    <PlusCircle className="mr-2 h-4 w-4" />새 출력 양식 만들기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <LogExportForm />
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>출력 양식 목록</CardTitle>
              <CardDescription>문서 출력에 사용할 양식을 관리하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <ExportTemplateList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>출력 이력</CardTitle>
              <CardDescription>이전에 출력한 문서 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <ExportHistoryList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

