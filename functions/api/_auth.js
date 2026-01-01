import { verifyToken } from "@clerk/backend";

function getBearerToken(request) {
  const auth = request.headers.get("Authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export async function requireUser(request, env) {
  const token = getBearerToken(request);

  if (!token) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }

  try {
    const verified = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      authorizedParties: env.AUTHORIZED_PARTY
        ? [env.AUTHORIZED_PARTY]
        : undefined,
    });

    return {
      ok: true,
      userId: verified.sub,
    };
  } catch (err) {
    return { ok: false, status: 401, error: "Invalid or expired token" };
  }
}
