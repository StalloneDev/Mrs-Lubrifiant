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
      <Sidebar role={session.role} />
      <div className="flex flex-1 flex-col">
        <Header session={session} />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
        <MobileNav role={session.role} />
      </div>
    </div>
  )
}
