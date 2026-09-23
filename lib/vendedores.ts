import { SEDES, type Vendedor } from "@/lib/auditoria";
import { odooExecute } from "@/lib/odoo";

const NOMBRE_SEDE = new Map(SEDES);

// "Nómina activa" = usuario activo en Odoo que factura con regularidad. No se
// usa `sellers.activo` del dashboard: ese campo es el interruptor de reparto
// de leads, y en Valencia estaba apagado para vendedores que siguen activos.
const DIAS = 90;
const MIN_FACTURAS = 10;

// Cuentas que facturan pero no son ejecutivos de ventas (mismo criterio que
// lib/cxc/vendedoresExcluidos.ts del dashboard).
const EXCLUIDOS = ["asistente", "soporte", "hercilio", "yusne", "adriana"];

const CACHE_MS = 60 * 60 * 1000;
let cache: { vendedores: Vendedor[]; hasta: number } | null = null;

// En Odoo los nombres vienen como se cargaron: "DIEGO  GUERRERO",
// "Aaron Jaramillo (v)", "EMILI BRICEÑO." — se ven mal en un formulario público.
function etiquetaVendedor(nombre: string): string {
  return nombre
    .replace(/\s*\(v\)\s*$/i, "")
    .replace(/\.+$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("es")
    .replace(/(^|\s)\p{L}/gu, (letra) => letra.toLocaleUpperCase("es"));
}

interface GrupoFacturas {
  invoice_user_id: [number, string] | false;
  company_id: [number, string] | false;
  __count: number;
}

async function cargarDesdeOdoo(): Promise<Vendedor[]> {
  const companias = SEDES.map(([id]) => id);
  const desde = new Date(Date.now() - DIAS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const context = { allowed_company_ids: companias };

  const grupos = await odooExecute<GrupoFacturas[]>(
    "account.move",
    "read_group",
    [
      [
        ["move_type", "=", "out_invoice"],
        ["state", "=", "posted"],
        ["invoice_date", ">=", desde],
        ["invoice_user_id", "!=", false],
        ["company_id", "in", companias],
      ],
      ["invoice_user_id", "company_id"],
      ["invoice_user_id", "company_id"],
    ],
    { lazy: false, context }
  );

  // Un vendedor puede facturar en más de una compañía: se le asigna la sede
  // donde más factura.
  const porUsuario = new Map<number, { compania: number; facturas: number; total: number }>();
  for (const g of grupos) {
    if (!g.invoice_user_id || !g.company_id) continue;
    const [userId] = g.invoice_user_id;
    const compania = g.company_id[0];
    const actual = porUsuario.get(userId);
    const total = (actual?.total ?? 0) + g.__count;
    if (!actual || g.__count > actual.facturas) {
      porUsuario.set(userId, { compania, facturas: g.__count, total });
    } else {
      actual.total = total;
    }
  }

  const ids = [...porUsuario.entries()]
    .filter(([, v]) => v.total >= MIN_FACTURAS)
    .map(([id]) => id);
  if (ids.length === 0) return [];

  // search_read solo devuelve usuarios activos (los dados de baja quedan fuera).
  const usuarios = await odooExecute<{ id: number; name: string }[]>(
    "res.users",
    "search_read",
    [[["id", "in", ids]]],
    { fields: ["name"], context }
  );

  return usuarios
    .filter((u) => !EXCLUIDOS.some((x) => u.name.toLowerCase().includes(x)))
    .map((u) => ({
      nombre: u.name.trim(),
      etiqueta: etiquetaVendedor(u.name),
      sede: NOMBRE_SEDE.get(porUsuario.get(u.id)!.compania)!,
    }))
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));
}

/**
 * Nómina activa de ejecutivos de ventas para la pregunta P3. Se consulta a
 * Odoo como mucho una vez por hora. Si Odoo no responde se usa la última
 * lista conocida, o una vacía: el formulario sigue funcionando con la opción
 * "No estoy seguro".
 */
export async function listarVendedoresActivos(): Promise<Vendedor[]> {
  if (cache && cache.hasta > Date.now()) return cache.vendedores;
  try {
    const vendedores = await cargarDesdeOdoo();
    cache = { vendedores, hasta: Date.now() + CACHE_MS };
    return vendedores;
  } catch (error) {
    console.error("[vendedores] no se pudo leer la lista desde Odoo:", error);
    return cache?.vendedores ?? [];
  }
}
