import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie, badRequest, serverError } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) return badRequest("Name, email and password are required");
    if (!/^\S+@\S+\.\S+$/.test(email)) return badRequest("Enter a valid email address");
    if (password.length < 6) return badRequest("Password must be at least 6 characters");

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return badRequest("An account with this email already exists");

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken(user._id.toString());

    const res = NextResponse.json(
      { user: { id: user._id, name: user.name, email: user.email }, token },
      { status: 201 }
    );
    return setAuthCookie(res, token);
  } catch (err) {
    return serverError(err);
  }
}
