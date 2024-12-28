import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import ThemeProvider from '@/components/providers/theme-provider';

const jetBrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: 'Feed Fun',
  description: '',
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${jetBrainsMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <NextTopLoader showSpinner={false} />
        <ThemeProvider>
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}