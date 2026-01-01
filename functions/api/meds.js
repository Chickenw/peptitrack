import { requireUser } from "./_auth.js";

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function badRequest(msg) {
  return json({ error: msg }, 400);
}

function uid() {
  return (crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}

export async function onRequest({ request, env }) {
  const auth = await requireUser(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const userId = auth.userId;

  if (!env.DB) return json({ error: "Missing D1 binding DB" }, 500);

  if (request.method === "GET") {
    const { results } = await env.DB
      .prepare(
        `SELECT id, name, default_dose, default_units, created_at, updated_at
         FROM meds
         WHERE user_id = ?
         ORDER BY name COLLATE NOCASE ASC`
      )
      .bind(userId)
      .all();

    return json({ meds: results });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON");

    const name = (body.name || "").trim();
    if (!name) return badRequest("name is required");

    const defaultDose =
      body.default_dose === undefined || body.default_dose === null || body.default_dose === ""
        ? null
        : Number(body.default_dose);

    const defaultUnits =
      body.default_units === undefined || body.default_units === null || body.default_units === ""
        ? null
        : String(body.default_units);

    const now = Date.now();
    const id = uid();

    await env.DB
      .prepare(
        `INSERT INTO meds (id, user_id, name, default_dose, default_units, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, userId, name, defaultDose, defaultUnits, now, now)
      .run();

    return json(
      {
        med: {
          id,
          name,
          default_dose: defaultDose,
          default_units: defaultUnits,
          created_at: now,
          updated_at: now
        }
      },
      201
    );
  }

  return json({ error: "Method not allowed" }, 405);
}
