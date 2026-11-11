import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function getUserId(req) {
  const header = req.headers.get("authorization");
  const token = header && header.startsWith("Bearer ")
    ? header.slice(7)
    : req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET).id;
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export const unauthorized = () =>
  NextResponse.json({ message: "Unauthorized" }, { status: 401 });

export const notFound = (what = "Resource") =>
  NextResponse.json({ message: `${what} not found` }, { status: 404 });

export const badRequest = (message) =>
  NextResponse.json({ message }, { status: 400 });

export function serverError(err) {
  console.error(err);
  if (err && err.name === "ValidationError") {
    const msg = Object.values(err.errors).map((e) => e.message).join(", ");
    return NextResponse.json({ message: msg }, { status: 400 });
  }
  return NextResponse.json({ message: "Server error" }, { status: 500 });
}

export function pick(obj, keys) {
  const out = {};
  keys.forEach((k) => {
    if (obj && obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
}
