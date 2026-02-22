"use client";

import { Phone, MessageCircle, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { CRISIS_RESOURCES } from "@/lib/config";

interface SafetyBannerProps {
  visible: boolean;
}

export function SafetyBanner({ visible }: SafetyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  return (
    <div className="animate-slide-up mx-4 mb-4 rounded-2xl border-2 border-warmth-dark/30 bg-warmth-50 p-4 shadow-lg dark:border-warmth-dark/50 dark:bg-surface-800">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="mb-2 text-sm font-bold text-warmth-dark dark:text-warmth-300">
            You&apos;re not alone. Help is available right now.
          </h3>
          <div className="space-y-2">
            {CRISIS_RESOURCES.map((resource) => (
              <div
                key={resource.name}
                className="flex items-center gap-2 text-sm"
              >
                {resource.type === "call" ? (
                  <Phone className="h-4 w-4 flex-shrink-0 text-warmth-dark dark:text-warmth-300" />
                ) : resource.type === "text" ? (
                  <MessageCircle className="h-4 w-4 flex-shrink-0 text-warmth-dark dark:text-warmth-300" />
                ) : (
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-warmth-dark dark:text-warmth-300" />
                )}
                <span className="text-surface-700 dark:text-surface-300">
                  <strong>{resource.name}:</strong>{" "}
                  {resource.type === "link" ? (
                    <a
                      href={resource.contact}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-calm-dark underline hover:text-calm dark:text-calm-light"
                    >
                      Find help near you
                    </a>
                  ) : (
                    <span className="font-semibold text-warmth-dark dark:text-warmth-300">
                      {resource.contact}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 flex-shrink-0 rounded-full p-1 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
