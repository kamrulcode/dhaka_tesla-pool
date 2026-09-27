import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { requireSession, oid } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const s = await requireSession("driver");
    const { online, lat, lon } = await req.json();
    const set: any = { online: Boolean(online), updatedAt: new Date() };
    if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) {
      set.lat = Number(lat);
      set.lon = Number(lon);
      set.locationUpdatedAt = new Date();
    }
    await (await db())
      .collection("users")
      .updateOne({ _id: oid(s.id) }, { $set: set });
    return NextResponse.json({
      ok: true,
      online: Boolean(online),
      lat: set.lat,
      lon: set.lon,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
