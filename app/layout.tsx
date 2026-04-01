import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/app/actions/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plim Admin",
  description: "Painel administrativo do Plim",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex">
        {session ? (
          <>
            <Sidebar session={session} />
            <main className="ml-60 flex-1 min-h-screen p-8">{children}</main>
          </>
        ) : (
          <main className="flex-1 min-h-screen">{children}</main>
        )}
      </body>
    </html>
  );
}
