'use client'

import { ReactNode } from 'react'

interface AuthWrapperProps {
  children: ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  // Simply return the children without any authentication
  return <>{children}</>
}