'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Fuel, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [state, action] = useFormState(login, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1F3A] p-4 lg:p-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-[#C9A961]/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-[#C9A961]/5 blur-[120px]" />
      </div>
      
      <Card className="relative w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/[0.07]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-white p-2 shadow-lg shadow-black/20">
              <img src="/logo.png" alt="MRS Logo" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">MRS Lub</CardTitle>
            <CardDescription className="text-slate-400">
              Plateforme de suivi et de gestion des ventes de lubrifiants MRS Bénin
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-4">
              <Label htmlFor="email" className="text-sm font-medium text-slate-200">Email professionnel</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nom@mrs.bj"
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[#C9A961] focus:ring-[#C9A961]"
              />
              {state?.errors && 'email' in state.errors && (
                <p className="text-xs text-red-400">{(state.errors as any).email}</p>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">Mot de passe</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[#C9A961] focus:ring-[#C9A961]"
              />
              {state?.errors && 'password' in state.errors && (
                <p className="text-xs text-red-400">{(state.errors as any).password}</p>
              )}
            </div>
            {state?.errors && '_form' in state.errors && (
              <p className="rounded-lg bg-red-500/10 p-3 text-center text-sm font-medium text-red-400 border border-red-500/20">
                {(state.errors as any)._form}
              </p>
            )}
            <SubmitButton />
          </form>
        </CardContent>

          <div className="text-center text-xs text-slate-500">
            Dévéloppée par KJS 
          </div>
        
          <div className="text-center text-xs text-slate-500">
            © 2026 MRS Bénin — Distribution de lubrifiants
          </div>
        
      </Card>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#C9A961] text-[#0B1F3A] hover:bg-[#B89850] transition-all font-bold"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connexion...
        </>
      ) : (
        'Se connecter'
      )}
    </Button>
  )
}
