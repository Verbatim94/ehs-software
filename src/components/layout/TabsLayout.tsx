
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Map, Settings, PlusCircle } from "lucide-react"

export default function TabsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const tabs = [
        { name: "Home", href: "/", icon: Home },
        { name: "Segnalazioni", href: "/reports", icon: FileText },
        { name: "Planimetrie", href: "/plans", icon: Map },
        { name: "Strumenti", href: "/tools", icon: Settings },
    ]

    return (
        <div className="flex h-screen w-full flex-col bg-muted/40 md:flex-row">
            {/* Sidebar (Desktop) */}
            <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
                <div className="mb-8 flex items-center gap-2 px-2 font-bold text-xl text-primary">
                    <span>SafetyApp</span>
                </div>
                <nav className="flex-1 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = pathname === tab.href
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.name}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pb-16 md:pb-0">
                {children}
            </main>

            {/* Bottom Nav (Mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t bg-background md:hidden">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = pathname === tab.href
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {tab.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Floating Action Button (Mobile) - Positioned above nav */}
            <div className="fixed bottom-20 right-4 md:hidden">
                <Link
                    href="/report/new"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                >
                    <PlusCircle className="h-8 w-8" />
                </Link>
            </div>
        </div>
    )
}
