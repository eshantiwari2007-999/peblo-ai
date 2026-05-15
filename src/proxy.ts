import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js 16 uses "proxy.ts" instead of "middleware.ts".
 * Route protection logic: blocks unauthenticated access to /dashboard and /notes.
 * Redirects authenticated users away from /login and /register.
 */
export default async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/notes");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Unauthenticated on a protected route → redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated, trying to access auth pages → redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/login", "/register"],
};
