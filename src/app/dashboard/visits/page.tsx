import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, User, Calendar, Plus, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { VisitDialog } from '@/components/dashboard/VisitDialog'
import { VisitDetailDialog } from '@/components/dashboard/VisitDetailDialog'

export default async function VisitsPage() {
  const cookie = cookies().get('session')?.value
  const session = cookie ? await decrypt(cookie) : null
  const role = (session as any)?.role
  const userId = (session as any)?.userId

  let whereClause: any = {}

  if (role === 'COMMERCIAL') {
    whereClause = { commercial_user_id: userId }
  }

  const visits = await prisma.visit.findMany({
    where: whereClause,
    orderBy: { visited_at: 'desc' },
    include: {
      partner: true,
      commercial_user: true
    },
    take: 50
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Visites Terrain</h1>
          <p className="text-slate-500">Suivi des activités de prospection et de suivi des commerciaux.</p>
        </div>
        <VisitDialog />
      </div>

      <div className="space-y-4">
        {visits.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed text-slate-400 italic">
            Aucune visite enregistrée pour le moment.
          </div>
        ) : (
          visits.map((visit) => (
            <Card key={visit.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-48 bg-slate-50 p-6 flex flex-col items-center justify-center border-r">
                  <span className="text-xs font-bold text-slate-400 uppercase">{format(new Date(visit.visited_at), 'EEEE', { locale: fr })}</span>
                  <span className="text-2xl font-black text-[#0B1F3A]">{format(new Date(visit.visited_at), 'dd MMM', { locale: fr })}</span>
                  <span className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {format(new Date(visit.visited_at), 'HH:mm')}
                  </span>
                </div>
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-[#0B1F3A]">{visit.partner.business_name}</h3>
                        <Badge variant="outline">{visit.partner.zone}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        <span>Commercial: <span className="font-bold text-slate-700">{visit.commercial_user.full_name}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-bold uppercase">
                      <MapPin className="h-3 w-3" /> GPS Confirmé
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic text-sm text-slate-600 flex gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-300 shrink-0" />
                    {visit.notes || "Aucune note saisie."}
                  </div>
                </div>
                <div className="p-6 border-t md:border-t-0 md:border-l">
                  <VisitDetailDialog visit={visit} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
