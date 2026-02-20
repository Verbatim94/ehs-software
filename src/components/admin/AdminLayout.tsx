import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
    children: ReactNode
    stats?: ReactNode
    title: string
    action?: ReactNode
    className?: string
}

export function AdminLayout({ children, stats, title, action, className }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 relative pb-16">
            {/* Header Background */}
            <div className="absolute top-0 w-full h-[380px] bg-gradient-to-r from-blue-700 to-indigo-600 z-0" />

            {/* Navigation / Top Bar */}
            <div className="relative z-10 container mx-auto px-4 md:px-8 pt-8">
                <div className="flex justify-between items-center text-white mb-8">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide">{title}</h1>
                        <p className="text-blue-100 text-sm mt-1">Dashboard & Reporting</p>
                    </div>
                    <div>
                        {action}
                    </div>
                </div>

                {/* Stats Section (In Header) */}
                <div className="mb-8">
                    {stats}
                </div>
            </div>

            {/* Main Content (Floating Over Header/Body) */}
            <div className={cn("relative z-10 container mx-auto px-4 md:px-8 mt-[-60px]", className)}>
                {children}
            </div>

            {/* Simple Footer */}
            <div className="container mx-auto px-4 md:px-8 pt-8 text-center">
                <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} SafeMind. Secure & Compliant.
                </p>
            </div>
        </div>
    )
}
