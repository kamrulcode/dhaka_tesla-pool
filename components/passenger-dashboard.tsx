"use client";
import { useEffect, useState } from "react";
import { Navbar } from "./navbar";
import { useToast } from "./toast";
import { calculateFare } from "@/lib/fare";
import { RouteMap } from "./route-map";

type Point = { lat: number; lon: number; displayName?: string };
type Driver = {
  id: string;
  name: string;
  vehicle: string;
  availableSeats: number;
  lat?: number;
  lon?: number;
};
type Ride = {
  _id: string;
  driverId: string;
  driverName: string;
  pickup: string;
  dropoff: string;
  seats: number;
  distanceKm: number;
  baseFare: number;
  discountPercent: number;
  farePerSeat: number;
  totalFare: number;
  status: string;
  pickupLat?: number;
  pickupLon?: number;
  dropoffLat?: number;
  dropoffLon?: number;
};
export function PassengerDashboard({ name }: { name: string }) {
  const [pickup, setPickup] = useState(""),
    [dropoff, setDropoff] = useState(""),
    [pickupPoint, setPickupPoint] = useState<Point | null>(null),
    [dropoffPoint, setDropoffPoint] = useState<Point | null>(null),
    [geometry, setGeometry] = useState<any>(null),
    [distanceKm, setDistanceKm] = useState(0),
    [seats, setSeats] = useState(1),
    [drivers, setDrivers] = useState<Driver[]>([]),
    [ride, setRide] = useState<Ride | null>(null),
    [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fare = calculateFare(distanceKm || 1, seats);
  async function geocode(q: string) {
    const r = await fetch(`/api/geo/geocode?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Location not found");
    return d as Point;
  }
  async function calculateRoute() {
    if (!pickup || !dropoff)
      return toast("Enter pickup and destination", "error");
    setLoading(true);
    try {
      const a = await geocode(pickup);
      await new Promise((r) => setTimeout(r, 1100));
      const b = await geocode(dropoff);
      setPickupPoint(a);
      setDropoffPoint(b);
      const r = await fetch(
        `/api/geo/route?fromLat=${a.lat}&fromLon=${a.lon}&toLat=${b.lat}&toLon=${b.lon}`,
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Route unavailable");
      setGeometry(d.geometry);
      setDistanceKm(d.distanceKm);
      const dr = await fetch(
        `/api/drivers?pickup=${encodeURIComponent(pickup)}&seats=${seats}&lat=${a.lat}&lon=${a.lon}`,
        { cache: "no-store" },
      );
      const dd = await dr.json();
      setDrivers(dd.drivers || []);
      if (!dd.drivers?.length)
        toast("No matching online Tesla seats right now", "info");
    } catch (e: any) {
      toast(e.message || "Could not calculate route", "error");
    } finally {
      setLoading(false);
    }
  }
  async function request(driverId: string) {
    if (!pickupPoint || !dropoffPoint) return;
    setLoading(true);
    const r = await fetch("/api/rides/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        driverId,
        pickup,
        dropoff,
        seats,
        distanceKm,
        pickupLat: pickupPoint.lat,
        pickupLon: pickupPoint.lon,
        dropoffLat: dropoffPoint.lat,
        dropoffLon: dropoffPoint.lon,
      }),
    });
    const d = await r.json();
    if (!r.ok) toast(d.error, "error");
    else {
      toast(`Request sent · Tk ${d.fare.totalFare.toFixed(0)}`, "success");
      setDrivers([]);
      poll();
    }
    setLoading(false);
  }
  async function cancel() {
    if (!ride) return;
    const r = await fetch("/api/rides/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId: ride._id }),
    });
    if (r.ok) {
      toast("Ride cancelled", "success");
      setRide(null);
    }
  }
  async function poll() {
    const r = await fetch("/api/rides/status", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setRide(d.rides?.[0] || null);
    }
  }
  useEffect(() => {
    poll();
    const id = setInterval(poll, 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <main className="site-shell min-h-screen">
      <Navbar role="passenger" />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-primary font-medium">Good to see you, {name}</p>
        <h1 className="text-4xl md:text-5xl font-bold mt-2">
          Where are you going?
        </h1>
        <p className="text-base-content/60 mt-2 text-zinc-400">
          Enter your pickup and destination, then click <b>Calculate route</b>.
          No autocomplete is used.
        </p>
        {ride ? (
          <div className="glass dashboard-card rounded-3xl p-6 mt-8">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <span className="badge badge-primary">{ride.status}</span>
                <h2 className="text-2xl font-bold mt-3">{ride.driverName}</h2>
                <p className="text-base-content/60 text-slate-400">
                  {ride.seats} seat{ride.seats > 1 ? "s" : ""} · {ride.pickup} →{" "}
                  {ride.dropoff}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  Tk {ride.totalFare.toFixed(0)}
                </div>
                <div className="text-sm text-base-content/60 text-slate-400">
                  {ride.distanceKm.toFixed(1)} km · {ride.discountPercent}%
                  discount
                </div>
                {["REQUESTED", "ACCEPTED", "PICKED_UP", "STARTED"].includes(
                  ride.status,
                ) && (
                  <button
                    className="btn btn-error btn-outline mt-3"
                    onClick={cancel}
                  >
                    Cancel ride
                  </button>
                )}
              </div>
            </div>
            {ride.pickupLat && ride.dropoffLat && (
              <div className="mt-6">
                <RouteMap
                  pickup={{ lat: ride.pickupLat, lon: ride.pickupLon! }}
                  dropoff={{ lat: ride.dropoffLat, lon: ride.dropoffLon! }}
                />
              </div>
            )}
            <ul className="steps steps-vertical lg:steps-horizontal w-full mt-8">
              <li
                className={`step ${ride.status !== "REQUESTED" ? "step-primary" : ""}`}
              >
                Request
              </li>
              <li
                className={`step ${["ACCEPTED", "PICKED_UP", "STARTED"].includes(ride.status) ? "step-primary" : ""}`}
              >
                Accepted
              </li>
              <li
                className={`step ${["PICKED_UP", "STARTED"].includes(ride.status) ? "step-primary" : ""}`}
              >
                Picked up
              </li>
              <li
                className={`step ${ride.status === "STARTED" ? "step-primary" : ""}`}
              >
                On the way
              </li>
              <li className="step">Complete</li>
            </ul>
          </div>
        ) : (
          <>
            <div className="glass dashboard-card rounded-3xl p-6 mt-8 grid md:grid-cols-[1fr_1fr_130px_auto] gap-3 items-end ">
              <label className="form-control">
                <span className="label-text mb-2">Pickup</span>
                <input
                  className="input input-bordered text-slate-700"
                  placeholder="e.g. Dhanmondi, Dhaka"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                />
              </label>
              <label className="form-control">
                <span className="label-text mb-2">Where to?</span>
                <input
                  className="input input-bordered text-slate-700"
                  placeholder="e.g. Gulshan, Dhaka"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                />
              </label>
              <label className="form-control">
                <span className="label-text mb-2">Seats</span>
                <select
                  className="select select-bordered text-slate-700"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                </select>
              </label>
              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={calculateRoute}
              >
                {loading ? "Calculating..." : "Calculate route"}
              </button>
            </div>
            {distanceKm > 0 && (
              <div className="glass rounded-2xl p-4 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span>
                  Distance: <b>{distanceKm.toFixed(1)} km</b>
                </span>
                <span>
                  Base: <b>Tk {fare.baseFare}</b>
                </span>
                <span>
                  Discount: <b>{fare.discountPercent}%</b>
                </span>
                <span>
                  Per seat: <b>Tk {fare.farePerSeat.toFixed(0)}</b>
                </span>
                <span>
                  Total:{" "}
                  <b className="text-primary">Tk {fare.totalFare.toFixed(0)}</b>
                </span>
              </div>
            )}
            {pickupPoint && dropoffPoint && (
              <div className="mt-4">
                <RouteMap
                  pickup={pickupPoint}
                  dropoff={dropoffPoint}
                  geometry={geometry}
                />
                <p className="text-xs text-base-content/50 mt-1 text-slate-400">
                  © OpenStreetMap contributors · Route uses OSRM when available
                  and a demo fallback otherwise.
                </p>
              </div>
            )}
            {drivers.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl font-bold ">Available Teslas</h2>
                <p className="text-base-content/60 mt-2 text-slate-300">
                  Online drivers within 5 km of your pickup with at least{" "}
                  {seats} empty seat{seats > 1 ? "s" : ""}.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {drivers.map((d) => (
                    <div key={d.id} className="card dashboard-card">
                      <div className="card-body">
                        <div className="flex justify-between">
                          <h3 className="card-title">{d.name}</h3>
                          <span className="badge badge-success">Online</span>
                        </div>
                        <p className="text-base-content/60 text-slate-400">
                          Tesla · {d.availableSeats} seats available
                        </p>
                        <div className="mt-2">
                          <b>Tk {fare.totalFare.toFixed(0)}</b> total ·{" "}
                          {fare.discountPercent}% off
                        </div>
                        <button
                          className="btn btn-primary mt-3"
                          disabled={loading}
                          onClick={() => request(d.id)}
                        >
                          Request {seats} seat{seats > 1 ? "s" : ""}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
