import { Client } from "pg";

export default async () => {
  let client;

  try {
    client = new Client({
      connectionString: process.env.NETLIFY_DATABASE_URL
    });

    await client.connect();

    const result = await client.query(`
      SELECT *
      FROM sensor_data
      ORDER BY created_at DESC
      LIMIT 30;
    `);

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
