// Contenido del formulario según "Especificaciones Técnicas - Formulario de
// Auditoría Comercial y RMA". Lo usan tanto el formulario (cliente) como el
// API route (servidor) para validar que cada respuesta sea una opción válida.

// P3: la nómina activa de ejecutivos se lee de la tabla `sellers` del
// dashboard (ver listarVendedoresActivos en lib/db.ts).
export const NO_ESTOY_SEGURO = "No estoy seguro";

export interface Opcion {
  value: string;
  label: string;
}

export const P4_TIEMPO_RESPUESTA: Opcion[] = [
  { value: "inmediato", label: "Inmediato / Menos de 30 min" },
  { value: "1_2_horas", label: "Entre 1 y 2 horas" },
  { value: "medio_dia", label: "Más de medio día" },
  { value: "irregular", label: "Irregular / Debo insistir" },
];

export const P5_PRECISION_TECNICA: Opcion[] = [
  { value: "conoce_especificaciones", label: "Conoce especificaciones y ofrece alternativas" },
  { value: "solo_precios", label: "Solo confirma precios básicos" },
  { value: "fallas_especificaciones", label: "Ha presentado fallas en especificaciones" },
];

export const P6_SEGUIMIENTO: Opcion[] = [
  { value: "excelente", label: "Excelente estatus de entrega" },
  { value: "basico", label: "Básico (solo factura)" },
  { value: "deficiente", label: "Deficiente (no confirma salida)" },
];

export const P8_TRAMITO_RMA: Opcion[] = [
  { value: "si", label: "Sí, he tramitado garantías" },
  { value: "no", label: "No, no me ha tocado tramitar productos por RMA" },
];

export const P9_TIEMPO_RESOLUCION: Opcion[] = [
  { value: "rapido", label: "Rápido y en plazos" },
  { value: "aceptable", label: "Aceptable (inmovilizó inventario)" },
  { value: "lento", label: "Excesivamente lento" },
];

export const P10_CLARIDAD: Opcion[] = [
  { value: "clara", label: "Clara y formal" },
  { value: "confusa", label: "Confusa / Poca claridad" },
  { value: "nula", label: "Nula (presión constante)" },
];

export const P11_RESOLUCION: Opcion[] = [
  { value: "sin_trabas", label: "Reemplazo/NC sin trabas" },
  { value: "con_demoras", label: "Solución aceptable con demoras" },
  { value: "no_satisfactorio", label: "Dictamen no satisfactorio" },
];

export interface RespuestaAuditoria {
  razonSocial: string;
  nombreCargo: string;
  email: string;
  ejecutivo: string;
  p4: string;
  p5: string;
  p6: string;
  p7: string;
  p8: string;
  p9: string;
  p10: string;
  p11: string;
  p12: string;
  p13: string;
}

export function esOpcionValida(opciones: Opcion[], value: unknown): value is string {
  return typeof value === "string" && opciones.some((o) => o.value === value);
}
