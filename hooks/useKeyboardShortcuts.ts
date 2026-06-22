"use client"

import * as React from "react"

export function useKeyboardShortcuts({
  onOpenSearch,
  onClose,
  enabled = true,
}: {
  onOpenSearch: () => void
  onClose?: () => void
  enabled?: boolean
}) {
  React.useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      const key = typeof event.key === "string" ? event.key.toLowerCase() : ""

      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault()
        onOpenSearch()
      }

      if (key === "escape") {
        onClose?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, onClose, onOpenSearch])
}
