import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

export type ChecklistItem = {
  id: string
  text: string
  checked: boolean
  required: boolean
}

export type LogTemplate = {
  id: string
  name: string
  description: string
  checklistItems: ChecklistItem[]
  createdAt: Date
}

export type LogEntry = {
  id: string
  title: string
  content: string
  checklistItems: ChecklistItem[]
  templateId?: string
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
  isDraft: boolean
}

export type Attachment = {
  id: string
  name: string
  type: string
  url: string
  size: number
}

export type ExportFormat = "pdf" | "docx" | "xlsx"

export type ExportTemplate = {
  id: string
  name: string
  format: ExportFormat
  includeHeader: boolean
  includeFooter: boolean
  includeAttachments: boolean
  includeChecklist: boolean
  headerText?: string
  footerText?: string
  createdAt: Date
}

export type ExportHistory = {
  id: string
  logIds: string[]
  templateId: string
  format: ExportFormat
  createdAt: Date
  fileName: string
  url?: string
}

type LogState = {
  logs: LogEntry[]
  templates: LogTemplate[]
  draftLog: LogEntry | null
  exportTemplates: ExportTemplate[]
  exportHistory: ExportHistory[]

  // 초기 데모 데이터 시딩
  seedDemoData: () => void

  // 일지 관련 액션
  createLog: (log: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => string
  updateLog: (id: string, log: Partial<LogEntry>) => void
  deleteLog: (id: string) => void
  getLog: (id: string) => LogEntry | undefined

  // 템플릿 관련 액션
  createTemplate: (template: Omit<LogTemplate, "id" | "createdAt">) => string
  updateTemplate: (id: string, template: Partial<LogTemplate>) => void
  deleteTemplate: (id: string) => void
  getTemplate: (id: string) => LogTemplate | undefined

  // 임시 저장 관련 액션
  saveDraft: (log: Partial<LogEntry>) => void
  clearDraft: () => void

  // 체크리스트 관련 액션
  toggleChecklistItem: (logId: string, itemId: string) => void
  addChecklistItem: (logId: string, item: Omit<ChecklistItem, "id">) => void
  removeChecklistItem: (logId: string, itemId: string) => void

  // 첨부 파일 관련 액션
  addAttachment: (logId: string, attachment: Omit<Attachment, "id">) => void
  removeAttachment: (logId: string, attachmentId: string) => void

  // 문서 출력 관련 액션
  createExportTemplate: (template: Omit<ExportTemplate, "id" | "createdAt">) => string
  updateExportTemplate: (id: string, template: Partial<ExportTemplate>) => void
  deleteExportTemplate: (id: string) => void
  getExportTemplate: (id: string) => ExportTemplate | undefined

  // 출력 이력 관련 액션
  addExportHistory: (history: Omit<ExportHistory, "id" | "createdAt">) => string
  deleteExportHistory: (id: string) => void
  getExportHistory: (id: string) => ExportHistory | undefined
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      logs: [],
      templates: [],
      draftLog: null,
      exportTemplates: [],
      exportHistory: [],

      seedDemoData: () => {
        const state = get()
        if (state.logs.length > 0 || state.templates.length > 0 || state.exportTemplates.length > 0) {
          return
        }

        // 템플릿 생성
        const templateDailyId = uuidv4()
        const templateWeeklyId = uuidv4()
        const templates: LogTemplate[] = [
          {
            id: templateDailyId,
            name: "일일 점검 템플릿",
            description: "일일 업무 점검을 위한 기본 체크리스트",
            checklistItems: [
              { id: uuidv4(), text: "금일 목표 확인", checked: false, required: true },
              { id: uuidv4(), text: "핵심 작업 진행상황 업데이트", checked: false, required: true },
              { id: uuidv4(), text: "리스크/이슈 기록", checked: false, required: false },
            ],
            createdAt: new Date(),
          },
          {
            id: templateWeeklyId,
            name: "주간 보고 템플릿",
            description: "주간 실적/계획 보고용 체크리스트",
            checklistItems: [
              { id: uuidv4(), text: "주요 성과 요약", checked: false, required: true },
              { id: uuidv4(), text: "다음 주 계획", checked: false, required: true },
              { id: uuidv4(), text: "지원 필요 사항", checked: false, required: false },
            ],
            createdAt: new Date(),
          },
        ]

        // 로그 샘플
        const logs: LogEntry[] = [
          {
            id: uuidv4(),
            title: "프론트엔드 성능 최적화 진행",
            content: "이미지 최적화와 코드 스플리팅 적용. LCP 25% 개선.",
            checklistItems: templates[0].checklistItems.map((i) => ({ ...i, id: uuidv4(), checked: i.required })),
            templateId: templateDailyId,
            attachments: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
            isDraft: false,
          },
          {
            id: uuidv4(),
            title: "주간 보고 - 45주차",
            content: "신규 대시보드 배포 완료, 오류율 30% 감소. 다음 주 테스트 자동화 목표.",
            checklistItems: templates[1].checklistItems.map((i) => ({ ...i, id: uuidv4(), checked: false })),
            templateId: templateWeeklyId,
            attachments: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            isDraft: false,
          },
        ]

        // 출력 템플릿 샘플
        const exportTemplates: ExportTemplate[] = [
          {
            id: uuidv4(),
            name: "PDF 기본",
            format: "pdf",
            includeHeader: true,
            includeFooter: true,
            includeAttachments: true,
            includeChecklist: true,
            headerText: "일지 보고서",
            footerText: "Confidential",
            createdAt: new Date(),
          },
          {
            id: uuidv4(),
            name: "DOCX 표준",
            format: "docx",
            includeHeader: true,
            includeFooter: false,
            includeAttachments: false,
            includeChecklist: true,
            headerText: "Weekly Report",
            createdAt: new Date(),
          },
        ]

        set({
          templates,
          logs,
          exportTemplates,
        })
      },

      createLog: (logData) => {
        const id = uuidv4()
        const now = new Date()
        const newLog: LogEntry = {
          id,
          ...logData,
          createdAt: now,
          updatedAt: now,
          isDraft: false,
        }

        set((state) => ({
          logs: [newLog, ...state.logs],
          draftLog: null,
        }))

        return id
      },

      updateLog: (id, logData) => {
        set((state) => ({
          logs: state.logs.map((log) => (log.id === id ? { ...log, ...logData, updatedAt: new Date() } : log)),
        }))
      },

      deleteLog: (id) => {
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        }))
      },

      getLog: (id) => {
        return get().logs.find((log) => log.id === id)
      },

      createTemplate: (templateData) => {
        const id = uuidv4()
        const newTemplate: LogTemplate = {
          id,
          ...templateData,
          createdAt: new Date(),
        }

        set((state) => ({
          templates: [newTemplate, ...state.templates],
        }))

        return id
      },

      updateTemplate: (id, templateData) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...templateData } : template,
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }))
      },

      getTemplate: (id) => {
        return get().templates.find((template) => template.id === id)
      },

      saveDraft: (logData) => {
        const { draftLog } = get()
        const now = new Date()

        if (draftLog) {
          set({
            draftLog: {
              ...draftLog,
              ...logData,
              updatedAt: now,
              isDraft: true,
            },
          })
        } else {
          set({
            draftLog: {
              id: uuidv4(),
              title: "",
              content: "",
              checklistItems: [],
              attachments: [],
              createdAt: now,
              updatedAt: now,
              isDraft: true,
              ...logData,
            },
          })
        }
      },

      clearDraft: () => {
        set({ draftLog: null })
      },

      toggleChecklistItem: (logId, itemId) => {
        set((state) => {
          if (logId === "draft" && state.draftLog) {
            return {
              draftLog: {
                ...state.draftLog,
                checklistItems: state.draftLog.checklistItems.map((item) =>
                  item.id === itemId ? { ...item, checked: !item.checked } : item,
                ),
                updatedAt: new Date(),
              },
            }
          }

          return {
            logs: state.logs.map((log) =>
              log.id === logId
                ? {
                    ...log,
                    checklistItems: log.checklistItems.map((item) =>
                      item.id === itemId ? { ...item, checked: !item.checked } : item,
                    ),
                    updatedAt: new Date(),
                  }
                : log,
            ),
          }
        })
      },

      addChecklistItem: (logId, item) => {
        const newItem = { ...item, id: uuidv4() }

        set((state) => {
          if (logId === "draft" && state.draftLog) {
            return {
              draftLog: {
                ...state.draftLog,
                checklistItems: [...state.draftLog.checklistItems, newItem],
                updatedAt: new Date(),
              },
            }
          }

          return {
            logs: state.logs.map((log) =>
              log.id === logId
                ? {
                    ...log,
                    checklistItems: [...log.checklistItems, newItem],
                    updatedAt: new Date(),
                  }
                : log,
            ),
          }
        })
      },

      removeChecklistItem: (logId, itemId) => {
        set((state) => {
          if (logId === "draft" && state.draftLog) {
            return {
              draftLog: {
                ...state.draftLog,
                checklistItems: state.draftLog.checklistItems.filter((item) => item.id !== itemId),
                updatedAt: new Date(),
              },
            }
          }

          return {
            logs: state.logs.map((log) =>
              log.id === logId
                ? {
                    ...log,
                    checklistItems: log.checklistItems.filter((item) => item.id !== itemId),
                    updatedAt: new Date(),
                  }
                : log,
            ),
          }
        })
      },

      addAttachment: (logId, attachment) => {
        const newAttachment = { ...attachment, id: uuidv4() }

        set((state) => {
          if (logId === "draft" && state.draftLog) {
            return {
              draftLog: {
                ...state.draftLog,
                attachments: [...state.draftLog.attachments, newAttachment],
                updatedAt: new Date(),
              },
            }
          }

          return {
            logs: state.logs.map((log) =>
              log.id === logId
                ? {
                    ...log,
                    attachments: [...log.attachments, newAttachment],
                    updatedAt: new Date(),
                  }
                : log,
            ),
          }
        })
      },

      removeAttachment: (logId, attachmentId) => {
        set((state) => {
          if (logId === "draft" && state.draftLog) {
            return {
              draftLog: {
                ...state.draftLog,
                attachments: state.draftLog.attachments.filter((attachment) => attachment.id !== attachmentId),
                updatedAt: new Date(),
              },
            }
          }

          return {
            logs: state.logs.map((log) =>
              log.id === logId
                ? {
                    ...log,
                    attachments: log.attachments.filter((attachment) => attachment.id !== attachmentId),
                    updatedAt: new Date(),
                  }
                : log,
            ),
          }
        })
      },

      // 문서 출력 관련 액션
      createExportTemplate: (templateData) => {
        const id = uuidv4()
        const newTemplate: ExportTemplate = {
          id,
          ...templateData,
          createdAt: new Date(),
        }

        set((state) => ({
          exportTemplates: [newTemplate, ...state.exportTemplates],
        }))

        return id
      },

      updateExportTemplate: (id, templateData) => {
        set((state) => ({
          exportTemplates: state.exportTemplates.map((template) =>
            template.id === id ? { ...template, ...templateData } : template,
          ),
        }))
      },

      deleteExportTemplate: (id) => {
        set((state) => ({
          exportTemplates: state.exportTemplates.filter((template) => template.id !== id),
        }))
      },

      getExportTemplate: (id) => {
        return get().exportTemplates.find((template) => template.id === id)
      },

      // 출력 이력 관련 액션
      addExportHistory: (historyData) => {
        const id = uuidv4()
        const newHistory: ExportHistory = {
          id,
          ...historyData,
          createdAt: new Date(),
        }

        set((state) => ({
          exportHistory: [newHistory, ...state.exportHistory],
        }))

        return id
      },

      deleteExportHistory: (id) => {
        set((state) => ({
          exportHistory: state.exportHistory.filter((history) => history.id !== id),
        }))
      },

      getExportHistory: (id) => {
        return get().exportHistory.find((history) => history.id === id)
      },
    }),
    {
      name: "log-storage",
    },
  ),
)

