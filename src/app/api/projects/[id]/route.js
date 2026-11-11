import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { getUserId, unauthorized, notFound, badRequest, pick, serverError } from "@/lib/auth";

async function findOwned(id, userId) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Project.findOne({ _id: id, user: userId });
}

export async function GET(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    const project = await findOwned(params.id, userId);
    if (!project) return notFound("Project");
    return NextResponse.json({ project });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    const project = await findOwned(params.id, userId);
    if (!project) return notFound("Project");

    const body = pick(await req.json(), ["title", "description"]);
    if (body.title !== undefined && !String(body.title).trim()) {
      return badRequest("Project title is required");
    }
    Object.assign(project, body);
    await project.save();
    return NextResponse.json({ project });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    const project = await findOwned(params.id, userId);
    if (!project) return notFound("Project");
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    return NextResponse.json({ message: "Project deleted", id: params.id });
  } catch (err) {
    return serverError(err);
  }
}
