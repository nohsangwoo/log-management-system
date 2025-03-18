import type { LogEntry, ExportTemplate } from "@/lib/store/log-store"

// PDF 생성 함수
export async function generatePDF(logs: LogEntry[], template: ExportTemplate, fileName: string): Promise<string> {
  try {
    // API 호출하여 PDF 생성
    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ logs, template, fileName }),
    })

    if (!response.ok) {
      throw new Error("PDF 생성 중 오류가 발생했습니다.")
    }

    const data = await response.json()
    return data.pdfUrl
  } catch (error) {
    console.error("PDF 생성 중 오류:", error)
    throw error
  }
}

