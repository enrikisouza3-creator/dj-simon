import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Se não tem sessão e está tentando acessar área de membro, redireciona pro login
  if (!session && req.nextUrl.pathname.startsWith('/membro') && !req.nextUrl.pathname.startsWith('/membro/login')) {
    return NextResponse.redirect(new URL('/membro/login', req.url))
  }

  // Se já tem sessão e tenta acessar o login, redireciona pro dashboard
  if (session && req.nextUrl.pathname === '/membro/login') {
    return NextResponse.redirect(new URL('/membro/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/membro/:path*'],
}
