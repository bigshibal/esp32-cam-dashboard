import { Client } from "pg";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  let client;

  try {
    const body = await req.json();
    const { device_id, temperature, humidity } = body;

    if (!device_id || temperature === undefined || humidity === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    client = new Client({
      connectionString: process.env.NETLIFY_DATABASE_URL
    });

    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        device_id TEXT,
        temperature REAL,
        humidity REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await client.query(
      `INSERT INTO sensor_data (device_id, temperature, humidity)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [device_id, temperature, humidity]
    );

    return new Response(
      JSON.stringify({ success: true, data: result.rows[0] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  } finally {
    if (client) await client.end();
  }
};
