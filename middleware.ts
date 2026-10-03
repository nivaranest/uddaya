import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Everything except the landing page, /login, /api/auth and static assets needs a session. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && session.role !== "admin") {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL(session.role === "recruiter" ? "/recruiter" : "/dashboard", req.url));
  }
  if ((pathname.startsWith("/recruiter") || pathname.startsWith("/company") || pathname.startsWith("/api/company")) && session.role === "candidate") {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!$|login|register|api/auth|_next|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
