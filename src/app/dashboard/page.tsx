import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  Users,
  Package,
  Truck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const cookie = cookies().get('session')?.value
  const session = cookie ? await decrypt(cookie) : null
  const role = (session as any)?.role
  const userId = (session as any)?.userId

  // 1. ADMIN / MANAGER VIEW
  if (role === 'ADMIN' || role === 'MANAGER') {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const results = await Promise.all([
      prisma.product.count(),
      prisma.partner.count(),
      prisma.sale.aggregate({ _sum: { total_ttc: true } }),
      prisma.delivery.count({ where: { status: { in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.delivery.count({ where: { status: 'DELIVERED' } }),
      prisma.discrepancyLog.count({ where: { status: 'OPEN' } }),
      prisma.stockLevel.findMany({
        include: { product: true, warehouse: true },
        where: { warehouse: { type: 'CENTRAL' } }
      }),
      prisma.saleLine.groupBy({
        by: ['product_id'],
        _sum: { line_total: true }
      }),
      prisma.product.findMany({ select: { id: true, name: true } }),
      prisma.sale.groupBy({
        by: ['created_by'],
        _sum: { total_ttc: true }
      }),
      prisma.user.findMany({ where: { role: 'COMMERCIAL' }, select: { id: true, full_name: true } }),
      // Safe check for the new model (might be undefined until server restart)
      (prisma as any).commercialGoal
        ? (prisma as any).commercialGoal.findMany({ where: { month: currentMonth, year: currentYear } })
        : Promise.resolve([]),
      // Aging receivables for alert
      prisma.sale.count({
        where: {
          status: { in: ['VALIDATED', 'INVOICED', 'PARTIALLY_PAID'] },
          sale_date: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ])

    // Proper destructuring of results
    const [
      totalProducts,
      totalPartners,
      totalSales,
      pendingDeliveries,
      deliveredButNotConfirmedCount,
      openDiscrepanciesCount,
      allCentralStocks,
      salesByProduct,
      allProductsList,
      salesByUser,
      allCommercials,
      activeGoals,
      oldUnpaidCount
    ] = results as any[]

    const lowStockAlerts = allCentralStocks.filter((s: any) => s.quantity <= (s.product.reorder_point || 10))
    const chartData = salesByProduct.map((sale: any) => {
      const p = allProductsList.find((x: any) => x.id === sale.product_id)
      return { name: p?.name || 'Inconnu', total: sale._sum.line_total || 0 }
    }).sort((a: any, b: any) => b.total - a.total).slice(0, 5)

    const totalSalesAmount = totalSales._sum.total_ttc || 0

    // Calculate Margin: fetch all sale lines with their product's purchase price
    const allSaleLines = await prisma.saleLine.findMany({
      include: { product: { select: { purchase_price: true } } }
    })
    const totalBuyingCost = allSaleLines.reduce((acc, line) => acc + (line.quantity * (line.product.purchase_price || 0)), 0)
    const totalMargin = totalSalesAmount - totalBuyingCost

    const stats = [
      { title: 'Chiffre d\'Affaires Net', value: `${totalSalesAmount.toLocaleString()} FCFA`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
      { title: 'Marge Brute Estimée', value: `${totalMargin.toLocaleString()} FCFA`, icon: ArrowUpRight, color: "text-[#C9A961]", bg: "bg-amber-50/50", border: "border-amber-100" },
      { title: 'Livraisons en Transit', value: deliveredButNotConfirmedCount.toString(), icon: Truck, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
      { title: 'Litiges Ouverts', value: openDiscrepanciesCount.toString(), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    ]

    const topCommercials = (salesByUser as any[]).map(s => {
      const user = allCommercials.find((u: any) => u.id === s.created_by)
      return { id: s.created_by, name: user?.full_name || 'Admin/Autre', total: s._sum.total_ttc || 0 }
    }).sort((a, b) => b.total - a.total).slice(0, 5)

    return (
      <div className="space-y-8 pb-16 lg:pb-0">
        <HeaderTop session={session} />
        <StatsGrid stats={stats} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 border-none shadow-md">
            <CardHeader><CardTitle>Top 5 des ventes par Produit</CardTitle></CardHeader>
            <CardContent><SalesChart data={chartData} /></CardContent>
          </Card>
          <Card className="lg:col-span-3 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Objectifs Commerciaux</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#C9A961]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCommercials.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aucune donnée de vente.</p>
                ) : (
                  topCommercials.map((comm: any, i: number) => {
                    const goal = activeGoals.find((g: any) => g.user_id === comm.id)
                    const achievement = goal ? Math.round((comm.total / goal.target_amount) * 100) : null

                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[#0B1F3A] font-bold text-xs">
                              {comm.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">{comm.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{achievement !== null ? `${achievement}% atteint` : 'Objectif non défini'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#0B1F3A]">{comm.total.toLocaleString()} FCFA</p>
                          </div>
                        </div>
                        {achievement !== null && (
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all", achievement >= 100 ? "bg-emerald-500" : achievement >= 50 ? "bg-[#C9A961]" : "bg-orange-500")}
                              style={{ width: `${Math.min(achievement, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alertes & Actions Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockAlerts.length === 0 ? (
                  <EmptyAlerts />
                ) : (
                  lowStockAlerts.map((alert: any, i: number) => <StockAlert key={i} alert={alert} />)
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Litiges & Alertes Paiement</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {oldUnpaidCount > 0 && (
                  <Link href="/dashboard/sales">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-orange-50 border border-orange-100 mb-2 hover:bg-orange-100 transition-colors cursor-pointer">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-orange-900">{oldUnpaidCount} factures impayées (+30j)</p>
                        <p className="text-[10px] text-orange-700">Risque de créances douteuses.</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-orange-400" />
                    </div>
                  </Link>
                )}
                {openDiscrepanciesCount > 0 && (
                  <Link href="/dashboard/discrepancies">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-red-50 border border-red-100 mb-4 hover:bg-red-100 transition-colors cursor-pointer">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-900">{openDiscrepanciesCount} litige(s) ouvert(s)</p>
                        <p className="text-[10px] text-red-700">Écarts de livraison à traiter.</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-red-400" />
                    </div>
                  </Link>
                )}
                {openDiscrepanciesCount === 0 && oldUnpaidCount === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                    <CheckCircle2 className="h-8 w-8 mb-2 text-emerald-500 opacity-20" />
                    <p className="text-xs italic">Aucune alerte prioritaire.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 2. COMMERCIAL VIEW
  if (role === 'COMMERCIAL') {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const [
      myPartnersCount,
      toConfirmDeliveries,
      recentVisits
    ] = await Promise.all([
      prisma.partner.count({ where: { OR: [{ assigned_commercial_user_id: userId }, { zone: user?.assigned_zone }] } }),
      prisma.delivery.findMany({
        where: {
          status: 'DELIVERED',
          partner: { OR: [{ assigned_commercial_user_id: userId }, { zone: user?.assigned_zone }] }
        },
        include: { partner: true },
        take: 5
      }),
      prisma.visit.count({ where: { commercial_user_id: userId } })
    ])

    const stats = [
      { title: 'Mes Partenaires', value: myPartnersCount.toString(), icon: Users, color: "text-[#0B1F3A]", bg: "bg-slate-50", border: "border-slate-100" },
      { title: 'À Confirmer', value: toConfirmDeliveries.length.toString(), icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
      { title: 'Visites Effectuées', value: recentVisits.toString(), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    ]

    return (
      <div className="space-y-8 pb-16 lg:pb-0">
        <HeaderTop session={session} />
        <StatsGrid stats={stats} />
        <Card className="border-none shadow-md">
          <CardHeader><CardTitle>Livraisons en attente de confirmation commerciale</CardTitle></CardHeader>
          <CardContent>
            {toConfirmDeliveries.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Aucune livraison à confirmer.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>N° BL</TableHead><TableHead>Partenaire</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {toConfirmDeliveries.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-bold">BL-{d.delivery_number}</TableCell>
                      <TableCell>{d.partner.business_name}</TableCell>
                      <TableCell>{format(new Date(d.delivered_at!), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/deliveries/${d.id}`}>
                          <Button size="sm" variant="outline">Confirmer</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // 3. DELIVERY VIEW
  if (role === 'DELIVERY') {
    const myDeliveries = await prisma.delivery.findMany({
      where: { assigned_delivery_user_id: userId, status: { in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS'] } },
      include: { partner: true },
      orderBy: { target_date: 'asc' }
    })

    const stats = [
      { title: 'Livraisons du Jour', value: myDeliveries.length.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    ]

    return (
      <div className="space-y-8 pb-16 lg:pb-0">
        <HeaderTop session={session} />
        <StatsGrid stats={stats} />
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Ma Tournée</h2>
          <div className="grid gap-4">
            {myDeliveries.length === 0 ? (
              <p className="text-slate-500 italic">Vous n'avez pas de livraison prévue.</p>
            ) : (
              myDeliveries.map(d => (
                <div key={d.id} className="relative">
                  <Card className="hover:shadow-md transition-all border-l-4 border-l-orange-500 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Storefront Photo Thumbnail */}
                        {d.partner.photo_storefront_url && (
                          <div className="w-full sm:w-32 h-32 sm:h-auto relative bg-slate-100 flex-shrink-0">
                            <img
                              src={d.partner.photo_storefront_url}
                              alt="Devanture"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="p-4 flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <Link href={`/dashboard/deliveries/${d.id}`} className="hover:underline flex-1">
                              <p className="font-bold text-lg text-[#0B1F3A]">{d.partner.business_name}</p>
                            </Link>
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700">À LIVRER</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users className="h-4 w-4" />
                              <span>Gérant: {d.partner.manager_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="h-4 w-4" />
                              <span>{d.partner.address_description || 'Pas d\'adresse'}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {d.partner.gps_lat && d.partner.gps_lng && (
                              <Button asChild variant="outline" size="sm" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-50">
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${d.partner.gps_lat},${d.partner.gps_lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <MapPin className="mr-2 h-4 w-4" /> Navigation GPS
                                </a>
                              </Button>
                            )}
                            <Button asChild variant="ghost" size="sm" className="text-slate-500 hover:text-[#0B1F3A]">
                              <Link href={`/dashboard/deliveries/${d.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> Voir détails
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return <div>Role non reconnu.</div>
}

function HeaderTop({ session }: { session: any }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A]">Bonjour, {session?.fullName || 'Collaborateur'} 👋</h1>
      <p className="text-slate-500 mt-2">Voici un aperçu de l'activité pour aujourd'hui.</p>
    </div>
  )
}

function StatsGrid({ stats }: { stats: any[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className={`overflow-hidden border-2 shadow-sm hover:shadow-md transition-all ${stat.bg} ${stat.border}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
            <div className={`rounded-xl p-2 bg-white shadow-sm ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#0B1F3A]">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyAlerts() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-slate-400">
      <CheckCircle2 className="h-8 w-8 mb-2 text-emerald-500 opacity-20" />
      <p className="text-xs italic">Tous les stocks sont optimaux.</p>
    </div>
  )
}

function StockAlert({ alert }: { alert: any }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg bg-orange-50/50 border border-orange-100">
      <div className="h-2 w-2 mt-1.5 rounded-full bg-orange-500 animate-pulse" />
      <div className="flex-1">
        <p className="text-sm font-bold text-orange-900 leading-tight">Rupture imminente : {alert.product.name}</p>
        <p className="text-[10px] text-orange-700 mt-0.5">
          Stock actuel: <span className="font-black">{alert.quantity}</span> {alert.product.container_unit}
          (Seuil: {alert.product.reorder_point})
        </p>
      </div>
    </div>
  )
}
