import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Pega o token de sessão do cookie do Supabase
  const token = req.cookies.get('sb-maljtjznorewdntctaub-auth-token')?.value
    || req.cookies.getAll().find(c => c.name.includes('auth-token'))?.value

  const isLoggedIn = !!token

  const { pathname } = req.nextUrl

  const publicPaths = [
    '/membro/login',
    '/membro/esqueci-senha',
    '/membro/nova-senha',
  ]

  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  // Protege rotas privadas
  if (!isLoggedIn && pathname.startsWith('/membro') && !isPublic) {
    return NextResponse.redirect(new URL('/membro/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/membro/:path*'],
}
