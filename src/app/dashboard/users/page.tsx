import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus, User, Shield, Phone, Mail, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UserDialog } from '@/components/dashboard/UserDialog'
import { UserStatusToggle } from '@/components/dashboard/UserStatusToggle'
import { ResetPasswordDialog } from '@/components/dashboard/ResetPasswordDialog'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { full_name: 'asc' }
  })

  const roleColors = {
    ADMIN: "bg-red-100 text-red-700 hover:bg-red-200",
    MANAGER: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    COMMERCIAL: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    DELIVERY: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs & Droits</h1>
          <p className="text-slate-500">Gérez les accès de votre équipe MRS.</p>
        </div>
        <UserDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Total Utilisateurs</p>
          <p className="text-2xl font-bold text-[#0B1F3A]">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Comptes Actifs</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.is_active).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Désactivés</p>
          <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.is_active).length}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Identité</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold flex items-center gap-2">
                        {user.full_name}
                        {!user.is_active && <Badge variant="destructive" className="text-[8px] h-4">INACTIF</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={roleColors[user.role]}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="h-3 w-3" /> {user.phone || 'Non renseigné'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="h-3 w-3" /> {user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500 italic">
                  {user.last_login_at ? user.last_login_at.toLocaleDateString() : 'Jamais'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <UserDialog user={user} />
                      <ResetPasswordDialog userId={user.id} userName={user.full_name} />
                      <UserStatusToggle userId={user.id} currentStatus={user.is_active} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
