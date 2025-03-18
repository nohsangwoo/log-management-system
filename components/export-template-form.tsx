"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useLogStore, type ExportTemplate } from "@/lib/store/log-store"
import { toast } from "sonner"
const templateFormSchema = z.object({
  name: z.string().min(1, "양식 이름을 입력해주세요"),
  format: z.enum(["pdf", "docx", "xlsx"], {
    required_error: "출력 형식을 선택해주세요",
  }),
  includeHeader: z.boolean().default(false),
  headerText: z.string().optional(),
  includeFooter: z.boolean().default(false),
  footerText: z.string().optional(),
  includeChecklist: z.boolean().default(true),
  includeAttachments: z.boolean().default(true),
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

interface ExportTemplateFormProps {
  templateId?: string
}

export function ExportTemplateForm({ templateId }: ExportTemplateFormProps) {
  const router = useRouter()
  const getExportTemplate = useLogStore((state) => state.getExportTemplate)
  const createExportTemplate = useLogStore((state) => state.createExportTemplate)
  const updateExportTemplate = useLogStore((state) => state.updateExportTemplate)
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues: Partial<TemplateFormValues> = {
    name: "",
    format: "pdf",
    includeHeader: false,
    headerText: "",
    includeFooter: false,
    footerText: "",
    includeChecklist: true,
    includeAttachments: true,
  }

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (templateId) {
      const template = getExportTemplate(templateId)
      if (template) {
        form.reset({
          name: template.name,
          format: template.format as "pdf" | "docx" | "xlsx",
          includeHeader: template.includeHeader,
          headerText: template.headerText || "",
          includeFooter: template.includeFooter,
          footerText: template.footerText || "",
          includeChecklist: template.includeChecklist,
          includeAttachments: template.includeAttachments,
        })
      }
    }
  }, [templateId, getExportTemplate, form])

  async function onSubmit(data: TemplateFormValues) {
    setIsLoading(true)
    try {
      if (templateId) {
        // 기존 템플릿 업데이트
        updateExportTemplate(templateId, data as ExportTemplate)
        toast.success("양식 업데이트됨", {
          description: "출력 양식이 성공적으로 업데이트되었습니다.",
        })
      } else {
        // 새 템플릿 생성
        createExportTemplate(data as ExportTemplate)
        toast.success("양식 생성됨", {
          description: "새 출력 양식이 성공적으로 생성되었습니다.",
        })
      }
      router.push("/document-conversion?tab=templates")
    } catch (error) {
      console.error("양식 저장 중 오류 발생:", error)
      toast.error("오류 발생", {
        description: "양식을 저장하는 중 문제가 발생했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>출력 양식의 기본 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>양식 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="양식 이름을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>출력 형식</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="출력 형식을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">Word (DOCX)</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>문서 구성</CardTitle>
            <CardDescription>출력할 문서의 구성 요소를 설정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="includeHeader"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">헤더 포함</FormLabel>
                      <FormDescription>문서 상단에 헤더를 포함합니다</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("includeHeader") && (
                <FormField
                  control={form.control}
                  name="headerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>헤더 텍스트</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="헤더에 표시할 텍스트를 입력하세요"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="includeFooter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">푸터 포함</FormLabel>
                      <FormDescription>문서 하단에 푸터를 포함합니다</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("includeFooter") && (
                <FormField
                  control={form.control}
                  name="footerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>푸터 텍스트</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="푸터에 표시할 텍스트를 입력하세요"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="includeChecklist"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">체크리스트 포함</FormLabel>
                    <FormDescription>일지의 체크리스트 항목을 포함합니다</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includeAttachments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">첨부파일 포함</FormLabel>
                    <FormDescription>일지에 첨부된 파일을 포함합니다</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/document-conversion?tab=templates")}
              type="button"
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : templateId ? "업데이트" : "저장"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

