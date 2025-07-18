import Link from "next/link"
import { BookOpen, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="https://orcid.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary-burnt transition-colors"
              aria-label="ORCID Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </Link>
            <Link
              href="https://scholar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary-burnt transition-colors"
              aria-label="Google Scholar Profile"
            >
              <BookOpen className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary-burnt transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
          <div className="text-sm text-foreground/70">
            © {new Date().getFullYear()} Miranda Holst. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
