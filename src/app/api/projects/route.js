import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getUserId, unauthorized, badRequest, serverError } from "@/lib/auth";

export async function GET(req) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
    return NextResponse.json({ projects });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    const { title, description } = await req.json();
    if (!title || !title.trim()) return badRequest("Project title is required");
    const project = await Project.create({ user: userId, title, description });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
