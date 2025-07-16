export const metadata = {
  title: "Scalping Dashboard",
  description: "Dashboard de señales y análisis técnico con GPT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white font-sans">{children}</body>
    </html>
  );
}
