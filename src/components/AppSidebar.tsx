import { Home, BarChart3, BookOpen, LogOut, MessageSquare, Shield, History, Trash2, Sparkles, Database, Search, Loader2, FileText, Building2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { UserPermissions, UserRole } from "@/contexts/AuthContext";
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
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type SidebarItem = {
  title: string;
  url: string;
  icon: typeof Home;
  roles: UserRole[];
  permission?: keyof UserPermissions;
};

const allItems: SidebarItem[] = [
  { title: "Home", url: "/", icon: Home, roles: ["user", "admin"] },
  { title: "Chat Analytics", url: "/chat-analytics", icon: BarChart3, roles: ["user"], permission: "chat_analytics" },
  { title: "Grounding Module", url: "/grounding-module", icon: BookOpen, roles: ["user"], permission: "grounding_module" },
  { title: "Tools Management", url: "/api-data", icon: Database, roles: ["user", "admin"], permission: "api_data" },
  { title: "Onboard New Tenant", url: "/onboard-new-tenant", icon: Building2, roles: ["user", "admin"] },
  { title: "Prompts Library", url: "/prompts", icon: Sparkles, roles: ["user", "admin"], permission: "prompts" },
  { title: "Chat", url: "/chat", icon: MessageSquare, roles: ["user"], permission: "chat" }
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

  const isOnGradio = location.pathname === "/chat";
  const sessions = gradio?.sessions || [];
  const insuredList = gradio?.insuredList || [];
  const [searchTerm, setSearchTerm] = useState("");

  const items = allItems.filter((item) => {
    if (!isAuthenticated) return true;
    if (!item.roles.includes(user!.role)) return false;
    if (!item.permission) return true;
    return user?.permissions?.[item.permission] === "allowed";
  });

  const fetchSessions = async () => {
    if (!user?.email) return [];
    const emailStr = encodeURIComponent(user.email);
    const res = await fetch(`${API_BASE}/gradio_demo/sessions?email=${emailStr}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  };

  // Fetch sessions when on gradio page
  useEffect(() => {
    if (!isOnGradio || !gradio || !user?.email) return;
    (async () => {
      try {
        const list = await fetchSessions();
        gradio.setSessions(list);

        // Auto-select latest session if none is active
        if ((!gradio.sessionId || gradio.sessionId === "default_session") && list.length > 0) {
          gradio.setSessionId(list[0].session_uuid);
        }
      } catch {
        // ignore
      }
    })();
    // Intentionally only dependent on page location; avoid refetch loops.
  }, [isOnGradio, user?.email]);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center justify-between px-2 py-2">
          {collapsed ? (
            <SidebarTrigger className="mx-auto" />
          ) : (
            <>
              <img src="/bluepond.png" alt="BluePond" className="h-7 object-contain" />
              <SidebarTrigger className="ml-auto" />
            </>
          )}
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
            <div className="pb-2">
              <button
                onClick={() => {
                  const newId = crypto.randomUUID();
                  gradio.setSessionId(newId);

                  if (!user?.email) return;
                  const emailStr = encodeURIComponent(user.email);
                  fetch(`${API_BASE}/gradio_demo/session/${newId}?email=${emailStr}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_name: "New Chat" }),
                  })
                    .then(async () => {
                      const list = await fetchSessions();
                      gradio.setSessions(list);
                    })
                    .catch(() => { });
                }}
                className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md 
                          transition-colors group
                          hover:bg-sky-100 active:bg-sky-200"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-medium">New chat</span>
              </button>
            </div>
            <SidebarGroupLabel className="text-xs text-muted-foreground">
              <Shield className="mr-1.5 h-3 w-3" />
              Select Insured Name
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 pb-2 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, account, policy..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                </div>
                <Select
                  value={gradio.selectedInsured?.ref_id || ""}
                  onValueChange={(val) => {
                    const found = insuredList.find((i) => i.ref_id === val);
                    gradio.setSelectedInsured(found || null);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-8">
                    <SelectValue placeholder={gradio.isLoadingInsureds ? "Loading..." : "Choose insured..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {gradio.isLoadingInsureds && (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {insuredList
                      .filter((item) => {
                        if (item.ref_id === "landing_page") return true;
                        const term = searchTerm.toLowerCase();
                        return (
                          (item.insured_name && item.insured_name.toLowerCase().includes(term)) ||
                          (item.account_number && item.account_number.toLowerCase().includes(term)) ||
                          (item.policy_number && item.policy_number.toLowerCase().includes(term))
                        );
                      })
                      .map((item) => (
                        <SelectItem key={item.ref_id} value={item.ref_id} className="text-xs">
                          {item.insured_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </SidebarGroupContent>

            {sessions.length > 0 && (
              <>
                <SidebarGroupLabel className="text-xs text-muted-foreground">
                  <History className="mr-1.5 h-3 w-3" />
                  Chat History
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sessions.map((s) => (
                      <SidebarMenuItem key={s.session_uuid}>
                        <div className="flex items-center w-full">
                          <SidebarMenuButton
                            onClick={() => gradio.setSessionId(s.session_uuid)}
                            className={`flex-1 text-xs ${gradio.sessionId === s.session_uuid ? "bg-accent text-primary font-medium" : ""}`}
                          >
                            <MessageSquare className="mr-2 h-3 w-3" />
                            <span className="truncate">{s.session_name || s.session_uuid.slice(0, 12) + "..."}</span>
                          </SidebarMenuButton>

                          <button
                            type="button"
                            aria-label="Delete session"
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              const ok = window.confirm("Delete this session? This cannot be undone.");
                              if (!ok) return;

                              if (!user?.email) return;
                              try {
                                const emailStr = encodeURIComponent(user.email);
                                const res = await fetch(`${API_BASE}/gradio_demo/session/${s.session_uuid}?email=${emailStr}`, { method: "DELETE" });
                                if (!res.ok) return;

                                const list = await fetchSessions();
                                gradio.setSessions(list);

                                if (gradio.sessionId === s.session_uuid) {
                                  gradio.setSessionId(list[0]?.session_uuid || "default_session");
                                }
                              } catch {
                                // ignore
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            )}
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
