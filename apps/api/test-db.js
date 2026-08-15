const { env } = require('./src/config/env');

async function run() {
  const url = new URL(`/rest/v1/${env.supabaseLecturesTable}?select=*&limit=1`, env.supabaseUrl);
  const response = await fetch(url, {
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    }
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
