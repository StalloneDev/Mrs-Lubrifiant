'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Fuel,
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  Wallet,
  MapPin,
  Settings,
  AlertTriangle,
  FileText
} from 'lucide-react'

const navItems = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL', 'DELIVERY'] },
  { name: 'Produits', href: '/dashboard/products', icon: Package, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL', 'DELIVERY'] },
  { name: 'Stocks', href: '/dashboard/stocks', icon: Fuel, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Partenaires', href: '/dashboard/partners', icon: Users, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Livraisons', href: '/dashboard/deliveries', icon: Truck, roles: ['ADMIN', 'MANAGER', 'DELIVERY', 'COMMERCIAL'] },
  { name: 'Ventes', href: '/dashboard/sales', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Factures', href: '/dashboard/invoices', icon: FileText, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Commissions', href: '/dashboard/commissions', icon: Wallet, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Encaissements', href: '/dashboard/payments', icon: Wallet, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Visites', href: '/dashboard/visits', icon: MapPin, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
  { name: 'Litiges', href: '/dashboard/discrepancies', icon: AlertTriangle, roles: ['ADMIN', 'MANAGER'] },
  { name: 'Audit', href: '/dashboard/audit', icon: FileText, roles: ['ADMIN'] },
  { name: 'Utilisateurs', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
]

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()

  const filteredItems = navItems.filter(item => item.roles.includes(role))

  return (
    <aside className="hidden w-64 flex-col border-r bg-white dark:bg-slate-900 lg:flex sticky top-0 h-screen overflow-y-auto transition-all">
      <div className="flex h-20 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-12 w-12 relative overflow-hidden">
            <img src="/logo.png" alt="MRS Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0B1F3A] dark:text-white">MRS Lub</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#0B1F3A] text-[#C9A961] shadow-lg shadow-[#0B1F3A]/10"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-[#C9A961]" : "text-slate-400")} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Support Technique</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Besoin d'aide ? Contactez le Directeur Commercial MRS.</p>
        </div>
      </div>
    </aside>
  )
}
