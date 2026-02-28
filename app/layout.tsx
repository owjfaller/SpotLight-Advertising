import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const AIChatWidget = dynamic(() => import('@/components/AIChatWidget'), { ssr: false })

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SpotLight — Advertising Space Marketplace',
  description:
    'Discover and book unconventional advertising spaces — warehouse walls, vehicle fleets, event signage, and more.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSerif.variable} ${dmSans.variable}`}>
        <Navbar />
        {children}
        <Footer />
        <AIChatWidget />
      </body>
    </html>
  )
}
