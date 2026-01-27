"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    // Don't show anything if already installed
    if (isInstalled) return null;

    // Show native install prompt button
    if (showPrompt && deferredPrompt) {
        return (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 mb-4">
                <Smartphone className="h-5 w-5 text-violet-500 flex-shrink-0" />
                <span className="text-sm text-muted-foreground flex-1">
                    Install ThreatIQ for quick access
                </span>
                <Button size="sm" onClick={handleInstall} className="bg-violet-600 hover:bg-violet-700">
                    <Download className="h-4 w-4 mr-1" />
                    Install
                </Button>
                <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    // Fallback hint for browsers without beforeinstallprompt (iOS Safari)
    if (!deferredPrompt && typeof window !== "undefined" && /iPhone|iPad/.test(navigator.userAgent)) {
        return (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border mb-4">
                <Smartphone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                    Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to install
                </span>
            </div>
        );
    }

    return null;
}
