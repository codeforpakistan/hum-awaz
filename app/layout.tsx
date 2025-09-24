import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/language-provider';
import AuthProvider from '@/lib/auth-context';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryClientProvider } from '@/components/react-query-provider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hum Awaz | Digital Democracy Platform',
  description:
    'A digital democracy platform for civic participation in Pakistan',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body className={inter.className}>
          <AuthProvider>
            <LanguageProvider>
              {children}
              <ReactQueryDevtools
                initialIsOpen={false}
                buttonPosition="bottom-right"
              />
              <Toaster
                position="top-right"
                richColors
                offset={{
                  top: 15,
                }}
                visibleToasts={5}
              />
            </LanguageProvider>
          </AuthProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
