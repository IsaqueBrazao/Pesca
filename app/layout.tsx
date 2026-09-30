import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stardew Fishing - Minijogo de Pesca',
  description: 'Recriação fiel e completa do minijogo de pescaria de Stardew Valley com física autêntica, peixes com comportamentos variados, tesouros e loja do Willy.',
  openGraph: {
    title: 'Stardew Fishing - Minijogo de Pesca',
    description: 'Recriação fiel e completa do minijogo de pescaria de Stardew Valley.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stardew Fishing - Minijogo de Pesca',
    description: 'Recriação fiel e completa do minijogo de pescaria de Stardew Valley.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-[#1a1412] text-[#f7e7c4] antialiased select-none">
        {children}
      </body>
    </html>
  );
}
