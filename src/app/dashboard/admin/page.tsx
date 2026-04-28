import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Award,
  Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  // Aggregate real data
  const [
    caTotal,
    partnerCount,
    deliveryVolume,
    deliveryCount
  ] = await Promise.all([
    prisma.sale.aggregate({ _sum: { total_ttc: true } }),
    prisma.partner.count({ where: { status: 'ACTIVE' } }),
    prisma.deliveryLine.aggregate({ _sum: { quantity_delivered: true } }),
    prisma.delivery.count({ where: { status: 'DELIVERED' } })
  ])

  const stats = [
    { label: "Chiffre d'affaires Global", val: `${((caTotal._sum.total_ttc || 0) / 1000000).toFixed(1)}M`, sub: "Cumulatif Net", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Livraisons Effectuées", val: deliveryCount.toString(), sub: "Bons confirmés", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Partenaires Actifs", val: partnerCount.toString(), sub: "Réseau opérationnel", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Volume Total Livré", val: `${(deliveryVolume._sum.quantity_delivered || 0).toLocaleString()}L`, sub: "Volume cumulé", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#0B1F3A] tracking-tight">Pilotage MRS Bénin</h1>
          <p className="text-slate-500 mt-1">Plateforme de supervision du réseau de distribution.</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="px-4 py-2 border-slate-200">24 Avril 2024</Badge>
            <div className="h-10 w-10 rounded-full bg-[#C9A961] flex items-center justify-center">
                <Target className="h-5 w-5 text-[#0B1F3A]" />
            </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s: any) => (
          <Card key={s.label} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest">{s.label}</CardTitle>
              <div className={`${s.bg} ${s.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                <s.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-[#0B1F3A]">{s.val}</div>
              <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" /> {s.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Products */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b">
                 <div className="flex items-center justify-between">
                     <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                         <Award className="h-4 w-4 text-[#C9A961]" /> Top Performances Produits
                     </CardTitle>
                     <Button variant="ghost" size="sm" className="text-xs font-bold text-[#0B1F3A] underline">Rapport Complet</Button>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                  <div className="divide-y">
                      {[
                        { name: "MRS Super 20W50", vol: "450L", growth: "+20%", price: "15,000 FCFA" },
                        { name: "MRS Diesel HD 40", vol: "320L", growth: "+14%", price: "12,500 FCFA" },
                        { name: "MRS Gear Oil 90", vol: "180L", growth: "-2%", price: "8,500 FCFA" },
                      ].map((p: any, i: number) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-black text-slate-200">0{i+1}</span>
                                <div>
                                    <p className="font-bold text-[#0B1F3A]">{p.name}</p>
                                    <p className="text-xs text-slate-400">{p.price} FCFA</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-sm">{p.vol} L</p>
                                <p className={`text-[10px] font-bold ${p.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{p.growth} %</p>
                            </div>
                        </div>
                      ))}
                  </div>
              </CardContent>
          </Card>

          {/* Performance Commerciaux */}
          <Card className="border-none shadow-sm bg-[#0B1F3A] text-white">
              <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase text-[#C9A961] tracking-wider">Objectifs Commerciaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 {[
                   { name: "Jean Kouassi", perf: 85, color: "bg-[#C9A961]" },
                   { name: "Marcelle Soglo", perf: 62, color: "bg-blue-400" },
                   { name: "Koffi Mensah", perf: 45, color: "bg-red-400" },
                 ].map((c: any) => (
                    <div key={c.name} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase">
                            <span>{c.name}</span>
                            <span>{c.perf}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full ${c.color}`} style={{ width: `${c.perf}%` }} />
                        </div>
                    </div>
                 ))}
                 
                 <div className="pt-6 border-t border-white/10 mt-6">
                    <p className="text-center text-xs text-slate-400">Objectif global mois : <span className="text-white font-bold">120M FCFA</span></p>
                 </div>
              </CardContent>
          </Card>
      </div>
    </div>
  )
}
