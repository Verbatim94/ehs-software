import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import NextLink from "next/link"

interface HomeActionCardProps {
    title: string
    description?: string
    icon: ReactNode
    href: string
    color: string // Tailwind color class (e.g., 'text-blue-500')
    className?: string
}

export function HomeActionCard({ title, description, icon, href, color, className }: HomeActionCardProps) {
    return (
        <NextLink href={href} className="block group">
            <Card className={cn("hover:shadow-lg transition-all duration-300 border-none shadow-md h-full", className)}>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className={cn(
                        "p-4 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors shadow-sm",
                        color
                    )}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{title}</h3>
                        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                    </div>
                </CardContent>
            </Card>
        </NextLink>
    )
}
