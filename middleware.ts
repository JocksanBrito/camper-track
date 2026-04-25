import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';
import { supabase } from './lib/supabase';

export const config = {
  matcher: ['/diario/:path*', '/calendario/:path*', '/admin/:path*'],
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabaseClient = supabase; // Usar o cliente já inicializado

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  const publicPaths = ['/login', '/signup', '/'];
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/diario') ||
                            request.nextUrl.pathname.startsWith('/calendario') ||
                            request.nextUrl.pathname.startsWith('/admin');

  if (isProtectedRoute && !session) {
    // Se a rota for protegida e o usuário não estiver logado, redireciona para /login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Atualiza a sessão do usuário
  await supabaseClient.auth.refreshSession();

  return res;
}
