import { ToolsSidebar } from '@/components/tools-sidebar'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col lg:flex-row">
      <ToolsSidebar />
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
