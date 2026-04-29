import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import MobileNav from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookie = cookies().get('session')?.value
  const session = cookie ? await decrypt(cookie) : null

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="print:hidden">
        <Sidebar role={session.role} />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="print:hidden">
          <Header session={session} />
        </div>
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 print:p-0">
          {children}
        </main>
        <div className="print:hidden">
          <MobileNav role={session.role} />
        </div>
      </div>
    </div>
  )
}
