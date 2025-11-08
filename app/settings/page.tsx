"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { motion } from "framer-motion"

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const isDark = useMemo(() => (theme === "system" ? resolvedTheme === "dark" : theme === "dark"), [theme, resolvedTheme])

  const handleQuickToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">설정</h1>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>테마 설정</CardTitle>
          <CardDescription>라이트/다크 모드를 선택하거나 시스템 설정을 따를 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-1">
              <Label className="text-base">빠른 토글</Label>
              <p className="text-sm text-muted-foreground">라이트/다크를 즉시 전환합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch checked={!!isDark} onCheckedChange={handleQuickToggle} />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">모드 선택</Label>
            <div className="grid grid-cols-3 gap-3">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  라이트
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  다크
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  시스템
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            현재 모드: <span className="font-medium">{theme === "system" ? `시스템(${resolvedTheme})` : theme}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


