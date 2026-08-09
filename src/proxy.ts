import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/login", "/register", "/"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "?"))) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access
  if (pathname.startsWith("/professor") && session.user.role !== "PROFESSOR" && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/courses") || pathname.startsWith("/assessment")) &&
    (session.user.role === "PROFESSOR" || session.user.role === "ADMIN")
  ) {
    const dest = session.user.role === "ADMIN" ? "/admin" : "/professor/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|gif|ico|webp)).*)" ],
};
