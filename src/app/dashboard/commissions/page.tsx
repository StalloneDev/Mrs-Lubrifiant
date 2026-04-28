import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Wallet, Info, FileSpreadsheet, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SettleCommissionButton } from '@/components/dashboard/SettleCommissionButton'
import { ValidateCommissionButton } from '@/components/dashboard/ValidateCommissionButton'

export default async function CommissionsPage() {
    // 1. Global Totals
    const [calculatedStats, validatedStats] = await Promise.all([
        prisma.sale.aggregate({
            _sum: { commission_amount: true },
            where: { is_commission_validated: false, is_commission_paid: false, status: 'VALIDATED' }
        }),
        prisma.sale.aggregate({
            _sum: { commission_amount: true },
            where: { is_commission_validated: true, is_commission_paid: false }
        })
    ])

    // 2. Data by partner
    const allPartners = await prisma.partner.findMany({
        select: { id: true, business_name: true, commission_rate: true }
    })

    const perPartnerData = await Promise.all(allPartners.map(async p => {
        const [calc, valid] = await Promise.all([
            prisma.sale.aggregate({
                _sum: { commission_amount: true },
                where: { partner_id: p.id, is_commission_validated: false, is_commission_paid: false, status: 'VALIDATED' }
            }),
            prisma.sale.aggregate({
                _sum: { commission_amount: true },
                where: { partner_id: p.id, is_commission_validated: true, is_commission_paid: false }
            })
        ])
        return {
            ...p,
            toValidate: calc._sum.commission_amount || 0,
            toSettle: valid._sum.commission_amount || 0
        }
    }))

    const tableData = perPartnerData.filter(d => d.toValidate > 0 || d.toSettle > 0)
        .sort((a, b) => (b.toValidate + b.toSettle) - (a.toValidate + a.toSettle))

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Gestion des Commissions</h1>
                    <p className="text-slate-500">Suivez, validez et réglez les commissions partenaires.</p>
                </div>
                <Button variant="outline" className="text-slate-600">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Exporter le rapport
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-none shadow-sm bg-blue-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">En attente de validation</p>
                                <p className="text-2xl font-black text-[#0B1F3A]">{(calculatedStats._sum.commission_amount || 0).toLocaleString()} FCFA</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-emerald-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Prêt pour paiement</p>
                                <p className="text-2xl font-black text-[#0B1F3A]">{(validatedStats._sum.commission_amount || 0).toLocaleString()} FCFA</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        Suivi par Partenaire
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Partenaire</TableHead>
                                <TableHead>Taux (%)</TableHead>
                                <TableHead className="text-right">À Valider</TableHead>
                                <TableHead className="text-right">À Régler</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">
                                        Aucune commission en attente.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tableData.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-bold text-[#0B1F3A]">{row.business_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{row.commission_rate}%</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-blue-600">
                                            {row.toValidate > 0 ? `${row.toValidate.toLocaleString()} FCFA` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-black text-emerald-600">
                                            {row.toSettle > 0 ? `${row.toSettle.toLocaleString()} FCFA` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {row.toValidate > 0 && <ValidateCommissionButton partnerId={row.id} amount={row.toValidate} />}
                                                {row.toSettle > 0 && <SettleCommissionButton partnerId={row.id} amount={row.toSettle} />}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
