import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "Website coming soon. Please check back later.",
}

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container max-w-2xl mx-auto px-4 text-center">
        <div className="space-y-8">
          {/* Coming Soon Message */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Coming Soon</h1>
            <p className="text-lg text-foreground/80 max-w-md mx-auto">
              This website is currently under construction. Please check back soon for updates.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-border/50">
            <p className="text-sm text-foreground/60">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
