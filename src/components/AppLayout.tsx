import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <SidebarProvider>
      <style>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)/0.4); }
      `}</style>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
          {!isAuthenticated && (
            <header className="flex-shrink-0 flex items-center justify-end gap-2 px-6 py-3 border-b">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </header>
          )}
          <main className="flex-1 h-full overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
