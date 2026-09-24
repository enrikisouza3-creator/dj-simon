import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// A sessão do Supabase (via @supabase/supabase-js) fica no localStorage do
// navegador, não em cookie -- então não dá pra checar login aqui no servidor
// de forma confiável sem migrar para @supabase/ssr.
// A proteção de /membro/* já é feita no client por withMemberAuth.tsx
// (MemberAuthProvider), então aqui só deixamos passar.
export async function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/membro/:path*'],
}
