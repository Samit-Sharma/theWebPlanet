"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login, signup, clearAuthError } from "@/store/authSlice";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    const action = isSignup ? signup(form) : login({ email: form.email, password: form.password });
    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">
          {isSignup ? "Start organising your projects and tasks." : "Log in to see your projects."}
        </p>

        {error && <div className="alert">{error}</div>}

        {isSignup && (
          <label>Name
            <input name="name" value={form.name} onChange={onChange} required autoComplete="name" />
          </label>
        )}
        <label>Email
          <input name="email" type="email" value={form.email} onChange={onChange} required autoComplete="email" />
        </label>
        <label>Password
          <input name="password" type="password" value={form.password} onChange={onChange}
                 required minLength={6} autoComplete={isSignup ? "new-password" : "current-password"} />
        </label>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </button>

        <p className="muted center">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link>
        </p>
      </form>
    </main>
  );
}
