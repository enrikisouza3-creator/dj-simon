import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DJ Simon Telini | Pack de Músicas & Curso de DJ",
  description:
    "Eleve seu nível com o Pack Profissional e o Curso completo de DJ de Simon Telini. Mais de 10.000 alunos transformados. Comece agora.",
  openGraph: {
    title: "DJ Simon Telini — Pack & Curso de DJ",
    description: "A formação definitiva para quem quer dominar as pick-ups.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
