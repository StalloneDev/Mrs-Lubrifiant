import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, User, Phone, CheckCircle2, Clock, Ban } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

import { PartnerDialog } from '@/components/dashboard/PartnerDialog'
import { ExportCSVButton } from '@/components/dashboard/ExportCSVButton'
import { cn } from '@/lib/utils'

export default async function PartnersPage() {
  const cookie = cookies().get('session')?.value
  const session = cookie ? await decrypt(cookie) : null
  const role = (session as any)?.role
  const userId = (session as any)?.userId

  let whereClause: any = {}

  if (role === 'COMMERCIAL') {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    whereClause = {
      OR: [
        { assigned_commercial_user_id: userId },
        { zone: user?.assigned_zone }
      ]
    }
  }

  const partners = await prisma.partner.findMany({
    where: whereClause,
    orderBy: { created_at: 'desc' },
    include: { assigned_commercial: true },
    take: 20
  })

  const exportData = partners.map(p => ({
    Code: p.code,
    Enseigne: p.business_name,
    Gerant: p.manager_name,
    Type: p.partner_type,
    Telephone: p.phone,
    Zone: p.zone || 'N/A',
    Statut: p.status
  }))

  const statusColors = {
    PENDING: "bg-orange-100 text-orange-700 border-orange-200",
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    DORMANT: "bg-slate-100 text-slate-700 border-slate-200",
    SUSPENDED: "bg-red-100 text-red-700 border-red-200",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Réseau Partenaires</h1>
          <p className="text-slate-500">Gérez vos mécaniciens et points de vente.</p>
        </div>
        <div className="flex gap-2">
          <ExportCSVButton data={exportData} filename="partenaires_mrs" />
          <PartnerDialog />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Rechercher nom, zone, gérant..." className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap">Tous</Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap text-green-600 border-green-200">Actifs</Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap text-orange-600 border-orange-200">En attente</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {partners.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 py-12 text-center text-slate-400 italic">
            Aucun partenaire enregistré pour le moment.
          </div>
        ) : (
          partners.map((partner) => (
            <Card key={partner.id} className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden">
              <div className={cn("h-1 w-full",
                partner.status === 'ACTIVE' ? "bg-green-500" :
                  partner.status === 'PENDING' ? "bg-orange-500" : "bg-slate-300"
              )} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{partner.business_name}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="font-mono">{partner.code}</span>
                      <span>•</span>
                      <span>{partner.zone || 'Zone non définie'}</span>
                    </div>
                  </div>
                  <Badge className={cn("border", statusColors[partner.status as keyof typeof statusColors])}>
                    {partner.status === 'PENDING' && <Clock className="mr-1 h-3 w-3" />}
                    {partner.status === 'ACTIVE' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {partner.status === 'SUSPENDED' && <Ban className="mr-1 h-3 w-3" />}
                    {partner.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-50">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Gérant</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <User className="h-3 w-3 text-slate-400" />
                      <span className="text-sm font-medium">{partner.manager_name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Téléphone</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span className="text-sm font-medium">{partner.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <PartnerDialog
                    partner={partner}
                    trigger={
                      <div className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors overflow-hidden">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white",
                          partner.assigned_commercial ? "bg-[#0B1F3A]" : "bg-slate-200"
                        )}>
                          {partner.assigned_commercial?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="text-xs text-left">
                          <p className="text-slate-400 leading-tight">Commercial</p>
                          <p className="font-medium text-slate-700 leading-tight truncate max-w-[100px]">
                            {partner.assigned_commercial?.full_name || 'Non assigné'}
                          </p>
                        </div>
                      </div>
                    }
                  />
                  <Link href={`/dashboard/partners/${partner.id}`}>
                    <Button variant="ghost" size="sm" className="text-[#C9A961] font-bold hover:text-[#B89850] hover:bg-transparent px-0 underline underline-offset-4">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
