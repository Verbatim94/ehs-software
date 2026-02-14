import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown, MoveHorizontal } from "lucide-react"
import { ReactNode } from "react"

interface AdminStatsProps {
    title: string
    value: string | number
    icon: ReactNode
    iconColor?: string // Tailwind class for background, e.g., 'bg-red-500'
    trend?: {
        value: string
        label: string
        direction: 'up' | 'down' | 'neutral'
    }
    className?: string
}

export function AdminStats({ title, value, icon, iconColor = "bg-primary", trend, className }: AdminStatsProps) {
    return (
        <Card className={cn("border-none shadow-lg overflow-hidden", className)}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {value}
                        </h3>
                    </div>
                    <div className={cn("p-3 rounded-full text-white shadow-md", iconColor)}>
                        {icon}
                    </div>
                </div>

                {trend && (
                    <div className="mt-4 flex items-center text-sm">
                        <span className={cn(
                            "font-bold mr-2 flex items-center",
                            trend.direction === 'up' ? "text-green-500" :
                                trend.direction === 'down' ? "text-red-500" : "text-yellow-500"
                        )}>
                            {trend.direction === 'up' && <ArrowUp className="w-4 h-4 mr-1" />}
                            {trend.direction === 'down' && <ArrowDown className="w-4 h-4 mr-1" />}
                            {trend.direction === 'neutral' && <MoveHorizontal className="w-4 h-4 mr-1" />}
                            {trend.value}
                        </span>
                        <span className="text-muted-foreground">
                            {trend.label}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
