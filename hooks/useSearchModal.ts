"use client"

import * as React from "react"

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

export function useSearchModal() {
  const [isOpen, setIsOpen] = React.useState(false)

  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen((value) => !value), [])

  useKeyboardShortcuts({
    onOpenSearch: open,
    onClose: close,
  })

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  }
}
