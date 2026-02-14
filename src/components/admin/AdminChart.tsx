import { cn } from "@/lib/utils"

interface AdminChartProps {
    data: number[]
    label?: string
    color?: string
    className?: string
}

export function AdminChart({ data, label, color = "bg-blue-500", className }: AdminChartProps) {
    const max = Math.max(...data, 1)

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {label && <div className="text-xs text-muted-foreground mb-2">{label}</div>}
            <div className="flex items-end justify-between space-x-1 h-24 flex-1">
                {data.map((value, index) => {
                    const heightPercentage = (value / max) * 100
                    return (
                        <div
                            key={index}
                            className={cn("w-full rounded-t-sm transition-all hover:opacity-80", color)}
                            style={{ height: `${heightPercentage}%` }}
                            title={`${value}`}
                        >
                            <span className="sr-only">{value}</span>
                        </div>
                    )
                })}
            </div>
            {/* Simple X Axis */}
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>{data.length > 0 ? "1" : ""}</span>
                <span>{Math.ceil(data.length / 2)}</span>
                <span>{data.length}</span>
            </div>
        </div>
    )
}
