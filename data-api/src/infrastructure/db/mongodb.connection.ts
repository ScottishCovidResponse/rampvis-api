import { MongoClient } from "mongodb";

export type DbClient = MongoClient;

export async function getDatabaseClient(url: string) {
  const client = new MongoClient(url);
  return await client.connect();
}
