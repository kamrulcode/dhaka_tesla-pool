"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";
export function Navbar({ role }: { role?: "passenger" | "driver" }) {
  const router = useRouter();
  const { toast } = useToast();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Logged out", "success");
    router.push("/");
  }
  return (
    <div className="navbar max-w-6xl mx-auto px-4">
      <div className="flex-1">
        <Link
          href={role === "driver" ? "/driver" : "/passenger"}
          className="text-xl font-extrabold tracking-tight brand-gradient"
        >
          Tesla<span className="text-primary">Pool</span>
        </Link>
      </div>
      <div className="flex gap-2 items-center">
        {role && (
          <Link
            className="btn btn-ghost btn-sm text-white hover:text-black"
            href="/history"
          >
            History
          </Link>
        )}
        {role && (
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
