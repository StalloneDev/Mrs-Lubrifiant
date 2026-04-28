"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"
import { createUser, updateUser } from "@/app/dashboard/users/actions"

interface UserDialogProps {
  user?: {
    id: string
    full_name: string
    email: string
    role: string
    phone?: string | null
  }
}

export function UserDialog({ user }: UserDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      const res = isEdit
        ? await updateUser(formData)
        : await createUser(formData)

      if ('success' in res && res.success) {
        setOpen(false)
        router.refresh()
      } else {
        alert('error' in res ? res.error : "Une erreur est survenue")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600">
            <Pencil className="mr-2 h-4 w-4" /> Modifier le profil
          </Button>
        ) : (
          <Button className="bg-[#0B1F3A] hover:bg-[#1a3a63]">
            <Plus className="mr-2 h-4 w-4" /> Ajouter un membre
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le profil" : "Ajouter un membre à l'équipe"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {isEdit && <input type="hidden" name="id" value={user.id} />}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom Complet</Label>
            <Input id="full_name" name="full_name" defaultValue={user?.full_name} placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <Input id="email" name="email" type="email" defaultValue={user?.email} placeholder="j.doe@mrs.bj" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select name="role" defaultValue={user?.role || "COMMERCIAL"}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  <SelectItem value="DELIVERY">Livreur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" defaultValue={user?.phone || ""} placeholder="+229..." />
            </div>
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe provisoire</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-[#0B1F3A]">
              {loading ? (isEdit ? "Mise à jour..." : "Création...") : (isEdit ? "Enregistrer les modifications" : "Enregistrer l'utilisateur")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
