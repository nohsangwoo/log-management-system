"use client"

import { useParams } from "next/navigation"
import { LogForm } from "@/components/log-form"

export default function EditLogPage() {
  const params = useParams()
  const logId = params.id as string

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">일지 편집</h1>
      <LogForm logId={logId} />
    </div>
  )
}

