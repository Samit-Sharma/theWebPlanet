import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie, badRequest, serverError } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!email || !password) return badRequest("Email and password are required");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Incorrect email or password" }, { status: 401 });
    }

    const token = signToken(user._id.toString());
    const res = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
    return setAuthCookie(res, token);
  } catch (err) {
    return serverError(err);
  }
}
