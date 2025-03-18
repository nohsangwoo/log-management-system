import { type NextRequest, NextResponse } from "next/server"
import type { LogEntry } from "@/lib/store/log-store"
import jsPDF from "jspdf"

export async function POST(request: NextRequest) {
  try {
    const { logs, template, fileName } = await request.json()

    // PDF 문서 생성
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    let currentPage = 1
    const totalPages = logs.length

    // 각 로그에 대해 페이지 생성
    logs.forEach((log: LogEntry, index: number) => {
      if (index > 0) {
        doc.addPage()
      }

      // 헤더 추가
      if (template.includeHeader) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(template.headerText || "일지 관리 시스템", doc.internal.pageSize.getWidth() / 2, 10, {
          align: "center",
        })
        doc.line(10, 15, doc.internal.pageSize.getWidth() - 10, 15)
      }

      // 제목
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(log.title, doc.internal.pageSize.getWidth() / 2, 25, { align: "center" })

      // 작성일
      const createdAt = new Date(log.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`작성일: ${createdAt}`, doc.internal.pageSize.getWidth() / 2, 32, { align: "center" })

      // 내용
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      const contentLines = doc.splitTextToSize(log.content || "내용 없음", doc.internal.pageSize.getWidth() - 40)
      doc.text(contentLines, 20, 45)

      let yPosition = 45 + contentLines.length * 7

      // 체크리스트
      if (template.includeChecklist && log.checklistItems.length > 0) {
        yPosition += 10
        doc.setFontSize(14)
        doc.text("체크리스트", 20, yPosition)
        yPosition += 7

        log.checklistItems.forEach((item) => {
          doc.setFontSize(12)
          const checkMark = item.checked ? "☑" : "☐"
          doc.text(`${checkMark} ${item.text}${item.required ? " *" : ""}`, 20, yPosition)
          yPosition += 7
        })
      }

      // 첨부파일
      if (template.includeAttachments && log.attachments.length > 0) {
        yPosition += 10
        doc.setFontSize(14)
        doc.text("첨부파일", 20, yPosition)
        yPosition += 7

        log.attachments.forEach((file) => {
          doc.setFontSize(12)
          doc.text(`• ${file.name} (${Math.round(file.size / 1024)} KB)`, 20, yPosition)
          yPosition += 7
        })
      }

      // 푸터 추가
      if (template.includeFooter) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.line(
          10,
          doc.internal.pageSize.getHeight() - 20,
          doc.internal.pageSize.getWidth() - 10,
          doc.internal.pageSize.getHeight() - 20,
        )
        doc.text(
          template.footerText || "© 일지 관리 시스템",
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        )

        // 페이지 번호
        doc.text(
          `${currentPage} / ${totalPages}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10,
        )
      }

      currentPage++
    })

    // PDF를 Base64로 변환
    const pdfBase64 = doc.output("datauristring")

    return NextResponse.json({ pdfUrl: pdfBase64 })
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error)
    return NextResponse.json({ error: "PDF 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}

