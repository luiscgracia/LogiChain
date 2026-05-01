import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DigiFormas - Certificados de Habilitación",
  description: "Sistema de gestión de certificados de habilitación para terminales PRIMAX",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}