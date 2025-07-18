import type { Metadata } from "next"
import ContactPageClient from "./ContactPageClient"

export const metadata: Metadata = {
  title: "Contact | Miranda Holst, PhD Candidate",
  description:
    "Get in touch with Miranda Holst regarding research collaborations, speaking engagements, or other inquiries.",
}

export default function ContactPage() {
  return <ContactPageClient />
}
