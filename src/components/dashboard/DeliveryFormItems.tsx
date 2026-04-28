'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Package } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

export default function DeliveryFormItems({ products }: { products: any[] }) {
  const [items, setItems] = useState([{ id: Date.now(), product_id: '', quantity: '' }])

  const addLine = () => {
    setItems([...items, { id: Date.now(), product_id: '', quantity: '' }])
  }

  const removeLine = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Produits à livrer</h3>
        <Button type="button" variant="outline" size="sm" onClick={addLine}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une ligne
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border bg-slate-50/50">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Produit {index + 1}</Label>
              <Select name="product_id" required>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Sélectionner un lubrifiant" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - {p.viscosity_grade} ({p.container_size}{p.container_unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32 space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Quantité (Bidons)</Label>
              <Input 
                name="quantity_planned" 
                type="number" 
                placeholder="0" 
                required 
                min="0.1" 
                step="any"
                className="bg-white"
              />
            </div>
            <div className="flex items-end justify-end pb-0.5">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-red-500"
                onClick={() => removeLine(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
