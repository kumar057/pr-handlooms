import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/lib/store'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'PR Handlooms | Luxury Indian Handloom Heritage',
    template: '%s | PR Handlooms',
  },
  description:
    'PR Handlooms — premium handcrafted Indian handloom sarees, fabrics, and heritage textiles. Woven with tradition, designed for the modern connoisseur.',
  keywords: [
    'handloom',
    'sarees',
    'Indian textiles',
    'silk sarees',
    'PR Handlooms',
    'luxury sarees',
    'handcrafted fabrics',
  ],
  generator: 'v0.app',
  openGraph: {
    title: 'PR Handlooms | Luxury Indian Handloom Heritage',
    description:
      'Premium handcrafted Indian handloom sarees, fabrics, and heritage textiles.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F1E5' },
    { media: '(prefers-color-scheme: dark)', color: '#142850' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${jakarta.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            {children}
            <Toaster position="top-center" />
          </StoreProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
