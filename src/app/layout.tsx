import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Cotizador de Honorarios",
  description:
    "Cotiza tus honorarios contables en minutos: catálogo de servicios y cotizaciones que suman solas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-grafito text-texto font-sans">
        {children}
      </body>
    </html>
  );
}
