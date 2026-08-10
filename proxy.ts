import { NextRequest, NextResponse } from "next/server";

// Presence check only (fast, edge-safe). Full signature verification and
// role checks happen server-side in lib/session.ts on each page/action.
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("allvet_session");
  const { pathname } = req.nextUrl;

  if (!hasSession && pathname !== "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (hasSession && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/logout).*)"],
};
