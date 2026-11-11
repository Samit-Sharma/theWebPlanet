"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import { fetchProject } from "@/store/projectsSlice";
import {
  fetchTasks, createTask, updateTask, deleteTask, clearTasks, clearTaskError,
} from "@/store/tasksSlice";

const STATUSES = ["todo", "in-progress", "done"];
const LABEL = { todo: "To do", "in-progress": "In progress", done: "Done" };
const empty = { title: "", description: "", status: "todo", dueDate: "" };

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "No due date");
const isOverdue = (t) => t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date(new Date().toDateString());

export default function ProjectPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: project, error: projectError } = useSelector((s) => s.projects);
  const { items: tasks, loading, error } = useSelector((s) => s.tasks);

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [order, setOrder] = useState("asc");

  useEffect(() => {
    dispatch(fetchProject(id));
    return () => { dispatch(clearTasks()); };
  }, [id, dispatch]);

  
  useEffect(() => {
    dispatch(fetchTasks({ projectId: id, status, sortBy, order }));
  }, [id, status, sortBy, order, dispatch]);

  const reload = () => dispatch(fetchTasks({ projectId: id, status, sortBy, order }));
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    dispatch(clearTaskError());
    const action = editingId
      ? updateTask({ id: editingId, ...form })
      : createTask({ projectId: id, ...form });
    const res = await dispatch(action);
    if (res.meta.requestStatus === "fulfilled") {
      setForm(empty);
      setEditingId(null);
      reload(); 
    }
  }

  function startEdit(t) {
    setEditingId(t._id);
    setForm({
      title: t.title,
      description: t.description || "",
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function changeStatus(t, newStatus) {
    const res = await dispatch(updateTask({ id: t._id, status: newStatus }));
    if (res.meta.requestStatus === "fulfilled") reload();
  }

  function onDelete(t) {
    if (confirm(`Delete task "${t.title}"?`)) dispatch(deleteTask(t._id));
  }

  if (projectError && !project) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="alert">{projectError}</div>
          <Link href="/dashboard" className="btn btn-ghost">Back to projects</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <Link href="/dashboard" className="muted back">← All projects</Link>
        <h1>{project ? project.title : "Loading…"}</h1>
        {project?.description && <p className="muted lead">{project.description}</p>}

        <form className="panel form-row" onSubmit={onSubmit}>
          <h2>{editingId ? "Edit task" : "New task"}</h2>
          {error && <div className="alert">{error}</div>}
          <label>Title
            <input name="title" value={form.title} onChange={onChange} required placeholder="e.g. Draft homepage wireframe" />
          </label>
          <label>Description
            <textarea name="description" value={form.description} onChange={onChange} rows={2} />
          </label>
          <div className="grid-2">
            <label>Status
              <select name="status" value={form.status} onChange={onChange}>
                {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
              </select>
            </label>
            <label>Due date
              <input name="dueDate" type="date" value={form.dueDate} onChange={onChange} />
            </label>
          </div>
          <div className="actions">
            <button className="btn btn-primary">{editingId ? "Save changes" : "Add task"}</button>
            {editingId && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>

        <div className="toolbar">
          <label>Show
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All tasks</option>
              {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
            </select>
          </label>
          <label>Sort by
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dueDate">Due date</option>
              <option value="status">Status</option>
              <option value="createdAt">Date created</option>
            </select>
          </label>
          <label>Order
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        {loading && <p className="muted">Loading tasks…</p>}
        {!loading && tasks.length === 0 && (
          <p className="empty">{status === "all" ? "No tasks yet. Add one above." : `No ${LABEL[status].toLowerCase()} tasks.`}</p>
        )}

        <ul className="list">
          {tasks.map((t) => (
            <li key={t._id} className="item">
              <div className="item-main">
                <span className={`item-title ${t.status === "done" ? "struck" : ""}`}>{t.title}</span>
                {t.description && <p className="muted">{t.description}</p>}
                <p className={`due ${isOverdue(t) ? "overdue" : ""}`}>
                  {isOverdue(t) ? "Overdue · " : ""}{fmt(t.dueDate)}
                </p>
              </div>
              <div className="actions">
                <select className={`badge ${t.status}`} value={t.status} onChange={(e) => changeStatus(t, e.target.value)} aria-label="Change status">
                  {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={() => startEdit(t)}>Edit</button>
                <button className="btn btn-danger" onClick={() => onDelete(t)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
