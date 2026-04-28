import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import DeliveryExecution from '@/components/dashboard/DeliveryExecution'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, User, Package, Fuel } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DeliveryDetailPage({ params }: { params: { id: string } }) {
    const cookie = cookies().get('session')?.value
    const session = cookie ? await decrypt(cookie) : null

    const delivery = await prisma.delivery.findUnique({
        where: { id: params.id },
        include: {
            partner: true,
            assigned_delivery_user: true,
            warehouse_source: true,
            lines: {
                include: { product: true }
            }
        }
    })

    if (!delivery) notFound()

    // Logic: If user is DELIVERY and status is ASSIGNED -> Execution mode
    const isLivreur = session?.role === 'DELIVERY'
    const canExecute = delivery.status === 'ASSIGNED' || delivery.status === 'IN_PROGRESS'

    if (isLivreur && canExecute) {
        return (
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <Link href="/dashboard/deliveries">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-xl font-bold">Exécution BL #{delivery.delivery_number}</h1>
                </div>
                <DeliveryExecution delivery={delivery} />
            </div>
        )
    }

    // Otherwise: Classic View mode
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
            <Link href="/dashboard/deliveries" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Retour à la liste
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Bon de Livraison #{delivery.delivery_number}</h1>
                    <p className="text-slate-500 font-medium">Créé le {format(new Date(delivery.created_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/deliveries/${delivery.id}/print`}>
                        <Button variant="outline" className="font-bold border-slate-200">
                            <Printer className="mr-2 h-4 w-4 text-blue-600" /> Imprimer BL
                        </Button>
                    </Link>
                    <Badge className="text-sm py-2 px-4 uppercase font-bold bg-blue-100 text-blue-700 hover:bg-blue-200">
                        Statut : {delivery.status}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 space-y-6">
                    <section className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Partenaire</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#C9A961]/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-[#C9A961]" />
                            </div>
                            <div>
                                <p className="font-bold">{delivery.partner.business_name}</p>
                                <p className="text-xs text-slate-500">{delivery.partner.phone}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Logistique</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span>{delivery.warehouse_source.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>Prévu pour le {format(new Date(delivery.target_date), 'dd MMMM yyyy', { locale: fr })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm border-t pt-3">
                                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                    {delivery.assigned_delivery_user?.full_name?.charAt(0)}
                                </div>
                                <span>Assigné à {delivery.assigned_delivery_user?.full_name}</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="md:col-span-2">
                    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-slate-50/50">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Détail des Produits</h3>
                        </div>
                        <div className="divide-y">
                            {delivery.lines.map((line) => (
                                <div key={line.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{line.product.name}</p>
                                            <p className="text-xs text-slate-500">{line.product.viscosity_grade} • {line.product.code}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-[#0B1F3A]">{line.quantity_planned}</p>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Quantité prévue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
