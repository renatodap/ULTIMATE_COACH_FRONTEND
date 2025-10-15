import React from 'react'
import { BottomNav } from '@/components/BottomNav'

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-iron-black text-iron-white">
      <header className="p-4 sticky top-0 z-10 bg-iron-black/80 backdrop-blur border-b border-iron-gray/30">
        <h1 className="text-lg font-semibold">Your Plan</h1>
      </header>
      <main className="flex-1 p-4 pb-24 max-w-screen-sm mx-auto w-full">{children}</main>
      <BottomNav />
    </div>
  )
}
