'use server'

import { z } from 'zod'
import { createSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
})

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return {
      
      errors: result.error.flatten().fieldErrors,
    }
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return {
      errors: {
        _form: ['Email ou mot de passe incorrect'],
      },
    }
  }

  await createSession({
    userId: user.id,
    role: user.role,
    fullName: user.full_name,
  })

  redirect('/dashboard')
}
