import type { Metadata } from "next";
import "./globals.css";
import "./operations.css";

export const metadata: Metadata = {
  title: "Cocina | AllInstant ALESAR",
  description: "Pedidos activos de cocina por sede",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
