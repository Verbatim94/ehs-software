
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Plus, FileText, Map, Shield } from "lucide-react"

export default function HomePage() {
    return (
        <div className="p-4 space-y-6 max-w-lg mx-auto md:max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Safety Dashboard</h1>
            </div>

            {/* Safety Stats Card */}
            <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                        Giorni senza infortuni
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-green-700 dark:text-green-400">124</div>
                    <p className="text-xs text-muted-foreground mt-1">Ultimo infortunio: 10 Ott 2025</p>
                </CardContent>
            </Card>

            {/* Primary CTA */}
            <Link href="/report/new" className="block">
                <Button className="w-full h-16 text-lg shadow-lg" size="lg">
                    <Plus className="mr-2 h-6 w-6" />
                    Nuova Segnalazione
                </Button>
            </Link>

            {/* Shortcuts Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/reports" className="block">
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-2 text-center">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <span className="font-medium">Le mie segnalazioni</span>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/plans" className="block">
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-2 text-center">
                            <Map className="h-8 w-8 text-orange-500" />
                            <span className="font-medium">Planimetrie</span>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/tools" className="block col-span-2">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="flex items-center p-4 gap-4">
                            <Shield className="h-8 w-8 text-purple-500" />
                            <div className="flex-1 text-left">
                                <span className="font-medium block">Strumenti Utili</span>
                                <span className="text-xs text-muted-foreground">Procedure, Policy, Numeri utili</span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
