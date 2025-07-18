import type { Metadata } from "next"
import PublicationsPageClient from "./PublicationsPageClient"

export const metadata: Metadata = {
  title: "Publications | Miranda Holst, PhD Candidate",
  description:
    "Browse Miranda Holst's published research papers and preprints in the field of Molecular Pharmaceutics.",
}

export default function PublicationsPage() {
  return <PublicationsPageClient />
}
