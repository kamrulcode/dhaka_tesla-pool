"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./toast";

export function AuthForm({ driver = false }: { driver?: boolean }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicle: "own",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: driver ? "driver" : "passenger",
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast("Registration successful", "success");
      router.push(driver ? "/driver" : "/passenger");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-layout">
      <section className="auth-brand">
        <div className="auth-logo">
          <span className="tesla-mark" />{" "}
          <span className="brand-gradient">TeslaPool</span>
        </div>
        <h1 className="auth-heading">
          Go as a{" "}
          <span className="gradient-text">
            {driver ? "driver" : "passenger"}
          </span>
        </h1>
        <p className="auth-copy">
          {driver
            ? "Share your Tesla seats with people nearby."
            : "Find a Tesla with available seats and share the ride."}
        </p>
      </section>
      <section className="auth-card">
        <div className="relative z-10">
          <span className="badge badge-primary px-4 py-3 rounded-full">
            Create Account
          </span>
          <h2 className="text-4xl font-bold mt-5 tracking-tight">Register</h2>
          <p className="text-base-content/60 mt-2">
            Join TeslaPool and start finding rides today.
          </p>
          <form onSubmit={submit} className="space-y-4 mt-8">
            <input
              className="input input-bordered w-full"
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input input-bordered w-full"
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {!driver && (
              <input
                className="input input-bordered w-full"
                required
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            )}{" "}
            {driver && (
              <select
                className="select select-bordered w-full"
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              >
                <option value="own">Tesla is my own</option>
                <option value="hire">I hired the Tesla</option>
              </select>
            )}
            <input
              className="input input-bordered w-full"
              required
              minLength={6}
              type="password"
              placeholder="Password (6+ characters)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              disabled={loading}
              className="btn btn-primary w-full h-14 rounded-2xl text-base font-bold"
            >
              {loading ? "Creating..." : "Register"} <span>→</span>
            </button>
            <div className="text-center text-sm text-base-content/60">
              Already registered?{" "}
              <Link className="link link-primary" href="/login">
                Sign in
              </Link>
            </div>
            <div className="flex items-center gap-4 py-1 text-xs text-base-content/50">
              <span className="h-px flex-1 bg-white/10" />
              OR
              <span className="h-px flex-1 bg-white/10" />
            </div>
            {!driver && (
              <Link
                href="/register/driver"
                className="btn btn-outline w-full h-12 rounded-2xl"
              >
                🚗 <span>Want to go as a driver?</span> <span>→</span>
              </Link>
            )}
            {driver && (
              <Link
                href="/register"
                className="btn btn-outline w-full h-12 rounded-2xl"
              >
                Go as a passenger →
              </Link>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
