import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthed = token ? (await verifySessionToken(token)) !== null : false;

  if (pathname.startsWith("/app") && !isAuthed) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/login") && isAuthed) {
    const url = new URL("/app/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
