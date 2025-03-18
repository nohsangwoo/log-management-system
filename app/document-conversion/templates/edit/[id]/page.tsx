"use client"

import { useParams } from "next/navigation"
import { ExportTemplateForm } from "@/components/export-template-form"

export default function EditExportTemplatePage() {
  const params = useParams()
  const templateId = params.id as string

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">출력 양식 편집</h1>
      <ExportTemplateForm templateId={templateId} />
    </div>
  )
}

