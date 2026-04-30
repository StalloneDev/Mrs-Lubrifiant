"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ZoomableImageProps {
    src: string | null | undefined
    alt: string
    className?: string
    triggerClassName?: string
    fallbackIcon?: React.ReactNode
}

export function ZoomableImage({ src, alt, className, triggerClassName, fallbackIcon }: ZoomableImageProps) {
    const [open, setOpen] = useState(false)

    const hasImage = src && src.trim() !== ""

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className={cn("cursor-pointer overflow-hidden flex items-center justify-center", triggerClassName)}>
                    {hasImage ? (
                        <img
                            src={src!}
                            alt={alt}
                            className={cn("w-full h-full object-cover transition-transform hover:scale-105", className)}
                        />
                    ) : (
                        fallbackIcon || null
                    )}
                </div>
            </DialogTrigger>
            {hasImage && (
                <DialogContent className="max-w-[95vw] sm:max-w-4xl p-1 bg-transparent border-none shadow-none">
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                        <img
                            src={src!}
                            alt={alt}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </DialogContent>
            )}
        </Dialog>
    )
}
