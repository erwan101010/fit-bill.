import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes publiques
  const publicRoutes = ['/', '/auth/login'];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  // Si pas de session et route protégée, rediriger vers login (exclure explicitement la page de login)
  if (!session && !isPublicRoute && req.nextUrl.pathname !== '/auth/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Si session existe, vérifier le rôle et rediriger si nécessaire
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, user_type')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role || profile?.user_type;
    const pathname = req.nextUrl.pathname;

    // Redirection selon le rôle
    if (userRole === 'coach' && pathname.startsWith('/client') && pathname !== '/client/chat') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (userRole === 'client' && pathname.startsWith('/dashboard') && pathname !== '/dashboard/chat') {
      return NextResponse.redirect(new URL('/client', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

