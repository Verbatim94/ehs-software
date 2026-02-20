"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, User, Mail, Save } from "lucide-react"

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userData, setUserData] = useState({
        email: "",
        fullName: "",
    })

    const supabase = createClient()

    useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error) {
                toast.error("Errore nel caricamento del profilo")
                console.error(error)
            } else if (user) {
                setUserData({
                    email: user.email || "",
                    fullName: user.user_metadata?.full_name || "",
                })
            }
            setLoading(false)
        }

        loadProfile()
    }, [supabase])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: userData.fullName }
            })

            if (error) {
                toast.error("Errore durante l'aggiornamento: " + error.message)
            } else {
                toast.success("Profilo aggiornato con successo!")
            }
        } catch (error) {
            toast.error("Si è verificato un errore imprevisto")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <AdminLayout title="Modifica Profilo">
            <div className="max-w-2xl mx-auto">
                <Card className="border-none shadow-md">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Informazioni Personali</CardTitle>
                                <CardDescription>Gestisci i tuoi dati personali e le impostazioni dell'account</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Indirizzo Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={userData.email}
                                            disabled
                                            className="pl-10 bg-slate-50 text-slate-500 border-slate-200"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400">L'email non può essere modificata direttamente per motivi di sicurezza.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nome Completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="Inserisci il tuo nome completo"
                                            value={userData.fullName}
                                            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                                            className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-4 gap-3">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvataggio...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Salva Modifiche
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
