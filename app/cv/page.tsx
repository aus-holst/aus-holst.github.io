import type { Metadata } from "next"
import Link from "next/link"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cvData } from "@/lib/data"

export const metadata: Metadata = {
  title: "CV | Miranda Holst, PhD Candidate",
  description:
    "Miranda Holst's curriculum vitae, including education, awards, technical skills, and teaching experience.",
}

export default function CVPage() {
  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Curriculum Vitae</h1>
        <Button asChild className="bg-primary-burnt hover:bg-primary-burnt/90">
          <Link href="#" download>
            <FileDown className="mr-2 h-4 w-4" />
            Download CV (PDF)
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <Accordion type="single" collapsible defaultValue="education" className="w-full">
          <AccordionItem value="education">
            <AccordionTrigger className="text-xl font-semibold">Education</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {cvData.education.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <CardTitle className="text-lg">{item.degree}</CardTitle>
                        <span className="text-sm text-foreground/70">{item.years}</span>
                      </div>
                      <p className="text-primary-burnt font-medium">{item.institution}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="awards">
            <AccordionTrigger className="text-xl font-semibold">Awards & Funding</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {cvData.awards.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <span className="text-sm text-foreground/70">{item.year}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="skills">
            <AccordionTrigger className="text-xl font-semibold">Technical Skills</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {cvData.skills.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {category.items.map((skill, skillIndex) => (
                          <li key={skillIndex} className="text-foreground/80">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="teaching">
            <AccordionTrigger className="text-xl font-semibold">Teaching Experience</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {cvData.teaching.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <CardTitle className="text-lg">{item.course}</CardTitle>
                        <span className="text-sm text-foreground/70">{item.years}</span>
                      </div>
                      <p className="text-primary-burnt font-medium">{item.position}</p>
                      <p className="text-sm text-foreground/70">{item.institution}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
