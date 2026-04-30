import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, MapPin } from 'lucide-react'
import { redirect } from 'next/navigation'

const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    MANAGER: 'Manager',
    COMMERCIAL: 'Commercial Terrain',
    DELIVERY: 'Livreur',
}

const roleBadgeColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    MANAGER: 'bg-purple-100 text-purple-700',
    COMMERCIAL: 'bg-blue-100 text-blue-700',
    DELIVERY: 'bg-green-100 text-green-700',
}

export default async function ProfilePage() {
    const cookie = cookies().get('session')?.value
    const session = cookie ? await decrypt(cookie) : null

    if (!session) redirect('/login')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session as any)?.userId
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) redirect('/login')

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#0B1F3A]">Mon Profil</h1>
                <p className="text-sm text-muted-foreground">Informations de votre compte</p>
            </div>

            {/* Avatar & Role */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#0B1F3A] flex items-center justify-center">
                            <User className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0B1F3A]">{user.full_name}</h2>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeColors[user.role]}`}>
                                {roleLabels[user.role] || user.role}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Informations du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Nom complet</p>
                            <p className="font-medium text-sm">{user.full_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium text-sm">{user.email || '—'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Rôle</p>
                            <p className="font-medium text-sm">{roleLabels[user.role] || user.role}</p>
                        </div>
                    </div>

                    {user.assigned_zone && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Zone assignée</p>
                                <p className="font-medium text-sm">{user.assigned_zone}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="text-xs text-center text-muted-foreground pb-4">
                MRS Lubricants Platform — Compte créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
            </div>
        </div>
    )
}
