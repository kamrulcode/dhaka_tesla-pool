"use client";
import { useEffect, useState } from "react";
import { Navbar } from "./navbar";
import Link from "next/link";
type Ride = {
  _id: string;
  passengerName: string;
  driverName: string;
  pickup: string;
  dropoff: string;
  seats: number;
  distanceKm?: number;
  discountPercent?: number;
  totalFare?: number;
  completedAt?: string;
};
export function HistoryPage({ role }: { role: "passenger" | "driver" }) {
  const [rides, setRides] = useState<Ride[]>([]);
  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setRides(d.rides || []));
  }, []);
  return (
    <main className="site-shell min-h-screen">
      <Navbar role={role} />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex item-center justify-between">
          <h1 className="text-4xl font-bold">Ride history</h1>
          <Link
            href={role === "driver" ? "/driver" : "/passenger"}
            className="text-slate-500"
          >
            Back
          </Link>
        </div>
        <p className="text-base-content/60 mt-2 text-slate-300">
          Completed rides saved to your account.
        </p>
        {rides.length === 0 ? (
          <div className="glass dashboard-card rounded-3xl p-8 mt-8 text-center text-base-content/60 text-slate-300">
            No completed rides yet.
          </div>
        ) : (
          <div className="overflow-x-auto mt-8">
            <table className="table dashboard-card ">
              <thead>
                <tr>
                  <th className="text-slate-300">Date</th>
                  <th className="text-slate-300">
                    {role === "driver" ? "Passenger" : "Driver"}
                  </th>
                  <th className="text-slate-300">Route</th>
                  <th className="text-slate-300">Seats</th>
                  <th className="text-slate-300">Fare</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((r) => (
                  <tr key={r._id}>
                    <td>
                      {r.completedAt
                        ? new Date(r.completedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {role === "driver" ? r.passengerName : r.driverName}
                    </td>
                    <td>
                      {r.pickup} → {r.dropoff}
                    </td>
                    <td>{r.seats}</td>
                    <td>
                      Tk {r.totalFare ?? "—"}
                      {r.discountPercent != null ? (
                        <span className="block text-xs text-base-content/50">
                          {r.discountPercent}% discount
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
