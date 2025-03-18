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
import { Home, FileText, CheckSquare, FileOutput, Settings } from "lucide-react"
import Link from "next/link"

const menuItems = [
  { title: "대시보드", icon: Home, url: "/" },
  { title: "일지 작성", icon: FileText, url: "/log-entry" },
  { title: "체크리스트", icon: CheckSquare, url: "/checklists" },
  { title: "문서 변환", icon: FileOutput, url: "/document-conversion" },
  { title: "설정", icon: Settings, url: "/settings" },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>일지 관리 시스템</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

