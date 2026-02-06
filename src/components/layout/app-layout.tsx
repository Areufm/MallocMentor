import { Sidebar } from './sidebar'
import { Header } from './header'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
