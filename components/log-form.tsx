"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLogStore, type ChecklistItem } from "@/lib/store/log-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileUploader } from "@/components/file-uploader"
import { Save, Plus, LayoutTemplateIcon as Template, CheckSquare, FileText, ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface LogFormProps {
  logId?: string
}

export function LogForm({ logId }: LogFormProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const templates = useLogStore((state) => state.templates)
  const draftLog = useLogStore((state) => state.draftLog)
  const getLog = useLogStore((state) => state.getLog)
  const createLog = useLogStore((state) => state.createLog)
  const updateLog = useLogStore((state) => state.updateLog)
  const saveDraft = useLogStore((state) => state.saveDraft)
  const clearDraft = useLogStore((state) => state.clearDraft)
  const getTemplate = useLogStore((state) => state.getTemplate)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [isRequired, setIsRequired] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // URL에서 템플릿 ID 가져오기
  useEffect(() => {
    if (searchParams) {
      const templateId = searchParams.get("template")
      if (templateId) {
        setSelectedTemplateId(templateId)
        const template = getTemplate(templateId)
        if (template) {
          setChecklistItems(template.checklistItems)
        }
      }
    }
  }, [searchParams, getTemplate])

  // 기존 일지 편집 또는 임시저장 불러오기
  useEffect(() => {
    if (logId) {
      const existingLog = getLog(logId)
      if (existingLog) {
        setTitle(existingLog.title)
        setContent(existingLog.content)
        setChecklistItems(existingLog.checklistItems)
        setAttachments(existingLog.attachments)
        if (existingLog.templateId) {
          setSelectedTemplateId(existingLog.templateId)
        }
      }
    } else if (draftLog) {
      setTitle(draftLog.title)
      setContent(draftLog.content)
      setChecklistItems(draftLog.checklistItems)
      setAttachments(draftLog.attachments)
      if (draftLog.templateId) {
        setSelectedTemplateId(draftLog.templateId)
      }
    }
  }, [logId, draftLog, getLog])

  // 자동 저장 기능
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    if (title || content || checklistItems.length > 0) {
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 5000) // 5초마다 자동 저장

      setAutoSaveTimer(timer)
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [title, content, checklistItems, attachments])

  const handleAutoSave = () => {
    saveDraft({
      title,
      content,
      checklistItems,
      attachments,
      templateId: selectedTemplateId || undefined,
    })

    toast.success("자동 저장됨", {
      description: "작성 중인 일지가 자동으로 저장되었습니다.",
      duration: 2000,
    })
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)

    if (templateId && templateId !== "none") {
      const template = getTemplate(templateId)
      if (template) {
        // 기존 체크리스트 항목 유지하면서 템플릿 항목 추가
        const existingIds = new Set(checklistItems.map((item) => item.text))
        const newItems = template.checklistItems.filter((item) => !existingIds.has(item.text))

        setChecklistItems([...checklistItems, ...newItems])
      }
    }
  }

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem,
        checked: false,
        required: isRequired,
      }

      setChecklistItems([...checklistItems, newItem])
      setNewChecklistItem("")
      setIsRequired(false)
    }
  }

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id))
  }

  const handleFileUpload = (files: File[]) => {
    // 실제 구현에서는 파일 업로드 API를 호출하고 URL을 받아와야 함
    // 여기서는 임시로 파일 정보만 저장
    const newAttachments = files.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      size: file.size,
    }))

    setAttachments([...attachments, ...newAttachments])
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id))
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("제목을 입력하세요", {
        description: "일지 제목은 필수 항목입니다.",
      })
      return
    }

    const requiredItems = checklistItems.filter((item) => item.required)
    const uncheckedRequired = requiredItems.filter((item) => !item.checked)

    if (uncheckedRequired.length > 0) {
      toast.error("필수 항목 확인", {
        description: "필수 체크리스트 항목을 모두 체크해주세요.",
      })
      return
    }

    const logData = {
      title,
      content,
      checklistItems,
      attachments,
      templateId: selectedTemplateId !== "none" ? selectedTemplateId : undefined,
      isDraft: false,
    }

    try {
      if (logId) {
        updateLog(logId, logData)
        toast.success("일지 업데이트 완료", {
          description: "일지가 성공적으로 업데이트되었습니다.",
        })
      } else {
        const newLogId = createLog(logData as any)
        toast.success("일지 작성 완료", {
          description: "새 일지가 성공적으로 저장되었습니다.",
        })
        clearDraft()
      }

      router.push("/log-entry")
    } catch (error) {
      console.error("일지 저장 중 오류 발생:", error)
      toast.error("오류 발생", {
        description: "일지를 저장하는 중 문제가 발생했습니다. 다시 시도해주세요.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/log-entry">
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Link>
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" />
          저장하기
        </Button>
        <Button variant="outline" onClick={handleAutoSave}>
          임시 저장
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>일지 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="일지 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">템플릿 선택 (선택사항)</Label>
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="템플릿 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">템플릿 없음</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">
            <FileText className="mr-2 h-4 w-4" />
            내용
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <CheckSquare className="mr-2 h-4 w-4" />
            체크리스트
          </TabsTrigger>
          <TabsTrigger value="attachments">
            <Template className="mr-2 h-4 w-4" />
            첨부파일
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="content">일지 내용</Label>
                <Textarea
                  id="content"
                  placeholder="일지 내용을 입력하세요"
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>체크리스트</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      항목 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>체크리스트 항목 추가</DialogTitle>
                      <DialogDescription>새로운 체크리스트 항목을 추가합니다.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="checklistItem">항목 내용</Label>
                        <Input
                          id="checklistItem"
                          placeholder="체크리스트 항목 내용"
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="required"
                          checked={isRequired}
                          onCheckedChange={(checked) => setIsRequired(checked === true)}
                        />
                        <Label htmlFor="required">필수 항목</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddChecklistItem}>추가하기</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {checklistItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  체크리스트 항목이 없습니다. 항목을 추가해주세요.
                </p>
              ) : (
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border p-3 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={() => handleToggleChecklistItem(item.id)}
                        />
                        <Label
                          htmlFor={`item-${item.id}`}
                          className={`${item.checked ? "line-through text-muted-foreground" : ""}`}
                        >
                          {item.text}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveChecklistItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>첨부파일</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader onUpload={handleFileUpload} />

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium">첨부된 파일</h3>
                  <div className="space-y-2">
                    {attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between border p-3 rounded-md">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{file.name}</span>
                          <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveAttachment(file.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

