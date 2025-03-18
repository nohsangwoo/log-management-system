import { LogEntry } from "@/lib/store/log-store";
import { saveAs } from 'file-saver';

// 파일 다운로드 함수
export async function downloadFile(fileName: string, content: string | ArrayBuffer, format: string) {
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

// 파일 형식에 따라 다른 파일 콘텐츠 생성
export async function generateFileContent(logs: LogEntry[], template: any, format: string) {
  try {
    switch (format) {
      case 'pdf':
        return await generatePdfContent(logs, template);
      case 'docx':
        return await generateDocxContent(logs, template);
      case 'xlsx':
        return await generateXlsxContent(logs, template);
      default:
        return generateTextContent(logs, template);
    }
  } catch (error) {
    console.error('파일 콘텐츠 생성 중 오류 발생:', error);
    throw error;
  }
}

// 텍스트 형식 생성
export function generateTextContent(logs: LogEntry[], template: any) {
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

// PDF 형식 생성
export async function generatePdfContent(logs: LogEntry[], template: any) {
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
    
    // 헤더 직접 그리기 (테이블 헤더 대신)
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 35, 190, 10, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('NotoSansKR', 'normal');
    
    // 헤더 텍스트 직접 추가
    doc.text('No', 15, 41);
    doc.text('제목', 40, 41);
    doc.text('작성일', 85, 41);
    doc.text('내용', 120, 41);
    
    // 로그 데이터 테이블로 변환
    const tableData = logs.map((log, index) => [
      index + 1,
      log.title,
      new Date(log.createdAt).toLocaleDateString('ko-KR'),
      log.content.substring(0, 100) + (log.content.length > 100 ? '...' : '')
    ]);
    
    // 테이블 생성 (헤더 없이)
    autoTable(doc, {
      body: tableData,
      startY: 45, // 직접 그린 헤더 아래부터 시작
      styles: {
        font: 'NotoSansKR',
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
      const dateStr = new Date(log.createdAt).toLocaleDateString('ko-KR');
      doc.text(`작성일: ${dateStr}`, 15, yPos);
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
export async function generateDocxContent(logs: LogEntry[], template: any) {
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
export async function generateXlsxContent(logs: LogEntry[], template: any) {
  try {
    // 동적으로 xlsx 임포트
    const xlsxModule = await import('xlsx');
    // xlsx 모듈은 ESM 구조에서 다르게 임포트될 수 있음
    const XLSX = xlsxModule.default || xlsxModule;
    
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
    
    // 열 너비 설정
    const wscols = [
      { wch: 5 },    // No 컬럼 넓이
      { wch: 30 },   // 제목 컬럼 넓이
      { wch: 15 },   // 작성일 컬럼 넓이
      { wch: 80 }    // 내용 컬럼 넓이
    ];
    ws['!cols'] = wscols;
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, template.name);
    
    // XLSX 파일을 바이너리 데이터로 변환
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    return buffer;
  } catch (error) {
    console.error('XLSX 생성 중 오류 발생:', error);
    console.error('오류 상세:', error instanceof Error ? error.message : String(error));
    throw error;
  }
} 