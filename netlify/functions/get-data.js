import { Client } from "pg";

export default async () => {

const client = new Client({
connectionString:process.env.NETLIFY_DATABASE_URL
});

await client.connect();

const result = await client.query(
"SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 10"
);

await client.end();

return new Response(JSON.stringify(result.rows),{
headers:{ "Content-Type":"application/json" }
});

};
