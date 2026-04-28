'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  MapPin, 
  Truck, 
  ShoppingCart, 
  User
} from 'lucide-react'

export default function MobileNav({ role }: { role: string }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL', 'DELIVERY'] },
    { name: 'Livraisons', href: '/dashboard/deliveries', icon: Truck, roles: ['ADMIN', 'MANAGER', 'DELIVERY'] },
    { name: 'Partenaires', href: '/dashboard/partners', icon: MapPin, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
    { name: 'Ventes', href: '/dashboard/sales', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL'] },
    { name: 'Profil', href: '/dashboard/profile', icon: User, roles: ['ADMIN', 'MANAGER', 'COMMERCIAL', 'DELIVERY'] },
  ]

  const filteredTabs = tabs.filter(tab => tab.roles.includes(role))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t bg-white dark:bg-slate-900 pb-safe lg:hidden">
      {filteredTabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-[#0B1F3A] dark:text-[#C9A961]" : "text-slate-400"
            )}
          >
            <tab.icon className={cn("h-6 w-6", isActive && "fill-current")} />
            <span className="text-[10px] font-medium">{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
