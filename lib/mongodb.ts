import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);

const clientPromise = global._mongoClientPromise ?? client.connect();

global._mongoClientPromise = clientPromise;

export default clientPromise;

export async function db() {
  const c = await clientPromise;
  return c.db();
}
