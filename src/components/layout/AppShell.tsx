"use client";

import { TopBar } from "./TopBar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { BottomTimeline } from "./BottomTimeline";
import { CommandMenu } from "@/components/command/CommandMenu";
import { useRoomStore } from "@/lib/store";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AppShellProps {
  children: React.ReactNode;
  showSidebars?: boolean;
  showTimeline?: boolean;
}

export function AppShell({ children, showSidebars = false, showTimeline = false }: AppShellProps) {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    setLeftSidebarOpen,
    setRightSidebarOpen,
  } = useRoomStore();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080b12]">
      <TopBar showSidebars={showSidebars} />

      <div className="flex min-h-0 flex-1">
        {showSidebars && (
          <aside className="hidden w-[320px] shrink-0 border-r border-white/10 xl:block">
            <LeftSidebar />
          </aside>
        )}

        <main className="min-h-0 min-w-0 flex-1">{children}</main>

        {showSidebars && (
          <aside className="hidden w-[360px] shrink-0 border-l border-white/10 xl:block">
            <RightSidebar />
          </aside>
        )}
      </div>

      {showTimeline && <BottomTimeline />}

      {showSidebars && (
        <>
          <Sheet open={leftSidebarOpen} onOpenChange={setLeftSidebarOpen}>
            <SheetContent side="left" className="w-[92vw] max-w-[360px] border-white/10 bg-[#0c1018] p-0 xl:hidden">
              <LeftSidebar />
            </SheetContent>
          </Sheet>

          <Sheet open={rightSidebarOpen} onOpenChange={setRightSidebarOpen}>
            <SheetContent side="right" className="w-[92vw] max-w-[380px] border-white/10 bg-[#0c1018] p-0 xl:hidden">
              <RightSidebar />
            </SheetContent>
          </Sheet>
        </>
      )}

      <CommandMenu />
    </div>
  );
}
