import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Microscope, Pill, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { researchThemes } from "@/lib/data"

export const metadata: Metadata = {
  title: "Home | Miranda Holst, PhD Candidate",
  description:
    "Miranda Holst is a PhD Candidate in Molecular Pharmaceutics at the University of Texas at Austin, specializing in innovative drug delivery systems.",
}

const iconMap: Record<string, React.ReactNode> = {
  Microscope: <Microscope className="h-8 w-8 text-primary-burnt" />,
  Pill: <Pill className="h-8 w-8 text-primary-burnt" />,
  Droplets: <Droplets className="h-8 w-8 text-primary-burnt" />,
}

export default function Home() {
  return (
    <>
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Innovating Drug Delivery
              </h1>
              <p className="text-lg text-foreground/80">
                Developing next-generation pharmaceutical technologies to enhance therapeutic efficacy and patient
                outcomes. My research focuses on novel delivery systems for proteins, peptides, and other biologics,
                addressing key challenges in modern medicine.
              </p>
              <Button asChild size="lg" className="bg-primary-burnt hover:bg-primary-burnt/90">
                <Link href="/research">Explore My Work</Link>
              </Button>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-primary-burnt">
                  <Image
                    src="/images/miranda-profile.jpg"
                    alt="Miranda Holst"
                    fill
                    className="object-cover object-[center_15%]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-secondary/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Research Focus Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {researchThemes.map((theme) => (
              <Card key={theme.id} className="h-full">
                <CardHeader>
                  <div className="mb-4">{iconMap[theme.icon as keyof typeof iconMap]}</div>
                  <CardTitle>{theme.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
