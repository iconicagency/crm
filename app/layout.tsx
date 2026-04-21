import type {Metadata} from 'next';
import './globals.css';
import { Inter } from "next/font/google"; // Use Inter as standard font
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/components/auth-provider';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'CRM Tân Gia Huy',
  description: 'CRM Management System for Tân Gia Huy',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body suppressHydrationWarning className="font-sans antialiased text-slate-900 bg-slate-50">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
