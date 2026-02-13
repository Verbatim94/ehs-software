
import { Button } from "@/components/ui/button"
import { FileText, Phone, ShieldAlert } from "lucide-react"

export default function ToolsPage() {
    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Strumenti Utili</h1>

            <Button variant="outline" className="w-full justify-start h-14" asChild>
                <a href="#">
                    <FileText className="mr-4 h-5 w-5" />
                    Politica QHSE
                </a>
            </Button>

            <Button variant="outline" className="w-full justify-start h-14" asChild>
                <a href="#">
                    <ShieldAlert className="mr-4 h-5 w-5" />
                    Procedure di Emergenza
                </a>
            </Button>

            <Button variant="outline" className="w-full justify-start h-14" asChild>
                <a href="#">
                    <Phone className="mr-4 h-5 w-5" />
                    Numeri Utili
                </a>
            </Button>
        </div>
    )
}
