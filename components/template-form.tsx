"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLogStore, type ChecklistItem } from "@/lib/store/log-store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Save, Plus, ArrowLeft, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface TemplateFormProps {
  templateId?: string
}

export function TemplateForm({ templateId }: TemplateFormProps = {}) {
  const router = useRouter()
  const { toast } = useToast()

  const getTemplate = useLogStore((state) => state.getTemplate)
  const createTemplate = useLogStore((state) => state.createTemplate)
  const updateTemplate = useLogStore((state) => state.updateTemplate)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [newItemText, setNewItemText] = useState("")
  const [isRequired, setIsRequired] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 기존 템플릿 편집 시 데이터 불러오기
  useEffect(() => {
    if (templateId) {
      const existingTemplate = getTemplate(templateId)
      if (existingTemplate) {
        setName(existingTemplate.name)
        setDescription(existingTemplate.description)
        setChecklistItems(existingTemplate.checklistItems)
      }
    }
  }, [templateId, getTemplate])

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newItemText,
        checked: false,
        required: isRequired,
      }

      setChecklistItems([...checklistItems, newItem])
      setNewItemText("")
      setIsRequired(false)
      setIsDialogOpen(false)
    }
  }

  const handleRemoveItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id))
  }

  const handleToggleRequired = (id: string) => {
    setChecklistItems(checklistItems.map((item) => (item.id === id ? { ...item, required: !item.required } : item)))
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "템플릿 이름을 입력하세요",
        description: "템플릿 이름은 필수 항목입니다.",
        variant: "destructive",
      })
      return
    }

    if (checklistItems.length === 0) {
      toast({
        title: "체크리스트 항목을 추가하세요",
        description: "최소 하나 이상의 체크리스트 항목이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    const templateData = {
      name,
      description,
      checklistItems,
    }

    try {
      if (templateId) {
        updateTemplate(templateId, templateData)
        toast({
          title: "템플릿 업데이트 완료",
          description: "템플릿이 성공적으로 업데이트되었습니다.",
        })
      } else {
        createTemplate(templateData as any)
        toast({
          title: "템플릿 생성 완료",
          description: "새 템플릿이 성공적으로 생성되었습니다.",
        })
      }

      router.push("/checklists")
    } catch (error) {
      console.error("템플릿 저장 중 오류 발생:", error)
      toast({
        title: "오류 발생",
        description: "템플릿을 저장하는 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/checklists">
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Link>
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" />
          저장하기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>템플릿 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">템플릿 이름</Label>
            <Input
              id="name"
              placeholder="템플릿 이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택사항)</Label>
            <Textarea
              id="description"
              placeholder="템플릿에 대한 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>체크리스트 항목</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    <Label htmlFor="itemText">항목 내용</Label>
                    <Input
                      id="itemText"
                      placeholder="체크리스트 항목 내용"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
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
                  <Button onClick={handleAddItem}>추가하기</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {checklistItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">체크리스트 항목이 없습니다. 항목을 추가해주세요.</p>
          ) : (
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between border p-3 rounded-md">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{index + 1}.</span>
                    <span>{item.text}</span>
                    {item.required && <span className="text-red-500">*</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleRequired(item.id)}>
                      {item.required ? "필수 해제" : "필수로 설정"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            총 {checklistItems.length}개 항목, 필수 항목 {checklistItems.filter((item) => item.required).length}개
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

