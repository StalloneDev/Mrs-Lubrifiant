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
        // Poll every 5 minutes
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
                <Button variant="ghost" size="icon" className="relative transition-all hover:bg-slate-100">
                    <Bell className={`h-5 w-5 transition-colors ${notifications.length > 0 ? 'text-[#C9A961]' : 'text-slate-600'}`} />
                    {notifications.length > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[320px] p-0 border-none shadow-2xl" align="end">
                <DropdownMenuLabel className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase font-black text-slate-400 tracking-widest">Alertes Centre</span>
                        <span className="text-[#0B1F3A] font-bold">Notifications ({notifications.length})</span>
                    </div>
                    {notifications.length > 0 && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">Nouveau</span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                            <Bell className="h-10 w-10 text-slate-100 mx-auto" />
                            <p className="text-sm text-slate-400 font-medium">Tout est en ordre !<br />Aucune alerte pour le moment.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem key={n.id} asChild>
                                <Link
                                    href={n.href}
                                    className="flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors border-b last:border-0"
                                >
                                    <div className="mt-1 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        {iconMap[n.type]}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-xs font-black text-[#0B1F3A] uppercase tracking-tight">{n.title}</p>
                                        <p className="text-[11px] leading-snug text-slate-500">{n.message}</p>
                                        <p className="text-[9px] text-slate-400 font-medium">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <div className="p-3 bg-slate-50 text-center">
                    <Link href="/dashboard" className="text-[10px] font-black uppercase text-[#C9A961] hover:underline">
                        Voir tout le tableau de bord
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
