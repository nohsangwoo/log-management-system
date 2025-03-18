"use client"

import { useParams } from "next/navigation"
import { TemplateForm } from "@/components/template-form"

export default function EditTemplatePage() {
  const params = useParams()
  const templateId = params.id as string

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">템플릿 편집</h1>
      <TemplateForm templateId={templateId} />
    </div>
  )
}

