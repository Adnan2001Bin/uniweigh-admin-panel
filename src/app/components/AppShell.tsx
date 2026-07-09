import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import type { useAppState } from "../hooks/useAppState";
import { renderAppContent } from "../views/renderAppContent";

type AppState = ReturnType<typeof useAppState>;

interface AppShellProps {
  state: AppState;
}

export default function AppShell({ state }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50/50 font-sans text-gray-800 antialiased">
      <Sidebar
        activeView={state.activeView}
        onViewChange={(viewId) => {
          state.setActiveView(viewId);
          state.setSearchQuery("");
        }}
        collapsed={state.sidebarCollapsed}
        onToggleCollapse={() =>
          state.setSidebarCollapsed(!state.sidebarCollapsed)
        }
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Header
          adminUser={state.adminUser}
          selectedSite={state.selectedSite}
          onSiteChange={state.setSelectedSite}
          searchQuery={state.searchQuery}
          onSearchChange={state.setSearchQuery}
          onToggleSidebar={() =>
            state.setSidebarCollapsed(!state.sidebarCollapsed)
          }
          sites={state.sites}
          siteLimit={state.siteLimit}
          onEnterClerkMode={() => state.setIsClerkMode(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-3 md:px-3">
          <div className="w-full pb-10">{renderAppContent(state)}</div>
        </main>
      </div>
    </div>
  );
}
