"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploaderProps {
  onUpload: (files: File[]) => void
  maxSize?: number // MB 단위
  allowedTypes?: string[] // 허용된 파일 타입 (MIME 타입)
}

export function FileUploader({
  onUpload,
  maxSize = 5, // 기본 5MB
  allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
}: FileUploaderProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFiles = (files: File[]) => {
    const validFiles: File[] = []
    const invalidFiles: { file: File; reason: string }[] = []

    Array.from(files).forEach((file) => {
      // 파일 크기 검사
      if (file.size > maxSize * 1024 * 1024) {
        invalidFiles.push({
          file,
          reason: `파일 크기가 너무 큽니다 (최대 ${maxSize}MB)`,
        })
        return
      }

      // 파일 타입 검사
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        invalidFiles.push({
          file,
          reason: "지원되지 않는 파일 형식입니다",
        })
        return
      }

      validFiles.push(file)
    })

    if (invalidFiles.length > 0) {
      toast({
        title: "일부 파일을 업로드할 수 없습니다",
        description: (
          <ul className="list-disc pl-5 mt-2">
            {invalidFiles.map((item, index) => (
              <li key={index}>
                {item.file.name}: {item.reason}
              </li>
            ))}
          </ul>
        ),
        variant: "destructive",
      })
    }

    return validFiles
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(Array.from(e.dataTransfer.files))
      if (validFiles.length > 0) {
        onUpload(validFiles)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(Array.from(e.target.files))
      if (validFiles.length > 0) {
        onUpload(validFiles)
      }

      // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 text-center ${
        isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/20"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium">파일을 여기에 끌어다 놓거나</h3>
        <Button onClick={handleButtonClick} variant="outline">
          파일 선택
        </Button>
        <p className="text-xs text-muted-foreground">최대 파일 크기: {maxSize}MB</p>
        <p className="text-xs text-muted-foreground">지원 형식: JPG, PNG, GIF, PDF, DOC, DOCX</p>
      </div>
    </div>
  )
}

