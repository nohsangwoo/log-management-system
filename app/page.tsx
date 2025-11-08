"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, CheckSquare, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLogStore } from "@/lib/store/log-store"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"

export default function Dashboard() {
  const router = useRouter()
  const logs = useLogStore((state) => state.logs)
  const templates = useLogStore((state) => state.templates)

  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [recentTemplates, setRecentTemplates] = useState<any[]>([])

  useEffect(() => {
    // 최근 일지 3개 가져오기
    const sortedLogs = [...logs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)

    setRecentLogs(sortedLogs)

    // 최근 체크리스트 템플릿 3개 가져오기
    const sortedTemplates = [...templates]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)

    setRecentTemplates(sortedTemplates)
  }, [logs, templates])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    })
  }

  const totalLogs = logs?.length ?? 0
  const totalTemplates = templates?.length ?? 0
  const todayCount = useMemo(() => {
    const todayStr = new Date().toDateString()
    return (logs ?? []).filter((l: any) => new Date(l.createdAt).toDateString() === todayStr).length
  }, [logs])

  const handleNewLog = () => router.push("/log-entry/new")
  const handleNewTemplate = () => router.push("/checklists/new")

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-3"
      >
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>일지 관리 시스템</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-br from-foreground to-muted-foreground/80 bg-clip-text text-transparent">
            대시보드
          </span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          최근 일지와 템플릿을 한눈에 확인하고, 빠르게 작업을 시작하세요.
        </p>
      </motion.div>

      {/* KPI 카드 */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.05 },
          },
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          {
            label: "총 일지",
            value: totalLogs,
            icon: FileText,
          },
          {
            label: "체크리스트 템플릿",
            value: totalTemplates,
            icon: CheckSquare,
          },
          {
            label: "오늘 작성",
            value: todayCount,
            icon: PlusCircle,
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          >
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* 리스트 + 액션 */}
      <div className="grid gap-4 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="xl:col-span-2 grid gap-4 md:grid-cols-2"
        >
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>최근 일지</CardTitle>
              <CardDescription>최근에 작성한 일지 목록</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length > 0 ? (
                <ul className="space-y-3">
                  {recentLogs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/40 transition-colors"
                    >
                      <Link href={`/log-entry/${log.id}`} className="font-medium hover:underline">
                        {log.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-2">작성된 일지가 없습니다</p>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => router.push("/log-entry")}>
                  모든 일지 보기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>체크리스트</CardTitle>
              <CardDescription>활성화된 체크리스트</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTemplates.length > 0 ? (
                <ul className="space-y-3">
                  {recentTemplates.map((template) => (
                    <li
                      key={template.id}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/40 transition-colors"
                    >
                      <Link href={`/checklists/${template.id}`} className="font-medium hover:underline">
                        {template.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        항목 {template.checklistItems.length}개
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-2">생성된 체크리스트가 없습니다</p>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => router.push("/checklists")}>
                  체크리스트 관리
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="xl:col-span-1"
        >
          <Card className="card-hover h-full">
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
              <CardDescription>자주 사용하는 작업</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleNewLog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                새 일지 작성
              </Button>
              <Button className="w-full" variant="outline" onClick={handleNewTemplate}>
                <CheckSquare className="mr-2 h-4 w-4" />
                새 체크리스트 만들기
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/document-conversion")}
              >
                <FileText className="mr-2 h-4 w-4" />
                보고서 생성
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
