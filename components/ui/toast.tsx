"use client"

import * as React from "react"
import { X } from "lucide-react"

type ToastProps = {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  onClose?: (id: string) => void
}

export function Toast({ id = "", title, description, action, onClose }: ToastProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-4 flex items-start gap-3 w-80 animate-in fade-in-50 slide-in-from-bottom-2">
      <div className="flex-1">
        {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      <button
        onClick={() => onClose?.(id)}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
