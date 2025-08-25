import { Vote } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:py-6">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Vote className="h-6 w-6 text-emerald-600" />
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-center text-sm leading-loose md:text-left">
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
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
          <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-foreground">
            Accessibility
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
