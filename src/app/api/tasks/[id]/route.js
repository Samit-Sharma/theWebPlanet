import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getUserId, unauthorized, notFound, badRequest, pick, serverError } from "@/lib/auth";

async function findOwned(id, userId) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Task.findOne({ _id: id, user: userId });
}

export async function PUT(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    const task = await findOwned(params.id, userId);
    if (!task) return notFound("Task");

    const body = pick(await req.json(), ["title", "description", "status", "dueDate"]);
    if (body.title !== undefined && !String(body.title).trim()) {
      return badRequest("Task title is required");
    }
    if (body.dueDate === "") body.dueDate = null; 
    Object.assign(task, body);
    await task.save(); 
    return NextResponse.json({ task });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    const task = await findOwned(params.id, userId);
    if (!task) return notFound("Task");
    await task.deleteOne();
    return NextResponse.json({ message: "Task deleted", id: params.id });
  } catch (err) {
    return serverError(err);
  }
}
