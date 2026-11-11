"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, logout } from "@/store/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) dispatch(fetchMe());
  }, [user, dispatch]);

  async function handleLogout() {
    await dispatch(logout());
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="nav">
      <Link href="/dashboard" className="brand">Mini Project Manager</Link>
      <div className="nav-right">
        {user && <span className="muted">{user.name}</span>}
        <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
}
