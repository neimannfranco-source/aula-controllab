import "./globals.css";

export const metadata = {
  title: "Aula Controllab",
  description: "Prueba mínima",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}