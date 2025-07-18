"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { publications } from "@/lib/data"

export default function PublicationsPageClient() {
  const [yearFilter, setYearFilter] = useState<string>("all")

  const years = Array.from(
    new Set([
      ...publications.published.map((pub) => pub.year.toString()),
      ...publications.preprints.map((pub) => pub.year.toString()),
    ]),
  ).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))

  const filteredPublished =
    yearFilter === "all"
      ? publications.published
      : publications.published.filter((pub) => pub.year.toString() === yearFilter)

  const filteredPreprints =
    yearFilter === "all"
      ? publications.preprints
      : publications.preprints.filter((pub) => pub.year.toString() === yearFilter)

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Publications</h1>

      <div className="flex justify-end mb-6">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="published" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="preprints">Under Review / Preprint</TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          <div className="space-y-6">
            {filteredPublished.length > 0 ? (
              filteredPublished.map((pub) => (
                <div key={pub.id} id={pub.id} className="p-6 border rounded-lg bg-card">
                  <h3 className="text-xl font-semibold mb-2">{pub.title}</h3>
                  <p className="text-foreground/80 mb-2">{pub.authors}</p>
                  <p className="text-sm text-foreground/70 mb-4">
                    <span className="font-medium">{pub.journal}</span> • {pub.year}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-primary-burnt hover:text-primary-burnt/90 bg-transparent"
                  >
                    <Link href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                      DOI: {pub.doi}
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-foreground/70">No publications found for the selected year.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preprints">
          <div className="space-y-6">
            {filteredPreprints.length > 0 ? (
              filteredPreprints.map((pub) => (
                <div key={pub.id} id={pub.id} className="p-6 border rounded-lg bg-card">
                  <h3 className="text-xl font-semibold mb-2">{pub.title}</h3>
                  <p className="text-foreground/80 mb-2">{pub.authors}</p>
                  <p className="text-sm text-foreground/70 mb-4">
                    <span className="font-medium">{pub.journal}</span> • {pub.year}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-primary-burnt hover:text-primary-burnt/90 bg-transparent"
                  >
                    <Link href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                      DOI: {pub.doi}
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-foreground/70">No preprints found for the selected year.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
