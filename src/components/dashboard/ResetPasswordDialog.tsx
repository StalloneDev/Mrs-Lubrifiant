"use client"

import { useState } from "react"
import { resetUserPassword } from "@/app/dashboard/users/actions"
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
import { KeyRound } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface ResetPasswordDialogProps {
    userId: string
    userName: string
}

export function ResetPasswordDialog({ userId, userName }: ResetPasswordDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState("")

    async function handleReset() {
        if (!password || password.length < 6) {
            alert("Le mot de passe doit faire au moins 6 caractères")
            return
        }

        setLoading(true)
        try {
            const res = await resetUserPassword(userId, password)
            if ('success' in res && res.success) {
                alert(`Le mot de passe de ${userName} a été réinitialisé avec succès.`)
                setOpen(false)
                setPassword("")
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
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600" onClick={(e) => e.stopPropagation()}>
                    <KeyRound className="mr-2 h-4 w-4" /> Réinitialiser le mot de passe
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <p className="text-sm text-slate-500">
                        Définissez un nouveau mot de passe provisoire pour <strong>{userName}</strong>.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="new_password">Nouveau mot de passe</Label>
                        <Input
                            id="new_password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 caractères"
                            required
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            onClick={handleReset}
                            disabled={loading || password.length < 6}
                            className="w-full bg-[#0B1F3A]"
                        >
                            {loading ? "Réinitialisation..." : "Changer le mot de passe"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
