'use client'

import { useEffect, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Bell, Package, Truck, AlertTriangle, Clock } from 'lucide-react'
import { getNotifications, Notification } from '@/app/dashboard/notifications-actions'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function NotificationDropdown({ session }: { session: any }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications(session.role, session.userId)
            setNotifications(data)
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 300000)
        return () => clearInterval(interval)
    }, [session])

    const iconMap = {
        STOCK: <Package className="h-4 w-4 text-orange-500" />,
        DELIVERY: <Truck className="h-4 w-4 text-blue-500" />,
        FINANCE: <AlertTriangle className="h-4 w-4 text-red-500" />,
        DISCREPANCY: <Clock className="h-4 w-4 text-purple-500" />,
    }

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-all">
                    <Bell className={`h-5 w-5 transition-colors ${notifications.length > 0 ? 'text-[#C9A961]' : 'text-slate-600'}`} />
                    {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[320px] p-0 bg-white border border-slate-200 shadow-2xl z-[100]"
                align="end"
                sideOffset={8}
            >
                <div className="flex flex-col p-4 bg-slate-50 border-b">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Centre d'Alertes</span>
                    <span className="text-[#0B1F3A] font-bold">Notifications ({notifications.length})</span>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-10 text-center space-y-3">
                            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                <Bell className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Aucune notification</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem key={n.id} className="p-0 focus:bg-slate-50 outline-none">
                                <Link
                                    href={n.href}
                                    className="flex items-start gap-4 p-4 w-full transition-colors border-b last:border-0"
                                >
                                    <div className="mt-1 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        {iconMap[n.type]}
                                    </div>
                                    <div className="flex-1 space-y-1 text-left">
                                        <p className="text-xs font-black text-[#0B1F3A] uppercase tracking-tight">{n.title}</p>
                                        <p className="text-[11px] leading-snug text-slate-500">{n.message}</p>
                                        <p className="text-[9px] text-slate-400 font-medium lowercase">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <div className="p-3 bg-slate-50 text-center border-t">
                    <Link href="/dashboard" className="text-[10px] font-black uppercase text-[#C9A961] hover:underline">
                        Tout voir
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
