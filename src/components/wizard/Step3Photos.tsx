
"use client"

import { useState } from "react"
import { useWizardStore } from "@/lib/store/wizard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload } from "lucide-react"

export default function Step3Photos() {
    const { nextStep, prevStep } = useWizardStore()
    // In a real app, we would store these in the store, but for now local state + mock upload
    const [images, setImages] = useState<{ file: File, preview: string }[]>([])
    const [privacyConfirmed, setPrivacyConfirmed] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            const preview = URL.createObjectURL(file)
            setImages([...images, { file, preview }])
        }
    }

    const removeImage = (index: number) => {
        const newImages = [...images]
        URL.revokeObjectURL(newImages[index].preview)
        newImages.splice(index, 1)
        setImages(newImages)
    }

    const handleNext = () => {
        // Here we would upload the images to Supabase and save the URLs
        // For MVP/Local, we'll just proceed
        nextStep()
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-none border-0 md:border md:shadow-sm">
            <CardHeader>
                <CardTitle>Foto & Allegati</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-muted/30">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-sm text-center text-muted-foreground mb-4">
                        Carica foto dell&apos;evento (max 5).
                    </p>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="max-w-xs"
                        disabled={images.length >= 5}
                    />
                </div>

                {/* Preview Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-background">
                            <img src={img.preview} alt="Preview" className="object-cover w-full h-full" />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Privacy Check */}
                <div className="flex items-start space-x-2 border p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900">
                    <Checkbox
                        id="privacy"
                        checked={privacyConfirmed}
                        onCheckedChange={(c) => setPrivacyConfirmed(!!c)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="privacy" className="font-semibold text-yellow-800 dark:text-yellow-500">
                            Conferma Privacy
                        </Label>
                        <p className="text-sm text-yellow-700 dark:text-yellow-600">
                            Confermo che nelle foto caricate NON sono visibili volti, badge identificativi o targhe di veicoli.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="w-1/3">
                        Indietro
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="w-2/3 h-12 text-lg"
                        disabled={!privacyConfirmed && images.length > 0}
                    >
                        Avanti
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}
