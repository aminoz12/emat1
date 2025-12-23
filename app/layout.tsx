import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-matricule - Cartes Grises et Plaques d\'Immatriculation',
  description: 'Votre carte grise & vos plaques d\'immatriculation en 2 minutes. Service d\'immatriculation simplifié en ligne avec habilitation du Ministère de l\'Intérieur.',
  keywords: 'carte grise, plaque immatriculation, immatriculation, véhicule, auto, moto, camion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  )
}





