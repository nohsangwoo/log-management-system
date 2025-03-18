"use client"

import { TemplateForm } from "@/components/template-form"

export default function NewTemplatePage() {
  console.log("NewTemplatePage 컴포넌트 렌더링")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">새 템플릿 만들기</h1>
      <TemplateForm />
    </div>
  )
}

