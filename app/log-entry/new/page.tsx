"use client"

import { Suspense } from "react"
import { LogForm } from "@/components/log-form"

export default function NewLogPage() {
  console.log("NewLogPage 컴포넌트 렌더링")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">새 일지 작성</h1>
      <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-md bg-muted" />}>
        <LogForm />
      </Suspense>
    </div>
  )
}

