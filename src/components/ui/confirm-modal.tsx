"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "danger" | "warning" | "info"
    loading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "info",
    loading = false,
}: ConfirmModalProps) {
    const Icon = {
        danger: AlertCircle,
        warning: AlertTriangle,
        info: HelpCircle,
    }[variant]

    const variantStyles = {
        danger: "text-red-600 bg-red-50 ring-red-500/10",
        warning: "text-amber-600 bg-amber-50 ring-amber-500/10",
        info: "text-blue-600 bg-blue-50 ring-blue-500/10",
    }[variant]

    const buttonVariants = {
        danger: "bg-red-600 hover:bg-red-700 text-white",
        warning: "bg-amber-600 hover:bg-amber-700 text-white",
        info: "bg-blue-600 hover:bg-blue-700 text-white",
    }[variant]

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="p-8">
                    <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-2xl ring-1", variantStyles)}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 pt-1">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-extrabold text-secondary tracking-tight">
                                    {title}
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 font-medium mt-2 leading-relaxed">
                                    {description}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-gray-50/80 backdrop-blur-sm p-6 gap-3 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl font-bold text-gray-500 hover:bg-white hover:text-gray-700 transition-all border border-transparent hover:border-gray-200"
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 h-12 rounded-2xl font-extrabold tracking-wide shadow-lg shadow-primary/20 transition-all active:scale-95",
                            buttonVariants
                        )}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
