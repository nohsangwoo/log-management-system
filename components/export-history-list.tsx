"use client"

import { useState } from "react"
import { useLogStore, type LogEntry } from "@/lib/store/log-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, MoreVertical, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { saveAs } from 'file-saver'

export function ExportHistoryList() {
  const { toast } = useToast()
  const exportHistory = useLogStore((state) => state.exportHistory)
  const logs = useLogStore((state) => state.logs)
  const exportTemplates = useLogStore((state) => state.exportTemplates)
  const deleteExportHistory = useLogStore((state) => state.deleteExportHistory)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setHistoryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (historyToDelete) {
      deleteExportHistory(historyToDelete)
      toast({
        title: "출력 이력 삭제됨",
        description: "출력 이력이 성공적으로 삭제되었습니다.",
      })
      setHistoryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleDownload = async (history: any) => {
    try {
      // 템플릿 찾기
      const template = exportTemplates.find(t => t.id === history.templateId)
      if (!template) {
        toast({
          title: "템플릿 없음",
          description: "해당 출력 양식을 찾을 수 없습니다.",
          variant: "destructive",
        })
        return
      }
      
      // 로그 찾기
      const logsToExport = logs.filter(log => history.logIds.includes(log.id))
      if (logsToExport.length === 0) {
        toast({
          title: "일지 없음",
          description: "출력할 일지를 찾을 수 없습니다.",
          variant: "destructive",
        })
        return
      }
      
      // 파일 형식에 따라 다른 처리
      let content;
      switch (history.format) {
        case 'pdf':
          content = await generatePdfContent(logsToExport, template);
          break;
        case 'docx':
          content = await generateDocxContent(logsToExport, template);
          break;
        case 'xlsx':
          content = await generateXlsxContent(logsToExport, template);
          break;
        default:
          content = generateTextContent(logsToExport, template);
      }
      
      // 파일 다운로드
      await downloadFile(history.fileName.split('.')[0], content, history.format)
      
      toast({
        title: "다운로드 완료",
        description: `${history.fileName} 파일이 다운로드되었습니다.`,
      })
    } catch (error) {
      console.error("다운로드 중 오류 발생:", error)
      toast({
        title: "오류 발생",
        description: "파일을 다운로드하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }
  
  function getMimeType(format: string) {
    switch (format) {
      case 'pdf':
        return 'application/pdf'
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      default:
        return 'text/plain'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      {exportHistory.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">출력 이력이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {exportHistory.map((history) => (
            <Card key={history.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{history.fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(history.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownload(history)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    다운로드
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(history.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>출력 이력 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 출력 이력을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// 파일 다운로드 함수 수정
async function downloadFile(fileName: string, content: string | ArrayBuffer, format: string) {
  try {
    // 파일 확장자 추가
    const fullFileName = `${fileName}.${format}`;
    
    // 파일 형식에 따른 MIME 타입 설정
    let mimeType = 'text/plain';
    let blob;
    
    switch (format) {
      case 'pdf':
        mimeType = 'application/pdf';
        blob = new Blob([content], { type: mimeType });
        break;
      case 'docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        blob = new Blob([content], { type: mimeType });
        break;
      case 'xlsx':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        blob = new Blob([content], { type: mimeType });
        break;
      default:
        // 기본은 텍스트로 처리
        blob = new Blob([content as string], { type: 'text/plain' });
    }
    
    // 정적 임포트된 saveAs 함수 사용
    saveAs(blob, fullFileName);
  } catch (error) {
    console.error('파일 다운로드 중 오류 발생:', error);
    throw error;
  }
}

// 텍스트 형식 생성
function generateTextContent(logs: LogEntry[], template: any) {
  let content = `${template.name} 출력 문서\n\n`;
  
  // 헤더 추가
  if (template.includeHeader && template.headerText) {
    content += `${template.headerText}\n\n`;
  }
  
  // 로그 내용 추가
  logs.forEach((log, index) => {
    content += `${index + 1}. ${log.title}\n`;
    content += `작성일: ${new Date(log.createdAt).toLocaleDateString('ko-KR')}\n`;
    content += `${log.content}\n\n`;
  });
  
  // 푸터 추가
  if (template.includeFooter && template.footerText) {
    content += `\n${template.footerText}`;
  }
  
  return content;
}

async function generatePdfContent(logs: LogEntry[], template: any) {
  try {
    // 동적으로 jspdf 및 jspdf-autotable 임포트
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const autoTable = autoTableModule.default;
    
    // 한글 폰트 파일 로드
    const fontResponse = await fetch('/NotoSansKR-Regular.ttf');
    const fontData = await fontResponse.arrayBuffer();
    const fontBase64 = btoa(
      new Uint8Array(fontData)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    // PDF 문서 생성
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // 한글 폰트 추가
    doc.addFileToVFS('NotoSansKR-Regular.ttf', fontBase64);
    doc.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal');
    
    // 한글 폰트 설정
    doc.setFont('NotoSansKR');
    
    // 제목 추가
    doc.setFontSize(18);
    doc.text(template.name, 105, 15, { align: 'center' });
    
    // 헤더 추가
    if (template.includeHeader && template.headerText) {
      doc.setFontSize(12);
      doc.text(template.headerText, 105, 25, { align: 'center' });
    }
    
    // 로그 데이터 테이블로 변환
    const tableData = logs.map((log, index) => [
      index + 1,
      log.title,
      new Date(log.createdAt).toLocaleDateString('ko-KR'), // 한글 날짜 형식으로 변경
      log.content.substring(0, 100) + (log.content.length > 100 ? '...' : '')
    ]);
    
    // 테이블 생성
    autoTable(doc, {
      head: [['No', '제목', '작성일', '내용']], // 한글 헤더로 변경
      body: tableData,
      startY: 35,
      styles: {
        font: 'NotoSansKR', // 테이블에도 한글 폰트 적용
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' }
      }
    });
    
    // 상세 내용 추가
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    
    logs.forEach((log, index) => {
      // 페이지 넘침 확인
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // 로그 제목
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${log.title}`, 10, yPos);
      yPos += 8;
      
      // 로그 날짜
      doc.setFontSize(10);
      const dateStr = new Date(log.createdAt).toLocaleDateString('ko-KR'); // 한글 날짜 형식
      doc.text(`작성일: ${dateStr}`, 15, yPos); // 한글로 변경
      yPos += 6;
      
      // 로그 내용
      doc.setFontSize(12);
      const contentLines = doc.splitTextToSize(log.content, 180);
      doc.text(contentLines, 15, yPos);
      yPos += contentLines.length * 6 + 15;
    });
    
    // 푸터 추가
    if (template.includeFooter && template.footerText) {
      doc.setFontSize(10);
      doc.text(
        template.footerText, 
        105, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: 'center' }
      );
    }
    
    // PDF 문서를 바이너리 데이터로 변환
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('PDF 생성 중 오류 발생:', error);
    throw error;
  }
}

// DOCX 형식 생성
async function generateDocxContent(logs: LogEntry[], template: any) {
  try {
    // 동적으로 docx 임포트
    const docxModule = await import('docx');
    const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } = docxModule;
    
    // 문서 내용 구성
    const children = [];
    
    // 제목 추가
    children.push(
      new Paragraph({
        text: template.name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER
      })
    );
    
    // 헤더 추가
    if (template.includeHeader && template.headerText) {
      children.push(
        new Paragraph({
          text: template.headerText,
          alignment: AlignmentType.CENTER
        })
      );
    }
    
    // 로그 내용 추가
    logs.forEach((log, index) => {
      // 로그 제목
      children.push(
        new Paragraph({
          text: `${index + 1}. ${log.title}`,
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 200
          }
        })
      );
      
      // 로그 날짜
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `작성일: ${new Date(log.createdAt).toLocaleDateString('ko-KR')}`,
              italics: true
            })
          ],
          spacing: {
            after: 200
          }
        })
      );
      
      // 로그 내용
      children.push(
        new Paragraph({
          text: log.content,
          spacing: {
            after: 300
          }
        })
      );
    });
    
    // 푸터 추가
    if (template.includeFooter && template.footerText) {
      children.push(
        new Paragraph({
          text: template.footerText,
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 400
          }
        })
      );
    }
    
    // 문서 생성
    const doc = new Document({
      sections: [
        {
          children: children
        }
      ]
    });
    
    // DOCX 문서를 바이너리 데이터로 변환
    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error('DOCX 생성 중 오류 발생:', error);
    throw error;
  }
}

// XLSX 형식 생성
async function generateXlsxContent(logs: LogEntry[], template: any) {
  try {
    // 동적으로 xlsx 임포트
    const xlsxModule = await import('xlsx');
    const XLSX = xlsxModule.default;
    
    // 워크시트 데이터 구성
    const wsData = [
      ['No', '제목', '작성일', '내용']
    ];
    
    // 로그 데이터 추가
    logs.forEach((log, index) => {
      wsData.push([
        (index + 1).toString(),
        log.title,
        new Date(log.createdAt).toLocaleDateString('ko-KR'),
        log.content
      ]);
    });
    
    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, template.name);
    
    // XLSX 파일을 바이너리 데이터로 변환
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  } catch (error) {
    console.error('XLSX 생성 중 오류 발생:', error);
    throw error;
  }
}

