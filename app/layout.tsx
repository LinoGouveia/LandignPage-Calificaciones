import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Auditoría de Eficiencia Operativa y Comercial | Supricom",
  description:
    "Sondeo de 2 minutos para medir nuestros tiempos de respuesta comercial y soporte postventa (RMA).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${manrope.variable} portal-supricom pt-page antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
