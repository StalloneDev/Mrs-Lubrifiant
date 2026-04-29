"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, User, Calendar, MessageSquare, Clock, Navigation } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function VisitDetailDialog({ visit }: { visit: any }) {

    const handleMapClick = () => {
        if (visit.gps_lat && visit.gps_lng) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${visit.gps_lat},${visit.gps_lng}`, '_blank')
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-[#C9A961] font-bold hover:bg-[#C9A961]/10">Voir détails</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 font-sans">
                <DialogHeader className="bg-[#0B1F3A] p-6 pb-8 text-white relative">
                    <DialogTitle className="text-xl font-bold">Détails de la visite</DialogTitle>
                    <div className="absolute -bottom-6 left-6 h-12 w-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-[#0B1F3A]">
                        <MapPin className="h-6 w-6" />
                    </div>
                </DialogHeader>

                <div className="p-6 pt-10 space-y-6">
                    <div>
                        <h3 className="font-black text-xl text-slate-800">{visit.partner?.business_name}</h3>
                        <p className="text-sm font-medium text-slate-500">{visit.partner?.zone}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</p>
                            <p className="text-sm font-bold text-[#0B1F3A]">{format(new Date(visit.visited_at), 'dd MMM yyyy', { locale: fr })}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Heure</p>
                            <p className="text-sm font-bold text-[#0B1F3A]">{format(new Date(visit.visited_at), 'HH:mm')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="text-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Effectuée par</p>
                                <p className="font-bold text-slate-800">{visit.commercial_user?.full_name}</p>
                            </div>
                        </div>

                        <div className="bg-[#0B1F3A]/5 p-4 rounded-xl border border-[#0B1F3A]/10">
                            <p className="text-[10px] uppercase font-bold text-[#0B1F3A]/70 mb-2 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Compte-rendu / Notes</p>
                            <p className="text-sm text-slate-700 italic leading-relaxed">
                                "{visit.notes || 'Aucune note spécifique n\'a été saisie lors de cette visite.'}"
                            </p>
                        </div>

                        {visit.gps_lat && visit.gps_lng && (
                            <Button onClick={handleMapClick} className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-sm font-bold" variant="outline">
                                <Navigation className="mr-2 h-4 w-4" />
                                Ouvrir dans Google Maps
                            </Button>
                        )}

                        {(!visit.gps_lat || !visit.gps_lng) && (
                            <p className="text-xs text-center text-slate-400 italic">Aucune donnée GPS capturée</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
