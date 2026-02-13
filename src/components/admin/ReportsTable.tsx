
"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

interface Incident {
    id: string
    report_number: number
    created_at: string
    category: string
    site: string
    status: string
    description: string
}

interface ReportsTableProps {
    incidents: Incident[]
}

export function ReportsTable({ incidents }: ReportsTableProps) {
    if (!incidents || incidents.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-md bg-muted/10">Nessuna segnalazione trovata.</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Sito</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {incidents.map((incident) => (
                        <TableRow key={incident.id}>
                            <TableCell className="font-medium">#{incident.report_number}</TableCell>
                            <TableCell>{new Date(incident.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    incident.category === 'Injury' ? 'destructive' :
                                        incident.category === 'Hazard' ? 'secondary' : 'outline'
                                }>
                                    {incident.category}
                                </Badge>
                            </TableCell>
                            <TableCell>{incident.site}</TableCell>
                            <TableCell>
                                <div className="capitalize">{incident.status}</div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/reports/${incident.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
