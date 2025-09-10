import { Vote } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-center gap-6 py-8 md:flex-row md:justify-between md:py-6">
        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
          <Vote className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-center text-sm md:text-left">
              &copy; {new Date().getFullYear()} Hum Awaz. All rights reserved.
            </p>
            <p className="text-center text-xs text-muted-foreground md:text-left">
              Built with ❤️ by{" "}
              <Link 
                href="https://codeforpakistan.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
              >
                Code for Pakistan
              </Link>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          <Link href="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
          <Link href="/accessibility" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            Accessibility
          </Link>
          <Link href="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
