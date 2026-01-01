import { requireUser } from "./_auth.js";

export async function onRequest({ request, env }) {
  const auth = await requireUser(request, env);

  if (!auth.ok) {
    return Response.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  return Response.json({
    userId: auth.userId
  });
}
