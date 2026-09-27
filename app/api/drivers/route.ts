import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/auth";
import { haversineKm } from "@/lib/geo";
export async function GET(req: Request) {
  try {
    await requireSession("passenger");
    const p = new URL(req.url).searchParams;
    const pickup = (p.get("pickup") || "").trim().toLowerCase(),
      seats = Number(p.get("seats") || 1),
      lat = Number(p.get("lat")),
      lon = Number(p.get("lon"));
    if (!pickup || !Number.isInteger(seats) || seats < 1 || seats > 3)
      return NextResponse.json({ drivers: [] });
    const rides = (await db()).collection("rides");
    const booked: any[] = await rides
      .aggregate([
        { $match: { status: { $in: ["ACCEPTED", "PICKED_UP", "STARTED"] } } },
        { $group: { _id: "$driverId", seats: { $sum: "$seats" } } },
      ])
      .toArray();
    const used = new Map<string, number>(
      booked.map((x: any) => [String(x._id), Number(x.seats)]),
    );
    const users: any[] = await (await db())
      .collection("users")
      .find({ role: "driver", online: true })
      .project({ passwordHash: 0 })
      .toArray();
    const drivers = users
      .filter((u: any) => 3 - (used.get(String(u._id)) || 0) >= seats)
      .filter(
        (u: any) =>
          !Number.isFinite(lat) ||
          !Number.isFinite(lon) ||
          !Number.isFinite(Number(u.lat)) ||
          !Number.isFinite(Number(u.lon)) ||
          haversineKm(
            { lat, lon },
            { lat: Number(u.lat), lon: Number(u.lon) },
          ) <= 5,
      )
      .map((u: any) => ({
        id: u._id.toString(),
        name: u.name,
        vehicle: u.vehicle || "own",
        availableSeats: 3 - (used.get(String(u._id)) || 0),
        lat: u.lat,
        lon: u.lon,
      }));
    return NextResponse.json({ drivers });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
