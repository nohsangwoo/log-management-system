"use client"

import { useState, useEffect } from "react"
import { useLogStore, type LogEntry } from "@/lib/store/log-store"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, FileDown, Search } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LogPreview } from "@/components/log-preview"
import { z } from "zod"
import { addDays } from "date-fns"
import { DateRangePicker } from "@/components/date-range-picker"
import { downloadFile, generateFileContent } from "@/lib/document-utils"
import { toast } from "sonner"

const exportFormSchema = z.object({
  templateId: z.string({
    required_error: "출력 양식을 선택해주세요",
  }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  fileName: z.string().min(1, "파일명을 입력해주세요"),
})

type ExportFormValues = z.infer<typeof exportFormSchema>

export function LogExportForm() {
  const logs = useLogStore((state) => state.logs)
  const exportTemplates = useLogStore((state) => state.exportTemplates)
  const addExportHistory = useLogStore((state) => state.addExportHistory)

  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [previewLogId, setPreviewLogId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [isExporting, setIsExporting] = useState(false)
  
  // 폼 상태 관리
  const [templateId, setTemplateId] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [fileName, setFileName] = useState<string>(`일지_${new Date().toISOString().split('T')[0]}`)
  const [formErrors, setFormErrors] = useState<{
    templateId?: string;
    fileName?: string;
  }>({})

  useEffect(() => {
    // 검색어에 따라 로그 필터링
    const filtered = logs.filter(
      (log) =>
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredLogs(filtered)
  }, [logs, searchTerm])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(filteredLogs.map((log) => log.id))
    } else {
      setSelectedLogs([])
    }
  }

  const handleSelectLog = (logId: string, checked: boolean) => {
    if (checked) {
      setSelectedLogs([...selectedLogs, logId])
    } else {
      setSelectedLogs(selectedLogs.filter((id) => id !== logId))
    }
  }

  const handlePreview = (logId: string) => {
    setPreviewLogId(logId)
    setIsPreviewOpen(true)
  }

  const validateForm = () => {
    const errors: {
      templateId?: string;
      fileName?: string;
    } = {}
    
    if (!templateId) {
      errors.templateId = "출력 양식을 선택해주세요"
    }
    
    if (!fileName) {
      errors.fileName = "파일명을 입력해주세요"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleExport = async () => {
    console.log("handleExport 호출")
    if (!validateForm()) {
      console.log("validateForm 실패")
      return
    }
    
    setIsExporting(true)
    try {
      const template = exportTemplates.find(t => t.id === templateId)
      console.log("template", template)
      
      if (!template) {
        throw new Error("선택한 템플릿을 찾을 수 없습니다.")
      }
      
      // 선택된 로그 사용 (검색 결과에서 체크된 로그)
      let logsToExport = selectedLogs.length > 0 
        ? logs.filter(log => selectedLogs.includes(log.id))
        : logs.filter(log => {
            const logDate = new Date(log.createdAt)
            return logDate >= dateRange.from && logDate <= dateRange.to
          })
      
      console.log("logsToExport", logsToExport)
      
      if (logsToExport.length === 0) {
        console.log("출력할 일지 없음")
        toast.error("출력할 일지 없음", {
          description: "선택한 기간이나 체크박스에서 출력할 일지가 없습니다.",
        })
        setIsExporting(false)
        return
      }
      
      // 파일 내용 생성 및 다운로드
      const fileContent = await generateFileContent(logsToExport, template, template.format)
      await downloadFile(fileName, fileContent, template.format)
      
      // 출력 이력 추가
      addExportHistory({
        templateId: templateId,
        format: template.format,
        fileName: `${fileName}.${template.format}`,
        logIds: logsToExport.map(log => log.id)
      })
      
      toast.success("문서 출력 완료", {
        description: `${logsToExport.length}개의 일지가 성공적으로 출력되었습니다.`,
      })
      
      // 폼 리셋
      setFileName(`일지_${new Date().toISOString().split('T')[0]}`)
    } catch (error) {
      console.error("문서 출력 중 오류 발생:", error)
      toast.error("오류 발생", {
        description: "문서를 출력하는 중 문제가 발생했습니다.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>일지 출력</CardTitle>
          <CardDescription>출력할 일지의 기간과 양식을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">출력 양식</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template">
                <SelectValue placeholder="출력 양식을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {exportTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.format.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.templateId && (
              <p className="text-sm font-medium text-destructive">{formErrors.templateId}</p>
            )}
            <p className="text-sm text-muted-foreground">
              출력에 사용할 양식을 선택하세요
            </p>
          </div>

          <div className="space-y-2">
            <Label>출력 기간</Label>
            <DateRangePicker 
              value={dateRange}
              onChange={(date) => {
                if (date) {
                  setDateRange({
                    from: date.from || new Date(),
                    to: date.to || addDays(new Date(), 7)
                  });
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              출력할 일지의 기간을 선택하세요
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fileName">파일명</Label>
            <Input 
              id="fileName"
              placeholder="파일명을 입력하세요" 
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            {formErrors.fileName && (
              <p className="text-sm font-medium text-destructive">{formErrors.fileName}</p>
            )}
            <p className="text-sm text-muted-foreground">
              출력할 파일의 이름을 입력하세요 (확장자는 자동으로 추가됩니다)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleExport} 
            disabled={isExporting} 
            className="w-full"
          >
            {isExporting ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                출력 중...
              </span>
            ) : (
              <span className="flex items-center">
                <FileDown className="mr-2 h-4 w-4" />
                일지 출력하기
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>일지 선택</CardTitle>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
            <Input
              type="text"
              placeholder="일지 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="button" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 pb-4 border-b">
              <Checkbox
                id="selectAll"
                checked={selectedLogs.length > 0 && selectedLogs.length === filteredLogs.length}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
              />
              <Label htmlFor="selectAll">전체 선택</Label>
              <span className="text-sm text-muted-foreground ml-auto">
                {selectedLogs.length}개 선택됨 / 총 {filteredLogs.length}개
              </span>
            </div>

            {filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">검색 결과가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`log-${log.id}`}
                        checked={selectedLogs.includes(log.id)}
                        onCheckedChange={(checked) => handleSelectLog(log.id, checked === true)}
                      />
                      <Label htmlFor={`log-${log.id}`} className="font-medium">
                        {log.title}
                      </Label>
                      <span className="text-xs text-muted-foreground">({formatDate(log.createdAt)})</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handlePreview(log.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>문서 미리보기</DialogTitle>
            <DialogDescription>출력될 문서의 미리보기입니다.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full">
            {previewLogId && <LogPreview logId={previewLogId} templateId={templateId} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

