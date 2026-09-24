"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, TriangleAlert } from "lucide-react";
import {
  NO_ESTOY_SEGURO,
  P10_CLARIDAD,
  P11_RESOLUCION,
  P4_TIEMPO_RESPUESTA,
  P5_PRECISION_TECNICA,
  P6_SEGUIMIENTO,
  P8_TRAMITO_RMA,
  P9_TIEMPO_RESOLUCION,
  SEDES,
  type Opcion,
  type RespuestaAuditoria,
  type Vendedor,
} from "@/lib/auditoria";
import { cn } from "@/lib/utils";

type Seccion = 1 | 2 | 3 | 4 | 5;
type Campo = keyof RespuestaAuditoria;

const TITULOS: Record<Seccion, string> = {
  1: "Identificación del cliente",
  2: "Gestión del ejecutivo de ventas",
  3: "Servicio técnico / RMA",
  4: "Su experiencia con garantías y RMA",
  5: "Cierre y aportes operativos",
};

const MIGAS: Record<Seccion, string> = {
  1: "Identificación",
  2: "Ventas",
  3: "Servicio técnico",
  4: "RMA",
  5: "Cierre",
};

const OBLIGATORIOS: Record<Seccion, Campo[]> = {
  1: ["razonSocial", "ejecutivo"],
  2: ["p4", "p5", "p6"],
  3: ["p8"],
  4: ["p9", "p10", "p11"],
  5: [],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VACIO: RespuestaAuditoria = {
  razonSocial: "",
  email: "",
  ejecutivo: "",
  p4: "",
  p5: "",
  p6: "",
  p7: "",
  p8: "",
  p9: "",
  p10: "",
  p11: "",
  p12: "",
  p13: "",
};

export function AuditoriaForm({ ejecutivos }: { ejecutivos: Vendedor[] }) {
  const [r, setR] = useState<RespuestaAuditoria>(VACIO);
  const [seccion, setSeccion] = useState<Seccion>(1);
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);

  // La sección 4 solo existe si respondió que sí tramitó garantías (campo p8).
  const visibles: Seccion[] = r.p8 === "no" ? [1, 2, 3, 5] : [1, 2, 3, 4, 5];
  const posicion = visibles.indexOf(seccion);
  const esUltima = posicion === visibles.length - 1;

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [seccion, enviado]);

  function set(campo: Campo, valor: string) {
    setR((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  function validar(s: Seccion) {
    const nuevos: Partial<Record<Campo, string>> = {};
    for (const campo of OBLIGATORIOS[s]) {
      if (!r[campo].trim()) nuevos[campo] = "Esta pregunta es obligatoria.";
    }
    if (s === 1 && r.email.trim() && !EMAIL_RE.test(r.email.trim())) {
      nuevos.email = "Revise el formato del correo electrónico.";
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function siguiente() {
    if (!validar(seccion)) return;
    setSeccion(visibles[posicion + 1]);
  }

  function atras() {
    setErrores({});
    setSeccion(visibles[posicion - 1]);
  }

  async function enviar() {
    if (!validar(seccion)) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const res = await fetch("/api/auditoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      if (res.ok) {
        setEnviado(true);
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorEnvio(data?.error ?? "No pudimos registrar su respuesta. Intente de nuevo.");
      }
    } catch {
      setErrorEnvio("No hay conexión con el servidor. Revise su internet e intente de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div ref={cardRef} className="pt-stub mt-10 scroll-mt-6">
        <div className="pt-stub__strip" />
        <div className="pt-stub__body pb-8">
          <span className="rf-stub-icon">
            <CheckCircle2 className="h-7 w-7" strokeWidth={2.2} aria-hidden />
          </span>
          <h2
            ref={tituloRef}
            tabIndex={-1}
            className="text-2xl text-[color:var(--portal-ink)] outline-none"
          >
            Respuesta registrada
          </h2>
          <p className="mx-auto mt-3 max-w-[42ch] text-[color:var(--pt-ink-soft)]">
            Agradecemos su tiempo. Su retroalimentación es evaluada directamente por la
            Gerencia de Operaciones para mejorar nuestros procesos de servicio.
          </p>
        </div>
      </div>
    );
  }

  const progreso = ((posicion + 1) / visibles.length) * 100;

  return (
    <div ref={cardRef} className="pt-formcard mt-10 scroll-mt-6">
      <div className="pt-formcard__body">
        <div className="pt-formcard__meta">
          <span className="pt-formcard__stepno">
            Sección {posicion + 1} de {visibles.length}
          </span>
        </div>

        <div className="pt-progress">
          <div
            className="pt-progress__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progreso)}
            aria-label="Progreso del formulario"
          >
            <div className="pt-progress__fill" style={{ width: `${progreso}%` }} />
          </div>
          <div className="pt-progress__crumbs" aria-hidden>
            {visibles.map((s, i) => (
              <span key={s} className="inline-flex items-center">
                {i > 0 && <span className="pt-progress__sep">/</span>}
                <span className={cn(i < posicion && "is-done", i === posicion && "is-now")}>
                  {MIGAS[s]}
                </span>
              </span>
            ))}
          </div>
        </div>

        <h2
          ref={tituloRef}
          tabIndex={-1}
          className="mt-8 text-xl text-[color:var(--portal-ink)] outline-none sm:text-2xl"
        >
          {TITULOS[seccion]}
        </h2>

        <div className="mt-6 grid gap-7">
          {seccion === 1 && (
            <>
              <Pregunta n={1} id="razonSocial" titulo="Razón social de la empresa o tienda" obligatoria error={errores.razonSocial}>
                <input
                  id="razonSocial"
                  className="pt-input"
                  autoComplete="organization"
                  value={r.razonSocial}
                  onChange={(e) => set("razonSocial", e.target.value)}
                  aria-invalid={!!errores.razonSocial}
                />
              </Pregunta>
              <Pregunta
                n={2}
                id="ejecutivo"
                titulo="¿Quién es su ejecutivo de ventas asignado actualmente?"
                obligatoria
                error={errores.ejecutivo}
              >
                <select
                  id="ejecutivo"
                  className="pt-input"
                  value={r.ejecutivo}
                  onChange={(e) => set("ejecutivo", e.target.value)}
                  aria-invalid={!!errores.ejecutivo}
                >
                  <option value="" disabled>
                    Seleccione una opción
                  </option>
                  {SEDES.map(([, sede]) => {
                    const deLaSede = ejecutivos.filter((v) => v.sede === sede);
                    if (deLaSede.length === 0) return null;
                    return (
                      <optgroup key={sede} label={sede}>
                        {deLaSede.map((v) => (
                          <option key={v.nombre} value={v.nombre}>
                            {v.etiqueta}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                  <option value={NO_ESTOY_SEGURO}>{NO_ESTOY_SEGURO}</option>
                </select>
              </Pregunta>
              <Pregunta id="email" titulo="Correo electrónico" opcional error={errores.email}>
                <input
                  id="email"
                  type="email"
                  className="pt-input"
                  autoComplete="email"
                  value={r.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={!!errores.email}
                />
              </Pregunta>
            </>
          )}

          {seccion === 2 && (
            <>
              <OpcionMultiple
                n={3}
                name="p4"
                titulo="Tiempo de respuesta en cotizaciones y consultas de inventario"
                opciones={P4_TIEMPO_RESPUESTA}
                valor={r.p4}
                onChange={(v) => set("p4", v)}
                error={errores.p4}
              />
              <OpcionMultiple
                n={4}
                name="p5"
                titulo="Precisión técnica y asesoría sobre catálogo"
                opciones={P5_PRECISION_TECNICA}
                valor={r.p5}
                onChange={(v) => set("p5", v)}
                error={errores.p5}
              />
              <OpcionMultiple
                n={5}
                name="p6"
                titulo="Seguimiento post-facturación y confirmación de despacho"
                opciones={P6_SEGUIMIENTO}
                valor={r.p6}
                onChange={(v) => set("p6", v)}
                error={errores.p6}
              />
              <Pregunta n={6} id="p7" titulo="Observación puntual o aspecto a corregir" opcional>
                <textarea
                  id="p7"
                  className="pt-textarea"
                  value={r.p7}
                  onChange={(e) => set("p7", e.target.value)}
                />
              </Pregunta>
            </>
          )}

          {seccion === 3 && (
            <OpcionMultiple
              n={7}
              name="p8"
              titulo="¿Ha tramitado garantías o ingresos a RMA en los últimos 6 meses?"
              opciones={P8_TRAMITO_RMA}
              valor={r.p8}
              onChange={(v) => set("p8", v)}
              error={errores.p8}
            />
          )}

          {seccion === 4 && (
            <>
              <OpcionMultiple
                n={8}
                name="p9"
                titulo="Tiempo total de diagnóstico y resolución de la garantía"
                opciones={P9_TIEMPO_RESOLUCION}
                valor={r.p9}
                onChange={(v) => set("p9", v)}
                error={errores.p9}
              />
              <OpcionMultiple
                n={9}
                name="p10"
                titulo="Claridad en la comunicación y justificación técnica del caso"
                opciones={P10_CLARIDAD}
                valor={r.p10}
                onChange={(v) => set("p10", v)}
                error={errores.p10}
              />
              <OpcionMultiple
                n={10}
                name="p11"
                titulo="Resolución final de los casos tramitados"
                opciones={P11_RESOLUCION}
                valor={r.p11}
                onChange={(v) => set("p11", v)}
                error={errores.p11}
              />
              <Pregunta
                n={11}
                id="p12"
                titulo="Comentario o número de caso específico que requiera revisión gerencial"
                opcional
              >
                <textarea
                  id="p12"
                  className="pt-textarea"
                  value={r.p12}
                  onChange={(e) => set("p12", e.target.value)}
                />
              </Pregunta>
            </>
          )}

          {seccion === 5 && (
            <Pregunta
              n={12}
              id="p13"
              titulo="¿Qué cambio o mejora operativa en nuestros procesos comerciales o de despacho facilitaría más el trabajo diario de su tienda?"
              opcional
            >
              <textarea
                id="p13"
                className="pt-textarea"
                value={r.p13}
                onChange={(e) => set("p13", e.target.value)}
              />
            </Pregunta>
          )}
        </div>

        {errorEnvio && (
          <p className="pt-error mt-6" role="alert">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {errorEnvio}
          </p>
        )}

        <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {posicion > 0 && (
            <button type="button" className="pt-ghost" onClick={atras} disabled={enviando}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Atrás
            </button>
          )}
          <div className="sm:ml-auto sm:min-w-[14rem]">
            {esUltima ? (
              <button type="button" className="pt-cta" onClick={enviar} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar formulario"}
              </button>
            ) : (
              <button type="button" className="pt-cta" onClick={siguiente}>
                Siguiente
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PreguntaProps {
  n?: number;
  id: string;
  titulo: string;
  obligatoria?: boolean;
  opcional?: boolean;
  error?: string;
  children: ReactNode;
}

function Pregunta({ n, id, titulo, obligatoria, opcional, error, children }: PreguntaProps) {
  return (
    <div>
      <label className="pt-label text-[0.9rem] leading-snug" htmlFor={id}>
        {n !== undefined && <span className="mr-1.5 text-[color:var(--portal-primary)]">P{n}.</span>}
        {titulo}
        {obligatoria && <span className="text-[#b42318]"> *</span>}
        {opcional && <span className="font-medium text-[color:var(--portal-muted)]"> (opcional)</span>}
      </label>
      {children}
      {error && <ErrorCampo mensaje={error} />}
    </div>
  );
}

interface OpcionMultipleProps {
  n: number;
  name: string;
  titulo: string;
  opciones: Opcion[];
  valor: string;
  onChange: (valor: string) => void;
  error?: string;
}

function OpcionMultiple({ n, name, titulo, opciones, valor, onChange, error }: OpcionMultipleProps) {
  return (
    <fieldset>
      <legend className="pt-label text-[0.9rem] leading-snug">
        <span className="mr-1.5 text-[color:var(--portal-primary)]">P{n}.</span>
        {titulo}
        <span className="text-[#b42318]"> *</span>
      </legend>
      <div className="mt-3 grid gap-2.5">
        {opciones.map((o, i) => {
          const activa = valor === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "pt-choice items-center text-[0.95rem] font-medium",
                activa && "pt-choice--on",
                error && "rf-choice--invalid"
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={activa}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className={cn("rf-letter", activa && "rf-letter--on")} aria-hidden>
                {String.fromCharCode(97 + i)}
              </span>
              {o.label}
            </label>
          );
        })}
      </div>
      {error && <ErrorCampo mensaje={error} />}
    </fieldset>
  );
}

function ErrorCampo({ mensaje }: { mensaje: string }) {
  return (
    <p className="pt-error">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {mensaje}
    </p>
  );
}
