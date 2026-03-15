import { Client } from "pg";

function getStatus(temperature, humidity) {
  if (temperature > 35 || humidity > 85) return "critical";
  if (temperature >= 30 || humidity >= 70) return "warning";
  return "normal";
}

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

    const status = getStatus(Number(temperature), Number(humidity));

    client = new Client({
      connectionString: process.env.NETLIFY_DATABASE_URL
    });

    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE sensor_data
      ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'normal';
    `);

    const result = await client.query(
      `INSERT INTO sensor_data (device_id, temperature, humidity, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [device_id, temperature, humidity, status]
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
