import { NextResponse } from "next/server";
import { jwtVerify } from "jose";


export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      valid = true;
    } catch {
      valid = false;
    }
  }

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!valid && !isAuthPage) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    if (token) res.cookies.delete("token");
    return res;
  }
  if (valid && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/login", "/signup"],
};
