'use client'

import { useEffect } from "react"
import { useLogStore } from "@/lib/store/log-store"

export function ClientBootstrap() {
  const seedDemoData = useLogStore((s) => s.seedDemoData)

  useEffect(() => {
    seedDemoData()
  }, [seedDemoData])

  return null
}


