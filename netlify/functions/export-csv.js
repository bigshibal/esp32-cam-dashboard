import { Client } from "pg";

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default async (req) => {
  let client;

  try {
    const url = new URL(req.url);
    const limitParam = parseInt(url.searchParams.get("limit") || "200", 10);
    const limit = Math.min(Math.max(limitParam, 1), 5000);

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

    const header = [
      "id",
      "device_id",
      "temperature",
      "humidity",
      "status",
      "created_at"
    ];

    const lines = [header.join(",")];

    for (const row of result.rows) {
      lines.push([
        escapeCsv(row.id),
        escapeCsv(row.device_id),
        escapeCsv(row.temperature),
        escapeCsv(row.humidity),
        escapeCsv(row.status),
        escapeCsv(row.created_at)
      ].join(","));
    }

    return new Response(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="sensor_audit_log.csv"'
      }
    });
  } catch (e) {
    return new Response(`error\n${e.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } finally {
    if (client) await client.end();
  }
};
