'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Home,
  FileText,
  CheckSquare,
  FileOutput,
  History,
  PlusCircle,
  Settings,
  LayoutTemplate,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dcTab = pathname === "/document-conversion" ? (searchParams.get("tab") || "export") : null

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>개요</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    <span>대시보드</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>일지</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/log-entry")}>
                  <Link href="/log-entry">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>일지 목록</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/log-entry/new")}>
                  <Link href="/log-entry/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>새 일지</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>체크리스트</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/checklists")}>
                  <Link href="/checklists">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <span>템플릿 목록</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/checklists/new")}>
                  <Link href="/checklists/new">
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    <span>새 템플릿</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>문서 변환</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    (isActive("/document-conversion") && !pathname.includes("templates") && !pathname.includes("history") && (dcTab === null || dcTab === "export")) ||
                    dcTab === "export"
                  }
                >
                  <Link href="/document-conversion?tab=export">
                    <FileOutput className="mr-2 h-4 w-4" />
                    <span>문서 출력</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("/document-conversion/templates") || dcTab === "templates"}
                >
                  <Link href="/document-conversion?tab=templates">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>출력 양식</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={dcTab === "history"}
                >
                  <Link href="/document-conversion?tab=history">
                    <History className="mr-2 h-4 w-4" />
                    <span>출력 이력</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>기타</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

