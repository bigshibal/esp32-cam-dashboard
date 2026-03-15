import { Client } from "pg";

export default async (req) => {

if(req.method !== "POST"){
return new Response("Method not allowed",{status:405});
}

try{

const body = await req.json();

const {device_id,temperature,humidity} = body;

const client = new Client({
connectionString:process.env.NETLIFY_DATABASE_URL
});

await client.connect();

await client.query(
"INSERT INTO sensor_data(device_id,temperature,humidity) VALUES($1,$2,$3)",
[device_id,temperature,humidity]
);

await client.end();

return new Response(JSON.stringify({success:true}));

}catch(e){

return new Response(JSON.stringify({error:e.message}),{status:500});

}

};
