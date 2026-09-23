// Cliente JSON-RPC mínimo para Odoo, con los mismos parámetros que usa el
// dashboard (lib/odoo.ts allá): URL, base, uid del usuario de la API y su
// API key. Solo se usa en el servidor.
const ODOO_URL = (process.env.ODOO_URL || "https://supricom2.odoo.com").replace(/\/$/, "");
const ODOO_DB = process.env.ODOO_DB || "";
const ODOO_UID = Number(process.env.ODOO_UID) || 388;
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

export async function odooExecute<T>(
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  if (!ODOO_DB || !ODOO_API_KEY) {
    throw new Error("Faltan ODOO_DB u ODOO_API_KEY en las variables de entorno");
  }

  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [ODOO_DB, ODOO_UID, ODOO_API_KEY, model, method, args, kwargs],
      },
      id: Date.now(),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const data = (await res.json()) as {
    result?: T;
    error?: { message?: string; data?: { message?: string } };
  };
  if (data.error) {
    throw new Error(data.error.data?.message || data.error.message || "Error de Odoo");
  }
  return data.result as T;
}
