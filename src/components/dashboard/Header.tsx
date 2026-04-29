'use client'

import { useState } from 'react'
import { logout } from '@/app/login/logout-action'
import { Button } from '@/components/ui/button'
import { Bell, LogOut, Menu, User, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Tableau de bord', href: '/dashboard', roles: ['ADMIN', 'MANAGER', 'COMMERCIAL', 'DELIVERY'] },
  { name: 'Produits', href: '/dashboard/products', roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Stocks', href: '/dashboard/stocks', roles: ['ADMIN', 'MANAGER'] },
  { name: 'Partenaires', href: '/dashboard/partners', roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Livraisons', href: '/dashboard/deliveries', roles: ['ADMIN', 'MANAGER', 'DELIVERY', 'COMMERCIAL'] },
  { name: 'Ventes', href: '/dashboard/sales', roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Factures', href: '/dashboard/invoices', roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Commissions', href: '/dashboard/commissions', roles: ['ADMIN', 'MANAGER'] },
  { name: 'Encaissements', href: '/dashboard/payments', roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Visites', href: '/dashboard/visits', roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Litiges', href: '/dashboard/discrepancies', roles: ['ADMIN', 'MANAGER'] },
  { name: 'Audit', href: '/dashboard/audit', roles: ['ADMIN'] },
  { name: 'Utilisateurs', href: '/dashboard/users', roles: ['ADMIN'] },
]

import { NotificationDropdown } from './NotificationDropdown'

export default function Header({ session }: { session: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-8">
        <div className="flex items-center gap-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-bold text-[#0B1F3A]">MRS Lub</span>
        </div>

        <div className="hidden flex-1 lg:block max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher partenaires, factures..."
            className="pl-10 bg-slate-100 border-none focus-visible:ring-[#C9A961]"
          />
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <NotificationDropdown session={session} />

          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none">{(session as any).fullName || session.role}</p>
              <p className="text-xs text-slate-500 mt-1">{session.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="h-6 w-6 text-slate-500" />
            </div>

            <form action={logout}>
              <Button variant="ghost" size="icon" type="submit" className="text-slate-400 hover:text-red-500 transition-colors">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[240px] bg-white dark:bg-slate-900 border-r animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="flex h-20 items-center justify-between border-b px-6">
                <div className="flex items-center gap-3 font-bold text-[#0B1F3A]">
                  <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                  <span>Menu</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
                {navItems.filter(item => item.roles.includes(session.role)).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2.5 text-sm font-bold transition-all",
                        isActive
                          ? "bg-[#0B1F3A] text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
              <div className="p-4 border-t">
                <form action={logout}>
                  <Button variant="outline" className="w-full justify-start text-red-500" type="submit">
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
