import { Client } from "pg";

export default async (req) => {
  let client;

  try {
    const url = new URL(req.url);
    const limitParam = parseInt(url.searchParams.get("limit") || "30", 10);
    const limit = Math.min(Math.max(limitParam, 1), 500);

    client = new Client({
      connectionString: process.env.NETLIFY_DATABASE_URL
    });

    await client.connect();

    const result = await client.query(
      `SELECT id, device_id, temperature, humidity, status, created_at
       FROM sensor_data
       ORDER BY created_at DESC
       LIMIT $1;`,
      [limit]
    );

    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } finally {
    if (client) await client.end();
  }
};
