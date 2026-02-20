
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error("Login fallito: " + error.message)
                return
            }

            toast.success("Login effettuato!")
            router.push('/')
            router.refresh()
        } catch (error) {
            toast.error("Errore generico")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignUp = async () => {
        setIsLoading(true)
        // For MVP local, we allow signing up to test
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) {
            toast.error("Sign up failed: " + error.message)
        } else {
            toast.success("Controlla la tua email per confermare (o controlla i logs di Supabase locale)")
        }
        setIsLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Card className="w-full max-w-md border-none shadow-2xl bg-white/95 backdrop-blur">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <img src="/images/logo.png" alt="SafeMind Logo" className="h-16 w-auto" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Accedi a SafeMind</CardTitle>
                    <CardDescription>Inserisci le tue credenziali per continuare</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@azienda.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Caricamento..." : "Accedi"}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleSignUp} disabled={isLoading}>
                                Registrati (Test)
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
