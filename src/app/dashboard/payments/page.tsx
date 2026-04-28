import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Wallet, Plus, Search, Filter, CheckCircle2, QrCode, Printer } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PaymentDialog } from '@/components/dashboard/PaymentDialog'
import Link from 'next/link'

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { created_at: 'desc' },
    include: { partner: true },
    take: 50
  })

  const channelColors = {
    CASH: "bg-green-100 text-green-700",
    MOBILE_MONEY_MTN: "bg-yellow-100 text-yellow-800",
    MOBILE_MONEY_MOOV: "bg-blue-100 text-blue-800",
    BANK: "bg-slate-100 text-slate-800",
    CHECK: "bg-purple-100 text-purple-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A]">Encaissements & Paiements</h1>
          <p className="text-slate-500">Suivez les règlements effectués par vos partenaires.</p>
        </div>
        <PaymentDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Recouvré</p>
                <p className="text-xl font-black text-[#0B1F3A]">
                  {payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nb. Transactions</p>
                <p className="text-xl font-black text-[#0B1F3A]">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Rechercher par référence ou partenaire..." className="pl-10 h-11" />
        </div>
        <Button variant="outline" className="h-11">
          <Filter className="mr-2 h-4 w-4" /> Filtres
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Référence / Date</TableHead>
              <TableHead>Partenaire</TableHead>
              <TableHead>Méthode</TableHead>
              <TableHead>Référence Externe</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                  Aucun paiement enregistré.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-bold">#PAY-{p.payment_number}</p>
                    <p className="text-[10px] text-slate-500">{format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  </TableCell>
                  <TableCell className="font-medium text-[#0B1F3A]">
                    {p.partner.business_name}
                  </TableCell>
                  <TableCell>
                    <Badge className={channelColors[p.channel as keyof typeof channelColors]}>{p.channel}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {p.external_reference || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <p className="font-black text-[#0B1F3A]">{p.amount.toLocaleString()} FCFA</p>
                      {p.proof_url && (
                        <a href={p.proof_url} target="_blank" className="flex items-center gap-1 text-[9px] text-blue-600 font-bold uppercase hover:underline mt-1">
                          <QrCode className="h-3 w-3" /> Voir preuve
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/payments/${p.id}/print`}>
                      <Button variant="ghost" size="icon" title="Imprimer le reçu">
                        <Printer className="h-4 w-4 text-slate-500" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
