import { Home, BarChart3, BookOpen, LogOut, MessageSquare, Shield, History } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { UserRole } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useGradioDemoSafe } from "@/hooks/useGradioDemoSafe";
import { INSURED_LIST } from "@/contexts/GradioDemoContext";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const allItems: { title: string; url: string; icon: typeof Home; roles: UserRole[] }[] = [
  { title: "Home", url: "/", icon: Home, roles: ["user", "admin"] },
  { title: "Chat Analytics", url: "/chat-analytics", icon: BarChart3, roles: ["user"] },
  { title: "Grounding Module", url: "/grounding-module", icon: BookOpen, roles: ["user"] },
  { title: "Gradio Demo", url: "/gradio-demo", icon: MessageSquare, roles: ["user"] },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const gradio = useGradioDemoSafe();

  const isOnGradio = location.pathname === "/gradio-demo";

  const items = allItems.filter(
    (item) => !isAuthenticated || item.roles.includes(user!.role)
  );

  // Fetch sessions when on gradio page
  const [sessions, setSessions] = useState<{ session_uuid: string; created_at?: string }[]>([]);
  useEffect(() => {
    if (!isOnGradio) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/gradio_demo/sessions`);
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch { /* ignore */ }
    })();
  }, [isOnGradio]);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center justify-between px-2 py-2">
          {!collapsed && <span className="font-semibold text-sm">Sense</span>}
          <SidebarTrigger className={collapsed ? "mx-auto" : "ml-auto"} />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-accent"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gradio Demo sub-items */}
        {isOnGradio && !collapsed && gradio && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground">
              <Shield className="mr-1.5 h-3 w-3" />
              Select Insured Name
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <Select
                  value={gradio.selectedInsured?.ref_id || ""}
                  onValueChange={(val) => {
                    const found = INSURED_LIST.find((i) => i.ref_id === val);
                    gradio.setSelectedInsured(found || null);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-8">
                    <SelectValue placeholder="Choose insured..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURED_LIST.map((item) => (
                      <SelectItem key={item.ref_id} value={item.ref_id} className="text-xs">
                        {item.insured_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SidebarGroupContent>

            <div className="px-2 pb-2">
              <button
                onClick={() => {
                  const newId = crypto.randomUUID();
                  gradio.setSessionId(newId);
                  
                  fetch(`${API_BASE}/gradio_demo/session/${newId}`, { method: "POST" }).then(() => {
                    setSessions((prev) => [{ session_uuid: newId }, ...prev]);
                  }).catch(() => {});
                }}
                className="w-full flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                Create New Session
              </button>
            </div>

            <SidebarGroupLabel className="text-xs text-muted-foreground">
              <History className="mr-1.5 h-3 w-3" />
              Chat History
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sessions.length === 0 && (
                  <p className="px-3 py-1 text-xs text-muted-foreground">No sessions yet</p>
                )}
                {sessions.map((s) => (
                  <SidebarMenuItem key={s.session_uuid}>
                    <SidebarMenuButton
                      onClick={() => gradio.setSessionId(s.session_uuid)}
                      className={`text-xs ${gradio.sessionId === s.session_uuid ? "bg-accent text-primary font-medium" : ""}`}
                    >
                      <MessageSquare className="mr-2 h-3 w-3" />
                      <span className="truncate">{s.session_uuid.slice(0, 12)}...</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {isAuthenticated && user && (
        <SidebarFooter className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 w-full rounded-md p-2 hover:bg-accent transition-colors text-left ${collapsed ? 'justify-center' : ''}`}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {user.name
                        .replace(/\./g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ')
                      }
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1).toLowerCase() || ''}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
