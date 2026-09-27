"use client";
import { useEffect, useState } from "react";
import { Navbar } from "./navbar";
import { useToast } from "./toast";
type Ride = {
  _id: string;
  passengerName: string;
  pickup: string;
  dropoff: string;
  seats: number;
  distanceKm: number;
  totalFare: number;
  discountPercent: number;
  status: string;
};
export function DriverDashboard({ name }: { name: string }) {
  const [online, setOnline] = useState(false),
    [requests, setRequests] = useState<Ride[]>([]),
    [active, setActive] = useState<Ride[]>([]);
  const { toast } = useToast();
  async function refresh() {
    const m = await fetch("/api/auth/me", { cache: "no-store" });
    if (m.ok) {
      const md = await m.json();
      setOnline(!!md.user?.online);
    }
    const r = await fetch("/api/rides/status", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setRequests(
        (d.rides || []).filter((x: Ride) => x.status === "REQUESTED"),
      );
      setActive((d.rides || []).filter((x: Ride) => x.status !== "REQUESTED"));
    }
  }
  async function toggle() {
    const next = !online;
    let lat: number | undefined, lon: number | undefined;
    if (next && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
          }),
        );
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch {
        toast(
          "Location permission is recommended so nearby passengers can find you",
          "info",
        );
      }
    }
    const r = await fetch("/api/driver/online", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ online: next, lat, lon }),
    });
    if (r.ok) {
      setOnline(next);
      toast(next ? "You are online" : "You are offline", "success");
    }
  }
  async function action(rideId: string, action: string) {
    const r = await fetch("/api/rides/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId, action }),
    });
    const d = await r.json();
    if (!r.ok) toast(d.error, "error");
    else {
      toast(
        action === "complete" ? "Ride completed" : `Ride ${action} done`,
        "success",
      );
      refresh();
    }
  }
  async function accept(id: string) {
    const r = await fetch("/api/rides/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId: id }),
    });
    const d = await r.json();
    if (!r.ok) toast(d.error, "error");
    else {
      toast("Passenger accepted", "success");
      refresh();
    }
  }
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);
  const btn = (r: Ride) =>
    r.status === "ACCEPTED"
      ? ["pickup", "Pick up"]
      : r.status === "PICKED_UP"
        ? ["start", "Start"]
        : r.status === "STARTED"
          ? ["complete", "Complete"]
          : null;
  return (
    <main className="site-shell min-h-screen">
      <Navbar role="driver" />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <div>
            <p className="text-primary font-medium">Driver dashboard</p>
            <h1 className="text-4xl font-bold mt-2">Hi, {name}</h1>
            <p className="text-base-content/60 text-slate-300">
              Go online to receive passenger requests.
            </p>
          </div>
          <button
            className={`btn ${online ? "btn-success" : "btn-outline"}`}
            onClick={toggle}
          >
            {online ? "● Online" : "○ Offline"}
          </button>
        </div>
        {!online && (
          <div className="alert mt-6">
            You are offline. Passengers will not see your Tesla.
          </div>
        )}
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Passenger requests</h2>
          {online && requests.length === 0 && (
            <p className="text-base-content/60 mt-2  text-slate-500">
              No requests right now.
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {requests.map((r) => (
              <div key={r._id} className="glass dashboard-card rounded-3xl p-5">
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold">{r.passengerName}</h3>
                  <span className="badge ">
                    {r.seats} seat{r.seats > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-base-content/60 mt-2 text-slate-400">
                  {r.pickup} → {r.dropoff}
                </p>
                <div className="mt-3 flex justify-between text-sm">
                  <span>
                    {r.distanceKm} km · {r.discountPercent}% discount
                  </span>
                  <b>Tk {r.totalFare}</b>
                </div>
                <button
                  className="btn btn-primary mt-4 w-full"
                  onClick={() => accept(r._id)}
                >
                  Accept passenger
                </button>
                {/* <button
                  className="btn btn-secondary mt-4 w-full"
                  onClick={() => accept(r._id)}
                >
                  Cancel passenger
                </button> */}
              </div>
            ))}
          </div>
        </section>
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Current rides</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {active.map((r) => (
              <div key={r._id} className="glass dashboard-card rounded-3xl p-5">
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold">{r.passengerName}</h3>
                  <span className="badge badge-primary">{r.status}</span>
                </div>
                <p className="text-base-content/60 mt-2 text-slate-400">
                  {r.seats} seat{r.seats > 1 ? "s" : ""} · {r.pickup} →{" "}
                  {r.dropoff}
                </p>
                <div className="mt-3 flex justify-between text-sm">
                  <span>
                    {r.distanceKm} km · {r.discountPercent}% discount
                  </span>
                  <b>Tk {r.totalFare}</b>
                </div>
                {btn(r) && (
                  <button
                    className="btn btn-primary mt-4 w-full"
                    onClick={() => action(r._id, btn(r)![0])}
                  >
                    {btn(r)![1]}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
