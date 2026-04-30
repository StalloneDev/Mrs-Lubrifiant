import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, MoreVertical, Package, Droplets, Printer } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { ProductDialog } from '@/components/dashboard/ProductDialog'
import { ProductStatusToggle } from '@/components/dashboard/ProductStatusToggle'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { created_at: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalogue Produits</h1>
          <p className="text-slate-500">Gérez vos lubrifiants MRS et leurs prix.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/products/print">
            <Button variant="outline" className="bg-white">
              <Printer className="mr-2 h-4 w-4" /> Exporter PDF
            </Button>
          </Link>
          <ProductDialog />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Rechercher par nom, code, viscosité..." className="pl-10" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filtres
        </Button>
      </div>

      {/* Responsive List: Table for Desktop, Cards for Mobile */}
      <div className="hidden lg:block rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Viscosité</TableHead>
              <TableHead>Format</TableHead>
              <TableHead className="text-right">Prix Achat</TableHead>
              <TableHead className="text-right">Prix Vente</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                  Aucun produit trouvé. Commencez par en ajouter un.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono font-medium">{product.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <Droplets className="h-4 w-4 text-blue-600" />
                      </div>
                      <Link href={`/dashboard/products/${product.id}`} className="font-semibold hover:text-blue-600 hover:underline">
                        {product.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100">{product.viscosity_grade || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{product.container_size} {product.container_unit}</TableCell>
                  <TableCell className="text-right">{product.purchase_price?.toLocaleString()} FCFA</TableCell>
                  <TableCell className="text-right font-bold text-[#0B1F3A]">{product.selling_price_suggested?.toLocaleString()} FCFA</TableCell>
                  <TableCell className="text-center">
                    <Badge className={product.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ProductDialog product={product} />
                        <ProductStatusToggle productId={product.id} currentStatus={product.is_active} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{product.code}</p>
                  </div>
                </div>
                <Badge className={product.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                  {product.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" /> {product.container_size} {product.container_unit}
                </div>
                <Badge variant="outline">{product.viscosity_grade}</Badge>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Prix de vente</p>
                  <p className="text-lg font-bold text-[#0B1F3A]">{product.selling_price_suggested?.toLocaleString()} FCFA</p>
                </div>
                <Link href={`/dashboard/products/${product.id}`}>
                  <Button variant="outline" size="sm">Détails</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="text-center py-12 text-slate-400 italic">
            Aucun produit trouvé.
          </div>
        )}
      </div>
    </div>
  )
}
