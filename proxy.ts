import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rotas que começam com /admin
  if (pathname.startsWith("/admin")) {
    // Verifica a presença de um cookie de autenticação (ex: 'admin-token')
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      // Redireciona para a Home se não estiver logado
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
