import { NextRequest, NextResponse } from "next/server";
import { guardarRespuesta } from "@/lib/db";
import { listarVendedoresActivos } from "@/lib/vendedores";
import {
  NO_ESTOY_SEGURO,
  P4_TIEMPO_RESPUESTA,
  P5_PRECISION_TECNICA,
  P6_SEGUIMIENTO,
  P8_TRAMITO_RMA,
  P9_TIEMPO_RESOLUCION,
  P10_CLARIDAD,
  P11_RESOLUCION,
  esOpcionValida,
  type RespuestaAuditoria,
} from "@/lib/auditoria";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(value: unknown, max = 5000): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim().slice(0, max);
  return t || null;
}

function error(mensaje: string) {
  return NextResponse.json({ error: mensaje }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body: Partial<RespuestaAuditoria>;
  try {
    body = await request.json();
  } catch {
    return error("Solicitud inválida.");
  }

  const razonSocial = texto(body.razonSocial, 200);
  if (!razonSocial) return error("Falta la razón social de la empresa o tienda.");

  const email = texto(body.email, 255);
  if (email && !EMAIL_RE.test(email)) return error("El correo electrónico no es válido.");

  const ejecutivo = body.ejecutivo;
  if (
    ejecutivo !== NO_ESTOY_SEGURO &&
    !(await listarVendedoresActivos()).some((v) => v.nombre === ejecutivo)
  ) {
    return error("Seleccione un ejecutivo de ventas válido.");
  }

  if (
    !esOpcionValida(P4_TIEMPO_RESPUESTA, body.p4) ||
    !esOpcionValida(P5_PRECISION_TECNICA, body.p5) ||
    !esOpcionValida(P6_SEGUIMIENTO, body.p6)
  ) {
    return error("Faltan respuestas de la gestión comercial.");
  }

  if (!esOpcionValida(P8_TRAMITO_RMA, body.p8)) {
    return error("Indique si ha tramitado garantías en los últimos 6 meses.");
  }
  const tramitoRma = body.p8 === "si";

  if (
    tramitoRma &&
    (!esOpcionValida(P9_TIEMPO_RESOLUCION, body.p9) ||
      !esOpcionValida(P10_CLARIDAD, body.p10) ||
      !esOpcionValida(P11_RESOLUCION, body.p11))
  ) {
    return error("Faltan respuestas de la auditoría de RMA.");
  }

  try {
    await guardarRespuesta({
      razonSocial,
      email,
      ejecutivo: ejecutivo as string,
      p4: body.p4,
      p5: body.p5,
      p6: body.p6,
      p7: texto(body.p7),
      tramitoRma,
      p9: tramitoRma ? (body.p9 as string) : null,
      p10: tramitoRma ? (body.p10 as string) : null,
      p11: tramitoRma ? (body.p11 as string) : null,
      p12: tramitoRma ? texto(body.p12) : null,
      p13: texto(body.p13),
      ipOrigen: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    });
  } catch (err) {
    console.error("[api/auditoria] no se pudo guardar la respuesta:", err);
    return NextResponse.json(
      { error: "No pudimos registrar su respuesta. Intente de nuevo en unos minutos." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
