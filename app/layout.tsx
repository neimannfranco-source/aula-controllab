import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aula Controllab",
  description: "Español técnico para el equipo Controllab",
  manifest: "/manifest.json",
  themeColor: "#63CAB7",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aula Controllab",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#63CAB7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aula Controllab" />
      </head>
      <body>{children}</body>
    </html>
  );
}