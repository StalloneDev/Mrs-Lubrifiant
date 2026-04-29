import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Printer, Search, Filter, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function InvoicesPage() {
    const invoices = await prisma.invoice.findMany({
        include: { partner: true },
        orderBy: { invoice_number: 'desc' }
    })

    const statusConfig = {
        DRAFT: { label: 'Brouillon', class: 'bg-slate-100 text-slate-700', icon: Clock },
        ISSUED: { label: 'Émise', class: 'bg-blue-100 text-blue-700', icon: FileText },
        PAID: { label: 'Payée', class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
        PARTIALLY_PAID: { label: 'Partiel', class: 'bg-orange-100 text-orange-700', icon: Filter },
        CANCELLED: { label: 'Annulée', class: 'bg-red-100 text-red-700', icon: AlertCircle },
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Factures Partenaires</h1>
                    <p className="text-slate-500">Suivi et gestion des facturations de dépôt-vente.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-200">
                        <Printer className="mr-2 h-4 w-4" /> Imprimer la liste
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Facturé</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-[#0B1F3A]">
                            {invoices.reduce((acc, curr) => acc + curr.total_ttc, 0).toLocaleString()} FCFA
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">En attente de paiement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-orange-600">
                            {invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((acc, curr) => acc + curr.total_ttc, 0).toLocaleString()} FCFA
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recouvrements (Mois)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-emerald-600">
                            {invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.total_ttc, 0).toLocaleString()} FCFA
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#0B1F3A]" /> Journal des Factures
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">N° Facture</TableHead>
                                <TableHead>Partenaire</TableHead>
                                <TableHead>Date d'émission</TableHead>
                                <TableHead>Échéance</TableHead>
                                <TableHead className="text-right">Montant TTC</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-400 italic">
                                        Aucune facture générée pour le moment.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((invoice) => {
                                    const config = statusConfig[invoice.status] || statusConfig.DRAFT
                                    return (
                                        <TableRow key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-black text-[#0B1F3A]">
                                                FAC-{invoice.invoice_number.toString().padStart(4, '0')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-sm">{invoice.partner.business_name}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-black">{invoice.partner.code}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {format(new Date(invoice.created_at), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {invoice.total_ttc.toLocaleString()} FCFA
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("flex items-center gap-1 w-fit", config.class)}>
                                                    <config.icon className="h-3 w-3" />
                                                    {config.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/dashboard/invoices/${invoice.id}/print`} target="_blank">
                                                    <Button size="sm" variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50">
                                                        <Printer className="h-4 w-4 mr-2" /> Imprimer
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
