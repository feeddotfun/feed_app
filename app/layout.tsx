import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { JetBrains_Mono } from 'next/font/google';
import ThemeProvider from '@/components/providers/theme-provider';
import { SolanaWalletProvider } from '@/components/providers/solana-wallet-provider';

import '../styles/globals.css';
import '../styles/solana-wallet.css';
import QueryProvider from '@/components/providers/query-provider';

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
    <html lang="en" className='dark'>
      <body
        className={`${jetBrainsMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <NextTopLoader showSpinner={false} color='#99FF19' />
        <QueryProvider>
            <SolanaWalletProvider>
              {children}
            </SolanaWalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}