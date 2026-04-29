import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Search, TrendingUp, Calendar, ArrowUpRight, Filter, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ExportCSVButton } from '@/components/dashboard/ExportCSVButton'
import SaleDeclaration from '@/components/dashboard/SaleDeclaration'

export default async function SalesPage() {
  const cookie = cookies().get('session')?.value
  const session = cookie ? await decrypt(cookie) : null
  const role = (session as any)?.role
  const userId = (session as any)?.userId

  let whereClause: any = {}

  if (role === 'COMMERCIAL') {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    whereClause = {
      partner: {
        OR: [
          { assigned_commercial_user_id: userId },
          { zone: user?.assigned_zone }
        ]
      }
    }
  }

  const sales = await prisma.sale.findMany({
    where: whereClause,
    orderBy: { sale_date: 'desc' },
    include: {
      partner: true,
      _count: { select: { lines: true } }
    },
    take: 50
  })

  const totalAmount = sales.reduce((acc, sale) => acc + (sale.total_ttc || 0), 0)

  // 4. AGING RECEIVABLES CALCULATION
  const now = new Date()
  const aging = {
    current: 0, // 0-30 days
    overdue30: 0, // 31-60 days
    overdue60: 0 // 61+ days
  }

  const unpaidSales = await prisma.sale.findMany({
    where: { ...whereClause, status: { in: ['VALIDATED', 'INVOICED', 'PARTIALLY_PAID'] } }
  })

  unpaidSales.forEach(s => {
    const diffDays = Math.floor((now.getTime() - new Date(s.sale_date).getTime()) / (1000 * 3600 * 24))
    const due = s.total_ttc || 0
    if (diffDays <= 30) aging.current += due
    else if (diffDays <= 60) aging.overdue30 += due
    else aging.overdue60 += due
  })

  const exportData = sales.map(s => ({
    Num_Facture: s.sale_number,
    Date: format(new Date(s.sale_date), 'yyyy-MM-dd'),
    Partenaire: s.partner?.business_name || 'Vente Directe',
    Total_HT: s.total_ht,
    Total_TTC: s.total_ttc,
    Type: s.sale_type
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Historique des Ventes</h1>
          <p className="text-slate-500">Suivi des sorties de stock chez les partenaires.</p>
        </div>
        <Link href="/dashboard/sales/new">
          <Button className="bg-[#C9A961] hover:bg-[#B89850] text-white font-bold px-6 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95">
            <ShoppingCart className="mr-2 h-4 w-4" /> Nouvelle Vente
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm bg-amber-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Créances Actives</p>
                <h3 className="text-2xl font-black text-[#0B1F3A] mt-1">{(aging.current + aging.overdue30 + aging.overdue60).toLocaleString()} <span className="text-sm font-medium">FCFA</span></h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-[#C9A961] flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-green-600 bg-green-100 w-fit px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3" /> +12% cette semaine
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-purple-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Chiffre d'Affaires Total</p>
                <h3 className="text-2xl font-black text-[#0B1F3A] mt-1">{totalAmount.toLocaleString()} <span className="text-sm font-medium text-slate-400">FCFA</span></h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-4">{sales.length} transaction(s) enregistrée(s)</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-orange-50/50 hidden lg:block">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Panier Moyen</p>
                <h3 className="text-2xl font-black text-[#0B1F3A] mt-1">
                  {sales.length > 0 ? Math.round(totalAmount / sales.length).toLocaleString() : 0}
                  <span className="text-sm font-medium text-slate-400"> FCFA</span>
                </h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-4">Performance par partenaire</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 py-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Balance Âgée des Créances (Impayés)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-3 divide-x text-center">
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">0 - 30 Jours</p>
              <p className="text-xl font-black text-emerald-600">{aging.current.toLocaleString()} <span className="text-xs">FCFA</span></p>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">31 - 60 Jours</p>
              <p className="text-xl font-black text-orange-500">{aging.overdue30.toLocaleString()} <span className="text-xs">FCFA</span></p>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">+60 Jours</p>
              <p className="text-xl font-black text-red-600">{aging.overdue60.toLocaleString()} <span className="text-xs">FCFA</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Rechercher par partenaire ou numéro de facture..." className="pl-10 h-10 rounded-xl" />
        </div>
        <Button variant="outline" className="h-10 rounded-xl px-4 border-slate-200">
          <Filter className="mr-2 h-4 w-4" /> Filtres Avancés
        </Button>
        <div className="flex gap-2">
          <ExportCSVButton data={exportData} filename="ventes_mrs" />
        </div>
      </div>

      <div className="space-y-4">
        {sales.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed text-slate-400">
            <ShoppingCart className="mx-auto h-12 w-12 opacity-20 mb-4 text-[#0B1F3A]" />
            Aucune vente enregistrée pour le moment.
          </div>
        ) : (
          sales.map((sale) => (
            <Card key={sale.id} className="group overflow-hidden border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <div className="flex flex-col md:flex-row p-4 gap-4">
                <div className="flex flex-1 items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-[#0B1F3A] group-hover:text-white transition-colors">
                    <span className="text-[10px] uppercase font-black opacity-60">
                      {format(new Date(sale.sale_date), 'MMM', { locale: fr })}
                    </span>
                    <span className="text-lg font-black leading-none">
                      {format(new Date(sale.sale_date), 'dd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 group-hover:text-[#0B1F3A] transition-colors">{sale.partner?.business_name || 'Vente Directe'}</span>
                      <Badge variant="secondary" className="text-[8px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 border-none px-1.5 h-4">
                        {sale.sale_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Aujourd'hui à {format(new Date(sale.sale_date), 'HH:mm')}
                      </div>
                      <span>•</span>
                      <span className="bg-[#C9A961]/10 text-[#C9A961] px-2 rounded-full text-[10px] font-bold">
                        {sale._count.lines} produits vendus
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Montant Net</p>
                    <p className="text-xl font-black text-[#0B1F3A]">{sale.total_ttc?.toLocaleString()} <span className="text-xs font-bold">FCFA</span></p>
                  </div>
                  <Link href={`/dashboard/sales/${sale.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-[#C9A961]/10" title="Voir les détails">
                      <Eye className="h-5 w-5 text-[#C9A961]" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
