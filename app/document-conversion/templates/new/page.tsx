"use client"

import { ExportTemplateForm } from "@/components/export-template-form"

export default function NewExportTemplatePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">새 출력 양식 만들기</h1>
      <ExportTemplateForm />
    </div>
  )
}

