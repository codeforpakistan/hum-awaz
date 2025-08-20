import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/language-provider';
import { AuthProvider } from '@/lib/auth-context';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hum Awaaz | Digital Democracy Platform',
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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster
              position="bottom-center"
              richColors
              offset={{
                top: 15,
              }}
              visibleToasts={1}
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
