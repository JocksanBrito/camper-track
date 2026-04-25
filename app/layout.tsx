import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Camper Track - O Painel do Seu Acampamento",
  description: "Gerencie seu acampamento com estilo Game UI (Mario Kart inspired).",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Camper Track",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <Toaster 
            theme="dark" 
            toastOptions={{ 
              style: { 
                background: '#18181b', 
                border: '4px solid black',
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                fontFamily: 'var(--font-outfit)',
                fontWeight: 'bold',
                color: '#fff'
              } 
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}
