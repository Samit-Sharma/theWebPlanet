import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getUserId, unauthorized, serverError } from "@/lib/auth";

export async function GET(req) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    const user = await User.findById(userId).select("-password");
    if (!user) return unauthorized();
    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    return serverError(err);
  }
}
