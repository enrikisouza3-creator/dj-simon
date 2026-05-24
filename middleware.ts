import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicPaths = ['/membro/login', '/membro/esqueci-senha', '/membro/nova-senha']
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  // Verifica qualquer cookie de sessão do Supabase
  const hasCookie = req.cookies.getAll().some(c => c.name.includes('supabase') || c.name.includes('sb-'))

  if (!hasCookie && pathname.startsWith('/membro') && !isPublic) {
    return NextResponse.redirect(new URL('/membro/login', req.url))
  }

  // Se tem cookie e está no login, manda pro dashboard
  if (hasCookie && pathname === '/membro/login') {
    return NextResponse.redirect(new URL('/membro/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/membro/:path*'],
}
