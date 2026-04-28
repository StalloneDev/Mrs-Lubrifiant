import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Phone, 
  MapPin, 
  User, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Eye, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Camera,
  Coins
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function PartnerDetailPage({ params }: { params: { id: string } }) {
  const partner = await prisma.partner.findUnique({
    where: { id: params.id },
    include: {
      assigned_commercial: true,
      deliveries: { orderBy: { created_at: 'desc' }, take: 10 },
      sales: { orderBy: { sale_date: 'desc' }, take: 10 },
      visits: { orderBy: { visited_at: 'desc' }, take: 10 },
      payments: { orderBy: { created_at: 'desc' }, take: 10 },
      warehouse: { include: { stock_levels: { include: { product: true } } } }
    }
  })

  if (!partner) return <div>Partenaire introuvable</div>

  const totalSales = partner.sales.reduce((acc, s) => acc + (s.total_ttc || 0), 0)
  const commission = totalSales * (partner.commission_rate / 100)

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
           <Link href="/dashboard/partners">
             <Button variant="outline" size="sm">Retour</Button>
           </Link>
           <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">{partner.business_name}</h1>
                <Badge variant={partner.status === 'ACTIVE' ? 'default' : 'secondary'}>{partner.status}</Badge>
              </div>
              <p className="text-slate-500 text-sm">Code: {partner.code} • {partner.partner_type}</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline"><Camera className="mr-2 h-4 w-4" /> Photos</Button>
           <Button className="bg-[#0B1F3A]">Modifier</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-slate-400">Identité & Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                   {partner.photo_manager_url ? (
                     <img src={partner.photo_manager_url} alt="Gérant" className="h-full w-full object-cover" />
                   ) : (
                     <User className="h-full w-full p-3 text-slate-300" />
                   )}
                </div>
                <div>
                   <p className="font-bold text-[#0B1F3A] text-lg">{partner.manager_name}</p>
                   <p className="text-xs text-slate-500 uppercase font-black">Gérant de l'établissement</p>
                </div>
             </div>
             
             <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm">
                   <Phone className="h-4 w-4 text-blue-500" />
                   <span className="font-bold text-[#0B1F3A]">{partner.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                   <MapPin className="h-4 w-4 text-red-500" />
                   <span className="font-medium">{partner.zone || 'Zone non définie'}</span>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border-l-4 border-[#C9A961]">
                   <p className="font-bold uppercase text-[9px] mb-1 opacity-50">Localisation</p>
                   {partner.address_description || 'Aucune description d\'adresse'}
                </div>
             </div>

             <div className="pt-4 space-y-4">
                <div>
                   <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Photo Devanture</p>
                   <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-100 border relative group">
                      {partner.photo_storefront_url ? (
                        <img src={partner.photo_storefront_url} alt="Devanture" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center italic text-slate-400 text-xs">Aucune photo</div>
                      )}
                   </div>
                </div>

                <div className="pt-2">
                   {partner.gps_lat && partner.gps_lng ? (
                     <a 
                       href={`https://www.google.com/maps/search/?api=1&query=${partner.gps_lat},${partner.gps_lng}`}
                       target="_blank"
                       className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                     >
                       <MapPin className="h-3 w-3 text-red-500" /> Voir sur Google Maps
                     </a>
                   ) : (
                     <div className="text-center text-[10px] text-slate-400 italic">GPS non certifié</div>
                   )}
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-none shadow-sm h-fit bg-[#0B1F3A] text-white">
           <CardHeader>
              <CardTitle className="text-sm font-black uppercase text-[#C9A961] tracking-widest">Résumé Financier</CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div>
                 <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Chiffre d'Affaires</p>
                 <h3 className="text-3xl font-black">{totalSales.toLocaleString()} <span className="text-sm">FCFA</span></h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                 <div>
                    <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Taux Comm.</p>
                    <p className="text-xl font-bold text-[#C9A961]">{partner.commission_rate}%</p>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Commissions Due</p>
                    <p className="text-xl font-bold">{commission.toLocaleString()} <span className="text-xs">FCFA</span></p>
                 </div>
              </div>
              <Button className="w-full bg-[#C9A961] text-[#0B1F3A] font-black hover:bg-[#B89850]">
                 <Coins className="mr-2 h-4 w-4" /> Régler Commissions
              </Button>
           </CardContent>
        </Card>

        {/* Consignment Stock */}
        <Card className="border-none shadow-sm h-fit">
           <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-slate-400 flex justify-between items-center">
                 <span>Stock en Consignation</span>
                 <Package className="h-4 w-4" />
              </CardTitle>
           </CardHeader>
           <CardContent>
              <div className="space-y-3">
                 {partner.warehouse?.stock_levels.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4">Aucun stock actuellement.</p>
                 ) : (
                    partner.warehouse?.stock_levels.map(sl => (
                       <div key={sl.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{sl.product.name}</span>
                          <Badge variant="outline" className="font-bold">{sl.quantity} {sl.product.container_unit}</Badge>
                       </div>
                    ))
                 )}
              </div>
              <div className="mt-4 pt-4 border-t">
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Plafond autorisé</span>
                    <span className="text-sm font-bold">{partner.stock_ceiling_amount?.toLocaleString() || 0} FCFA</span>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Tabs / History Section */}
      <div className="grid gap-6 md:grid-cols-2">
         {/* Sales History */}
         <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
               <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-600" /> Historique Ventes
               </CardTitle>
               <Button variant="ghost" size="sm" className="text-xs h-7">Tout voir</Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y text-sm">
                  {partner.sales.slice(0, 5).map(s => (
                     <div key={s.id} className="px-6 py-3 flex justify-between items-center">
                        <div className="space-y-0.5">
                           <p className="font-bold">Facture #{s.sale_number}</p>
                           <p className="text-[10px] text-slate-400 uppercase">{format(new Date(s.sale_date), 'dd MMM yyyy', { locale: fr })}</p>
                        </div>
                        <p className="font-black text-[#0B1F3A]">{s.total_ttc.toLocaleString()} FCFA</p>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Deliveries History */}
         <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
               <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" /> Historique Livraisons
               </CardTitle>
               <Button variant="ghost" size="sm" className="text-xs h-7">Tout voir</Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y text-sm">
                  {partner.deliveries.slice(0, 5).map(d => (
                     <div key={d.id} className="px-6 py-3 flex justify-between items-center">
                        <div className="space-y-0.5">
                           <p className="font-bold">Bon #{d.delivery_number}</p>
                           <p className="text-[10px] text-slate-400 font-medium">Status: {d.status}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{format(new Date(d.target_date), 'dd/MM/yy')}</Badge>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
