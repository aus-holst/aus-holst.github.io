import type React from "react"
import type { Metadata } from "next"
import { Inter, Open_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: "%s | Miranda Holst, PhD Candidate",
    default: "Miranda Holst, PhD Candidate | Molecular Pharmaceutics",
  },
  description:
    "Miranda Holst is a PhD Candidate in Molecular Pharmaceutics at the University of Texas at Austin, specializing in innovative drug delivery systems.",
  openGraph: {
    type: "profile",
    title: "Miranda Holst | PhD Candidate in Molecular Pharmaceutics",
    description: "Researching innovative drug delivery systems at the University of Texas at Austin.",
    url: "https://mirandaholst-phd.vercel.app",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${openSans.variable} min-h-screen flex flex-col font-body`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Navigation />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
