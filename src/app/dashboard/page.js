"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import {
  fetchProjects, createProject, updateProject, deleteProject, clearProjectError,
} from "@/store/projectsSlice";

const empty = { title: "", description: "" };

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.projects);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(clearProjectError());
    dispatch(fetchProjects());
  }, [dispatch]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    const action = editingId ? updateProject({ id: editingId, ...form }) : createProject(form);
    const res = await dispatch(action);
    if (res.meta.requestStatus === "fulfilled") {
      setForm(empty);
      setEditingId(null);
    }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setForm({ title: p.title, description: p.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  function onDelete(p) {
    if (confirm(`Delete "${p.title}" and all of its tasks?`)) dispatch(deleteProject(p._id));
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Your projects</h1>

        <form className="panel form-row" onSubmit={onSubmit}>
          <h2>{editingId ? "Edit project" : "New project"}</h2>
          {error && <div className="alert">{error}</div>}
          <label>Title
            <input name="title" value={form.title} onChange={onChange} required placeholder="e.g. Website redesign" />
          </label>
          <label>Description
            <textarea name="description" value={form.description} onChange={onChange} rows={2}
                      placeholder="What is this project about?" />
          </label>
          <div className="actions">
            <button className="btn btn-primary">{editingId ? "Save changes" : "Add project"}</button>
            {editingId && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>

        {loading && <p className="muted">Loading projects…</p>}
        {!loading && items.length === 0 && (
          <p className="empty">No projects yet. Add your first project above.</p>
        )}

        <ul className="list">
          {items.map((p) => (
            <li key={p._id} className="item">
              <div className="item-main">
                <Link href={`/projects/${p._id}`} className="item-title">{p.title}</Link>
                {p.description && <p className="muted">{p.description}</p>}
              </div>
              <div className="actions">
                <Link href={`/projects/${p._id}`} className="btn btn-primary">Open</Link>
                <button className="btn btn-ghost" onClick={() => startEdit(p)}>Edit</button>
                <button className="btn btn-danger" onClick={() => onDelete(p)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
