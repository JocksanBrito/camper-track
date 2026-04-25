import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './lib/supabase';

export const config = {
  matcher: ['/diario/:path*', '/calendario/:path*', '/admin/:path*'],
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Obter o usuário diretamente do cliente Supabase inicializado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicPaths = ['/login', '/signup', '/'];
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/diario') ||
                            request.nextUrl.pathname.startsWith('/calendario') ||
                            request.nextUrl.pathname.startsWith('/admin');

  if (isProtectedRoute && !user) {
    // Se a rota for protegida e o usuário não estiver logado, redireciona para /login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (publicPaths.includes(request.nextUrl.pathname) && user) {
    // Se o usuário estiver logado e tentar acessar uma rota pública, redireciona para a home
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Atualiza a sessão do usuário e repassa os cookies
  await supabase.auth.refreshSession();

  return res;
}
