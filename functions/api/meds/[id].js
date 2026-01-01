import { requireUser } from "../_auth.js";

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

export async function onRequest({ request, env, params }) {
  const auth = await requireUser(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const userId = auth.userId;
  const medId = params.id;

  if (!env.DB) return json({ error: "Missing D1 binding DB" }, 500);
  if (!medId) return badRequest("Missing med id");

  if (request.method === "PUT") {
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

    // Ownership check in WHERE clause
    const res = await env.DB
      .prepare(
        `UPDATE meds
         SET name = ?, default_dose = ?, default_units = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      )
      .bind(name, defaultDose, defaultUnits, now, medId, userId)
      .run();

    if ((res.meta?.changes ?? 0) === 0) {
      return json({ error: "Not found" }, 404);
    }

    return json({
      med: {
        id: medId,
        name,
        default_dose: defaultDose,
        default_units: defaultUnits,
        updated_at: now
      }
    });
  }

  if (request.method === "DELETE") {
    // Behavior C: delete med, keep dose logs (history uses med_name_snapshot)
    const res = await env.DB
      .prepare(`DELETE FROM meds WHERE id = ? AND user_id = ?`)
      .bind(medId, userId)
      .run();

    if ((res.meta?.changes ?? 0) === 0) {
      return json({ error: "Not found" }, 404);
    }

    return json({ deleted: true });
  }

  return json({ error: "Method not allowed" }, 405);
}
