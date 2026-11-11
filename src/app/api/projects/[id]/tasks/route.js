import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { getUserId, unauthorized, notFound, badRequest, pick, serverError } from "@/lib/auth";

const STATUS_ORDER = { todo: 0, "in-progress": 1, done: 2 };

// GET /api/projects/:id/tasks?status=todo&sortBy=dueDate|status|createdAt&order=asc|desc
export async function GET(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    if (!mongoose.isValidObjectId(params.id)) return notFound("Project");
    const project = await Project.findOne({ _id: params.id, user: userId });
    if (!project) return notFound("Project");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const dir = searchParams.get("order") === "desc" ? -1 : 1;

    const filter = { project: project._id, user: userId };
    if (status && status !== "all") {
      if (!STATUS_ORDER.hasOwnProperty(status)) return badRequest("Invalid status filter");
      filter.status = status;
    }

    const tasks = await Task.find(filter).lean();

    tasks.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (new Date(a.dueDate) - new Date(b.dueDate)) * dir;
      }
      if (sortBy === "status") return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * dir;
      return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
    });

    return NextResponse.json({ tasks });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();
    await connectDB();
    if (!mongoose.isValidObjectId(params.id)) return notFound("Project");
    const project = await Project.findOne({ _id: params.id, user: userId });
    if (!project) return notFound("Project");

    const body = pick(await req.json(), ["title", "description", "status", "dueDate"]);
    if (!body.title || !String(body.title).trim()) return badRequest("Task title is required");
    if (!body.dueDate) delete body.dueDate;

    const task = await Task.create({ ...body, project: project._id, user: userId });
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
