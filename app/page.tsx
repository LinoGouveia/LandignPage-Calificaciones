import { Clock, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuditoriaForm } from "@/components/auditoria-form";
import { listarVendedoresActivos } from "@/lib/db";

// La nómina de vendedores se lee en cada visita: si se hiciera en el build,
// quedaría congelada (o vacía, si la base no estaba disponible al compilar).
export const dynamic = "force-dynamic";

export default async function Home() {
  const ejecutivos = await listarVendedoresActivos();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="relative isolate">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[260px] opacity-[0.13] [mask-image:linear-gradient(to_bottom,#000_0%,transparent_100%)]"
            style={{
              backgroundImage:
                "url(https://supricom.com.ve/wp-content/uploads/2025/06/fondo-de-papel-tapiz-colorido-borroso-vivo-scaled.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="pt-shell pt-shell--narrow">
            <section>
              <span className="pt-eyebrow">Encuesta a clientes</span>
              <h1 className="pt-h1">Auditoría de Eficiencia Operativa y Comercial</h1>
              <p className="pt-sub">
                Estimado cliente: este sondeo de 2 minutos tiene como fin medir y optimizar
                nuestros tiempos de respuesta comercial y soporte postventa para garantizar la
                rotación fluida de su negocio.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[color:var(--portal-muted)]">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[color:var(--portal-primary)]" aria-hidden />
                  2 minutos
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[color:var(--portal-primary)]" aria-hidden />
                  Sin inicio de sesión
                </span>
              </div>
            </section>

            <AuditoriaForm ejecutivos={ejecutivos} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
