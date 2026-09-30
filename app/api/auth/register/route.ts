import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/mongodb";
import { createSession } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, phone, vehicle } = body;
    if (
      !name ||
      !email ||
      !password ||
      !role ||
      !["passenger", "driver"].includes(role)
    )
      return NextResponse.json(
        { error: "Please fill all required fields" },
        { status: 400 },
      );
    if (password.length < 6)
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    const database = await db();
    const users = database.collection("users");
    if (await users.findOne({ email: email.toLowerCase() }))
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    const doc = {
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role,
      phone: phone || "",
      vehicle: vehicle || "",
      online: false,
      activeSeats: 0,
      createdAt: new Date(),
    };
    const result = await users.insertOne(doc);
    await createSession({
      id: result.insertedId.toString(),
      role,
      name,
      email: doc.email,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
